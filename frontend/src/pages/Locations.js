import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material'
import {
  Search as SearchIcon,
  LocationOn,
  Clear,
  Map as MapIcon,
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import api from '../api/config'

function Locations() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, error, refetch } = useQuery(
    ['places', searchTerm],
    async () => {
      if (!searchTerm) return null
      try {
        const response = await api.get(
          `/integrations/places/search/?query=${encodeURIComponent(searchTerm)}`,
        )
        console.log('API Response:', response.data)
        return response.data
      } catch (err) {
        console.error('API Error:', err)
        throw err
      }
    },
    { enabled: !!searchTerm, retry: false },
  )

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchTerm(searchQuery)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchTerm('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const results = data?.results || []
  const errorMessage = data?.error || error?.message || ''

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Location Search
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Search for locations using OpenStreetMap (Free)
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search for cities, landmarks, areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              ),
              endAdornment: searchQuery && (
                <Clear
                  onClick={handleClear}
                  sx={{ cursor: 'pointer', color: 'text.secondary' }}
                />
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SearchIcon />
            }
            sx={{ minWidth: 120 }}
          >
            Search
          </Button>
        </Box>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, display: 'block' }}
        >
          Powered by OpenStreetMap • Free and open source
        </Typography>
      </Paper>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>Error:</strong> {errorMessage}
          <Button
            onClick={() => refetch()}
            sx={{ ml: 2 }}
            variant="outlined"
            size="small"
          >
            Retry
          </Button>
        </Alert>
      )}

      {!searchTerm && !isLoading && !errorMessage && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MapIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Search for places using OpenStreetMap
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Find locations, get details, and enrich your lead data
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 2, display: 'block' }}
          >
            Completely free • No API key required • No billing
          </Typography>
        </Paper>
      )}

      {searchTerm && !isLoading && !errorMessage && results.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No results found for "{searchTerm}"
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Try a different search term or be more specific
          </Typography>
        </Paper>
      )}

      {results.length > 0 && (
        <Grid container spacing={2}>
          {results.map((place, index) => (
            <Grid item xs={12} md={6} key={place.place_id || index}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography variant="h6">{place.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {place.address || 'No address available'}
                      </Typography>
                    </Box>
                    {place.type && (
                      <Chip label={place.type} size="small" color="primary" />
                    )}
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
                    {place.city && (
                      <Chip
                        label={`City: ${place.city}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {place.state && (
                      <Chip
                        label={`State: ${place.state}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {place.country && (
                      <Chip
                        label={`Country: ${place.country}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {place.lat && place.lon && (
                    <Box mt={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LocationOn />}
                        onClick={() => {
                          window.open(
                            `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}`,
                            '_blank',
                          )
                        }}
                      >
                        View on OpenStreetMap
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Locations
