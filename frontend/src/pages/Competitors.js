import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  AttachMoney,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'

function Competitors() {
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const [formData, setFormData] = useState({
    name: '',
    project_name: '',
    location: '',
    price_range: '',
    status: '',
    strengths: '',
    weaknesses: '',
    our_advantage: '',
    website: '',
  })

  const {
    data: competitorsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    'competitors',
    async () => {
      try {
        const response = await api.get('/competitors/')
        console.log('Competitors API response:', response.data)

        // Handle different response formats
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
      } catch (error) {
        console.error('Error fetching competitors:', error)
        return []
      }
    },
    {
      keepPreviousData: true,
      placeholderData: [],
    },
  )

  // Ensure competitors is always an array
  const competitors = Array.isArray(competitorsData) ? competitorsData : []

  const saveMutation = useMutation(
    async (data) => {
      if (selectedCompetitor) {
        return api.put(`/competitors/${selectedCompetitor.id}/`, data)
      }
      return api.post('/competitors/', data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('competitors')
        setOpenDialog(false)
        setSelectedCompetitor(null)
        setFormData({
          name: '',
          project_name: '',
          location: '',
          price_range: '',
          status: '',
          strengths: '',
          weaknesses: '',
          our_advantage: '',
          website: '',
        })
        setSnackbar({
          open: true,
          message: 'Competitor saved!',
          severity: 'success',
        })
      },
    },
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/competitors/${id}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('competitors')
        setSnackbar({
          open: true,
          message: 'Competitor deleted!',
          severity: 'success',
        })
      },
    },
  )

  const handleSubmit = () => {
    saveMutation.mutate(formData)
  }

  const handleEdit = (competitor) => {
    setSelectedCompetitor(competitor)
    setFormData(competitor)
    setOpenDialog(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this competitor?')) {
      deleteMutation.mutate(id)
    }
  }

  const getAdvantageScore = (competitor) => {
    const strengths = competitor.strengths?.split(',').length || 0
    const weaknesses = competitor.weaknesses?.split(',').length || 0
    const advantage = competitor.our_advantage?.length || 0
    return Math.min(100, (strengths * 20 + advantage * 10) / (weaknesses + 1))
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Failed to load competitors. Please try again.
          <Button onClick={() => refetch()} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontFamily: 'Playfair Display, serif' }}>
          Competitor Analysis ({competitors.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedCompetitor(null)
            setOpenDialog(true)
          }}
          sx={{
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
          }}
        >
          Add Competitor
        </Button>
      </Box>

      {competitors.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No competitors added yet. Add your first competitor to track them!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {competitors.map((competitor) => {
            const score = getAdvantageScore(competitor)
            return (
              <Grid item xs={12} md={6} key={competitor.id}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {competitor.name}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary">
                          {competitor.project_name}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Score: ${Math.round(score)}%`}
                        color={
                          score > 70
                            ? 'success'
                            : score > 50
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} my={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">
                          {competitor.location}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2">
                          {competitor.price_range}
                        </Typography>
                      </Box>
                      <Chip
                        label={competitor.status}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          sx={{
                            p: 1.5,
                            textAlign: 'center',
                            bgcolor: 'success.light',
                          }}
                        >
                          <Typography variant="caption">Strengths</Typography>
                          <Typography variant="body2">
                            {competitor.strengths?.split(',').length || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          sx={{
                            p: 1.5,
                            textAlign: 'center',
                            bgcolor: 'error.light',
                          }}
                        >
                          <Typography variant="caption">Weaknesses</Typography>
                          <Typography variant="body2">
                            {competitor.weaknesses?.split(',').length || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper
                          sx={{
                            p: 1.5,
                            textAlign: 'center',
                            bgcolor: 'info.light',
                          }}
                        >
                          <Typography variant="caption">
                            Our Advantage
                          </Typography>
                          <Typography variant="body2">
                            {competitor.our_advantage?.split(',').length || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Our Advantage:</strong>{' '}
                        {competitor.our_advantage}
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="flex-end"
                      gap={1}
                      mt={2}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEdit(competitor)}
                      >
                        <Edit fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleDelete(competitor.id)}
                      >
                        <Delete fontSize="small" />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCompetitor ? 'Edit Competitor' : 'Add Competitor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.project_name}
                onChange={(e) =>
                  setFormData({ ...formData, project_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price Range"
                value={formData.price_range}
                onChange={(e) =>
                  setFormData({ ...formData, price_range: e.target.value })
                }
                placeholder="e.g., ₹2-3 Cr"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                placeholder="e.g., Under Construction, Completed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Strengths (comma separated)"
                value={formData.strengths}
                onChange={(e) =>
                  setFormData({ ...formData, strengths: e.target.value })
                }
                placeholder="e.g., Prime Location, Premium Amenities"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Weaknesses (comma separated)"
                value={formData.weaknesses}
                onChange={(e) =>
                  setFormData({ ...formData, weaknesses: e.target.value })
                }
                placeholder="e.g., Higher Price, Delayed Possession"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Our Advantage (comma separated)"
                value={formData.our_advantage}
                onChange={(e) =>
                  setFormData({ ...formData, our_advantage: e.target.value })
                }
                placeholder="e.g., Better Location, Lower Price, Premium Amenities"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCompetitor ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default Competitors
