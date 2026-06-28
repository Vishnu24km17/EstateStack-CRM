import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Avatar,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Download,
  Refresh,
  Star,
  StarBorder,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'
import LeadForm from '../components/LeadForm'
import StatusBadge from '../components/StatusBadge'

function Leads() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    source: '',
    search: '',
  })
  const [openForm, setOpenForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch leads with filters
  const { data, isLoading, refetch } = useQuery(
    ['leads', page, rowsPerPage, filters],
    async () => {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        ...filters,
      }
      const response = await api.get('/leads/leads/', { params })
      return response.data
    },
    { keepPreviousData: true },
  )

  // Delete lead mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/leads/leads/${id}/`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leads')
        setSnackbar({
          open: true,
          message: 'Lead deleted successfully',
          severity: 'success',
        })
        setDeleteDialog(false)
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: 'Failed to delete lead',
          severity: 'error',
        })
      },
    },
  )

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
    setPage(0)
  }

  const handleEdit = (lead) => {
    setSelectedLead(lead)
    setOpenForm(true)
  }

  const handleDelete = (id) => {
    setLeadToDelete(id)
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete)
    }
  }

  const handleView = (id) => {
    navigate(`/leads/${id}`)
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'default',
      medium: 'info',
      high: 'warning',
      urgent: 'error',
    }
    return colors[priority] || 'default'
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Lead Management</Typography>
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
              setSelectedLead(null)
              setOpenForm(true)
            }}
          >
            New Lead
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Search by name, email, company..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal Sent</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() =>
                setFilters({ status: '', priority: '', source: '', search: '' })
              }
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Lead
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Company
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Status
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Priority
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Score
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Created
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            ) : data?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    No leads found. Create your first lead!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data?.results?.map((lead) => (
                <TableRow
                  key={lead.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {lead.first_name[0]}
                        {lead.last_name?.[0] || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {lead.first_name} {lead.last_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {lead.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {lead.company || '-'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {lead.job_title || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lead.priority}
                      size="small"
                      color={getPriorityColor(lead.priority)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {lead.score || 0}
                      </Typography>
                      {lead.score >= 80 ? (
                        <Star sx={{ color: 'secondary.main', fontSize: 16 }} />
                      ) : lead.score >= 60 ? (
                        <StarBorder
                          sx={{ color: 'secondary.main', fontSize: 16 }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => handleView(lead.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(lead)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(lead.id)}
                      >
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.count || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Lead Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <LeadForm
          lead={selectedLead}
          onClose={() => setOpenForm(false)}
          onSuccess={() => {
            queryClient.invalidateQueries('leads')
            setOpenForm(false)
            setSnackbar({
              open: true,
              message: selectedLead
                ? 'Lead updated successfully'
                : 'Lead created successfully',
              severity: 'success',
            })
          }}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lead? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Leads
