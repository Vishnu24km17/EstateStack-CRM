import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  Alert,
  Snackbar,
  Tooltip,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  Phone,
  Email,
  LocationOn, // ← Only ONE LocationOn
  Business,
  AttachMoney,
  CalendarToday,
  Person,
  Notes as NotesIcon,
  Comment,
  SmartToy,
  Refresh,
  CheckCircle,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'
import StatusBadge from '../components/StatusBadge'
import ActivityTimeline from '../components/ActivityTimeline'
import NoteList from '../components/NoteList'
import AIInsights from '../components/AIInsights'

function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [statusDialog, setStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch lead details
  const {
    data: lead,
    isLoading,
    refetch,
  } = useQuery(['lead', id], async () => {
    const response = await api.get(`/leads/leads/${id}/`)
    return response.data
  })

  // Update status mutation
  const updateStatusMutation = useMutation(
    async ({ status, notes }) => {
      const response = await api.post(`/leads/leads/${id}/update_status/`, {
        status,
        notes,
      })
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lead', id])
        setStatusDialog(false)
        setSnackbar({
          open: true,
          message: 'Status updated successfully',
          severity: 'success',
        })
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to update status',
          severity: 'error',
        })
      },
    },
  )

  // AI Enrich mutation
  const enrichMutation = useMutation(
    async () => {
      const response = await api.post(`/ai/enrich/${id}/`)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lead', id])
        setSnackbar({
          open: true,
          message: 'Lead enriched with AI successfully',
          severity: 'success',
        })
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to enrich lead',
          severity: 'error',
        })
      },
    },
  )

  // Location Enrich mutation
  const enrichLocationMutation = useMutation(
    async () => {
      const response = await api.post(`/integrations/enrich-location/${id}/`)
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lead', id])
        setSnackbar({
          open: true,
          message: 'Location enriched with Google Places!',
          severity: 'success',
        })
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to enrich location',
          severity: 'error',
        })
      },
    },
  )

  const handleStatusUpdate = () => {
    updateStatusMutation.mutate({ status: newStatus, notes: statusNote })
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (isLoading) {
    return <LinearProgress />
  }

  if (!lead) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6">Lead not found</Typography>
        <Button onClick={() => navigate('/leads')}>Back to Leads</Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <IconButton onClick={() => navigate('/leads')}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h4">
                {lead.first_name} {lead.last_name}
              </Typography>
              <StatusBadge status={lead.status} />
              <Chip
                label={lead.priority}
                size="small"
                color={
                  lead.priority === 'urgent'
                    ? 'error'
                    : lead.priority === 'high'
                      ? 'warning'
                      : 'default'
                }
              />
              <Chip
                label={`Score: ${lead.score || 0}`}
                size="small"
                color={
                  lead.score >= 80
                    ? 'success'
                    : lead.score >= 60
                      ? 'warning'
                      : 'default'
                }
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              Created: {new Date(lead.created_at).toLocaleDateString()} | Last
              Contacted:{' '}
              {lead.last_contacted
                ? new Date(lead.last_contacted).toLocaleDateString()
                : 'Never'}
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="AI Enrich">
              <Button
                variant="outlined"
                startIcon={<SmartToy />}
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isLoading}
              >
                {enrichMutation.isLoading ? 'Enriching...' : 'AI Enrich'}
              </Button>
            </Tooltip>
            <Tooltip title="Enrich Location with Google Places">
              <Button
                variant="outlined"
                startIcon={<LocationOn />}
                onClick={() => enrichLocationMutation.mutate()}
                disabled={
                  enrichLocationMutation.isLoading || !lead?.project_location
                }
              >
                {enrichLocationMutation.isLoading
                  ? 'Enriching...'
                  : 'Enrich Location'}
              </Button>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/leads/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => {
                setNewStatus(lead.status)
                setStatusDialog(true)
              }}
            >
              Update Status
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Lead Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.first_name + ' ' + lead.last_name}
                    secondary="Full Name"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText primary={lead.email} secondary="Email" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone />
                  </ListItemIcon>
                  <ListItemText primary={lead.phone} secondary="Phone" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.company || 'Not specified'}
                    secondary="Company"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.address || 'Not specified'}
                    secondary="Address"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.project_type || 'Not specified'}
                    secondary="Project Type"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.project_location || 'Not specified'}
                    secondary="Project Location"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      lead.budget_min && lead.budget_max
                        ? `₹${lead.budget_min.toLocaleString()} - ₹${lead.budget_max.toLocaleString()}`
                        : 'Not specified'
                    }
                    secondary="Budget Range"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary={lead.possession_timeline || 'Not specified'}
                    secondary="Project Timeline"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      lead.assigned_to_details?.full_name || 'Unassigned'
                    }
                    secondary="Assigned To"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Activities" icon={<NotesIcon />} />
          <Tab label="Notes" icon={<Comment />} />
          <Tab label="AI Insights" icon={<SmartToy />} />
        </Tabs>
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <ActivityTimeline leadId={id} />}
          {tabValue === 1 && <NoteList leadId={id} />}
          {tabValue === 2 && <AIInsights leadId={id} />}
        </Box>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog}
        onClose={() => setStatusDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Lead Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal Sent</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes (optional)"
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              margin="normal"
              placeholder="Add any notes about this status change..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? 'Updating...' : 'Update'}
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

export default LeadDetail
