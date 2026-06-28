import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  Divider,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
} from '@mui/material'
import {
  Add,
  Delete,
  Edit,
  Visibility,
  FilterList,
  Refresh,
  Person,
  CalendarToday,
  Label,
  Schedule,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'

function Notes() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    type: '',
    search: '',
  })
  const [openForm, setOpenForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    note_type: 'general',
    lead: '',
    scheduled_date: '', // ← ADDED DATE PICKER FIELD
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch notes - ensure we always get an array
  const {
    data: notesData,
    isLoading,
    refetch,
  } = useQuery(
    ['notes', filters],
    async () => {
      const response = await api.get('/notes/notes/', { params: filters })
      console.log('Notes API response:', response.data)

      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter((val) =>
          Array.isArray(val),
        )
        if (possibleArrays.length > 0) {
          return possibleArrays[0]
        }
        return []
      }
      return []
    },
    {
      keepPreviousData: true,
      placeholderData: [],
    },
  )

  // Ensure notes is always an array
  const notes = Array.isArray(notesData) ? notesData : []

  // Fetch leads for dropdown
  const { data: leads } = useQuery('leads-dropdown', async () => {
    const response = await api.get('/leads/leads/?page_size=100')
    return response.data?.results || []
  })

  // Create/Update note mutation
  const saveMutation = useMutation(
    async (data) => {
      if (selectedNote) {
        return api.put(`/notes/notes/${selectedNote.id}/`, data)
      }
      return api.post('/notes/notes/', data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notes')
        setOpenForm(false)
        setSelectedNote(null)
        setFormData({
          title: '',
          content: '',
          note_type: 'general',
          lead: '',
          scheduled_date: '',
        })
        setSnackbar({
          open: true,
          message: selectedNote
            ? 'Note updated successfully'
            : 'Note created successfully',
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
        queryClient.invalidateQueries('notes')
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
      lead: note.lead || '',
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

  // Loading state
  if (isLoading) {
    return <LinearProgress />
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Notes</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedNote(null)
              setFormData({
                title: '',
                content: '',
                note_type: 'general',
                lead: '',
                scheduled_date: '',
              })
              setOpenForm(true)
            }}
          >
            New Note
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Search Notes"
              placeholder="Search by title or content..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Note Type</InputLabel>
              <Select
                value={filters.type}
                label="Note Type"
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="call">Call Notes</MenuItem>
                <MenuItem value="meeting">Meeting Notes</MenuItem>
                <MenuItem value="follow_up">Follow Up</MenuItem>
                <MenuItem value="internal">Internal</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilters({ type: '', search: '' })}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No notes found. Create your first note!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {notes.map((note) => (
            <Grid item xs={12} md={6} lg={4} key={note.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography variant="h6" gutterBottom>
                      {note.title}
                    </Typography>
                    <Chip
                      label={note.note_type}
                      size="small"
                      color={getNoteTypeColor(note.note_type)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {note.content}
                  </Typography>
                  {note.scheduled_date && (
                    <Chip
                      icon={<Schedule fontSize="small" />}
                      label={formatDate(note.scheduled_date)}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}
                    >
                      {note.user_details?.first_name?.[0] || 'U'}
                    </Avatar>
                    <Typography variant="caption">
                      {note.user_details?.first_name}{' '}
                      {note.user_details?.last_name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      •
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(note.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEdit(note)}>
                    <Edit fontSize="small" sx={{ mr: 0.5 }} /> Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Delete fontSize="small" sx={{ mr: 0.5 }} /> Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Note Form Dialog with Date Picker */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNote ? 'Edit Note' : 'Create New Note'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Title Field */}
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

            {/* Content Field */}
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={5}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              margin="normal"
              required
            />

            {/* Note Type Dropdown */}
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

            {/* Related Lead Dropdown */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Related Lead (Optional)</InputLabel>
              <Select
                value={formData.lead}
                label="Related Lead"
                onChange={(e) =>
                  setFormData({ ...formData, lead: e.target.value })
                }
              >
                <MenuItem value="">None</MenuItem>
                {leads?.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name} - {lead.company}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* ⭐ DATE PICKER FIELD - New field for all notes */}
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

      {/* Snackbar */}
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

export default Notes
