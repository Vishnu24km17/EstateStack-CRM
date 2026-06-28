import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import {
  Search as SearchIcon,
  Clear,
  People,
  Note,
  Business,
  LocationOn,
  Phone,
  Email,
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../api/config'
import StatusBadge from '../components/StatusBadge'

function Search() {
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tabValue, setTabValue] = useState(0)

  const { data, isLoading, error, refetch } = useQuery(
    ['search', searchTerm],
    async () => {
      if (!searchTerm) return null
      const response = await api.get('/leads/leads/', {
        params: { search: searchTerm, page_size: 50 },
      })
      return response.data
    },
    { enabled: !!searchTerm },
  )

  const handleSearch = () => {
    setSearchTerm(query)
  }

  const handleClear = () => {
    setQuery('')
    setSearchTerm('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const getFilteredResults = () => {
    if (!data?.results) return []
    if (tabValue === 0) return data.results // All
    if (tabValue === 1)
      return data.results.filter(
        (l) => l.status === 'new' || l.status === 'contacted',
      )
    if (tabValue === 2)
      return data.results.filter(
        (l) => l.status === 'qualified' || l.status === 'proposal',
      )
    if (tabValue === 3) return data.results.filter((l) => l.status === 'won')
    return data.results
  }

  const filteredResults = getFilteredResults()

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Global Search
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, company, phone, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {query && (
                  <IconButton onClick={handleClear} size="small">
                    <Clear />
                  </IconButton>
                )}
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!query}
                  sx={{ ml: 1 }}
                >
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {searchTerm && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="textSecondary">
              Found {data?.count || 0} results for "{searchTerm}"
            </Typography>
            {isLoading && <CircularProgress size={20} />}
          </Box>
        )}
      </Paper>

      {/* Results */}
      {searchTerm && !isLoading && data && (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`All (${data.count || 0})`} />
              <Tab
                label={`New/Contacted (${data.results?.filter((l) => l.status === 'new' || l.status === 'contacted').length || 0})`}
              />
              <Tab
                label={`Qualified/Proposal (${data.results?.filter((l) => l.status === 'qualified' || l.status === 'proposal').length || 0})`}
              />
              <Tab
                label={`Won (${data.results?.filter((l) => l.status === 'won').length || 0})`}
              />
            </Tabs>
          </Paper>

          {/* Results Grid */}
          {filteredResults.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No results found in this category.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredResults.map((lead) => (
                <Grid item xs={12} key={lead.id}>
                  <Card sx={{ '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 56,
                                height: 56,
                              }}
                            >
                              {lead.first_name[0]}
                              {lead.last_name?.[0] || ''}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">
                                {lead.first_name} {lead.last_name}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {lead.company || 'No company'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <List dense>
                            <ListItem>
                              <ListItemAvatar>
                                <Phone fontSize="small" color="action" />
                              </ListItemAvatar>
                              <ListItemText primary={lead.phone} />
                            </ListItem>
                            <ListItem>
                              <ListItemAvatar>
                                <Email fontSize="small" color="action" />
                              </ListItemAvatar>
                              <ListItemText primary={lead.email} />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <List dense>
                            <ListItem>
                              <ListItemAvatar>
                                <Business fontSize="small" color="action" />
                              </ListItemAvatar>
                              <ListItemText primary={lead.job_title || 'N/A'} />
                            </ListItem>
                            <ListItem>
                              <ListItemAvatar>
                                <LocationOn fontSize="small" color="action" />
                              </ListItemAvatar>
                              <ListItemText
                                primary={lead.project_location || 'N/A'}
                              />
                            </ListItem>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-end"
                            gap={1}
                          >
                            <StatusBadge status={lead.status} />
                            <Box display="flex" gap={1}>
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
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to search. Please try again.
        </Alert>
      )}

      {!searchTerm && !isLoading && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Enter a search term to find leads, companies, or contacts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try searching by name, email, phone number, company, or location
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default Search
