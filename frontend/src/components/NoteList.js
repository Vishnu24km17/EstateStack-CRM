import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Person,
  CalendarToday,
  Schedule,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'

function NoteList({ leadId }) {
  const queryClient = useQueryClient()
  const [openForm, setOpenForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    note_type: 'general',
    scheduled_date: '',
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch notes
  const { data: notes, isLoading } = useQuery(['notes', leadId], async () => {
    const response = await api.get(`/notes/notes/?lead_id=${leadId}`)
    if (Array.isArray(response.data)) {
      return response.data
    } else if (response.data?.results) {
      return response.data.results
    }
    return []
  })

  const notesList = Array.isArray(notes) ? notes : []

  // Create/Update note mutation
  const saveMutation = useMutation(
    async (data) => {
      if (selectedNote) {
        return api.put(`/notes/notes/${selectedNote.id}/`, data)
      }
      return api.post('/notes/notes/', { ...data, lead: leadId })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', leadId])
        setOpenForm(false)
        setSelectedNote(null)
        setFormData({
          title: '',
          content: '',
          note_type: 'general',
          scheduled_date: '',
        })
        setSnackbar({
          open: true,
          message: selectedNote
            ? 'Note updated successfully'
            : 'Note added successfully',
          severity: 'success',
        })
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to save note',
          severity: 'error',
        })
      },
    },
  )

  // Delete note mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/notes/notes/${id}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', leadId])
        setSnackbar({
          open: true,
          message: 'Note deleted successfully',
          severity: 'success',
        })
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to delete note',
          severity: 'error',
        })
      },
    },
  )

  const handleEdit = (note) => {
    setSelectedNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      note_type: note.note_type,
      scheduled_date: note.scheduled_date || '',
    })
    setOpenForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = () => {
    saveMutation.mutate(formData)
  }

  const getNoteTypeColor = (type) => {
    const colors = {
      general: 'default',
      call: 'primary',
      meeting: 'secondary',
      follow_up: 'warning',
      internal: 'info',
    }
    return colors[type] || 'default'
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Notes ({notesList.length})</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedNote(null)
            setFormData({
              title: '',
              content: '',
              note_type: 'general',
              scheduled_date: '',
            })
            setOpenForm(true)
          }}
        >
          Add Note
        </Button>
      </Box>

      {notesList.length === 0 ? (
        <Typography color="textSecondary" textAlign="center" py={3}>
          No notes for this lead yet
        </Typography>
      ) : (
        notesList.map((note) => (
          <Card key={note.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {note.title}
                    </Typography>
                    <Chip
                      label={note.note_type}
                      size="small"
                      color={getNoteTypeColor(note.note_type)}
                    />
                    {note.scheduled_date && (
                      <Chip
                        icon={<Schedule fontSize="small" />}
                        label={formatDate(note.scheduled_date)}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {note.content}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton size="small" onClick={() => handleEdit(note)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="caption">
                    {note.user_details?.first_name}{' '}
                    {note.user_details?.last_name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="caption">
                    {new Date(note.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Note Form Dialog with Date Picker for ALL notes */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Note Type</InputLabel>
              <Select
                value={formData.note_type}
                label="Note Type"
                onChange={(e) =>
                  setFormData({ ...formData, note_type: e.target.value })
                }
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="call">Call Notes</MenuItem>
                <MenuItem value="meeting">Meeting Notes</MenuItem>
                <MenuItem value="follow_up">Follow Up</MenuItem>
                <MenuItem value="internal">Internal</MenuItem>
              </Select>
            </FormControl>

            {/* Date picker for ALL notes */}
            <TextField
              fullWidth
              label="Schedule Date (Optional)"
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              margin="normal"
              InputLabelProps={{ shrink: true }}
              helperText="Set a date for this note (useful for follow-ups and reminders)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.title || !formData.content || saveMutation.isLoading
            }
          >
            {saveMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default NoteList
