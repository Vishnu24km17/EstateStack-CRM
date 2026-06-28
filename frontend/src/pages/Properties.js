import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  AttachMoney,
  Bed,
  Bathtub,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api/config'

// Property images
const getPropertyImage = (type) => {
  const images = {
    villa:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop',
    apartment:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
    plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    commercial:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    penthouse:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
  }
  return images[type] || images.apartment
}

function Properties() {
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [tabValue, setTabValue] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    property_type: 'apartment',
    status: 'available',
    price: '',
    area: '',
    location: '',
    city: 'Bengaluru',
    bedrooms: 2,
    bathrooms: 2,
    description: '',
    amenities: [],
    possession_date: '',
  })

  const {
    data: propertiesData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    'properties',
    async () => {
      try {
        const response = await api.get('/properties/')
        if (Array.isArray(response.data)) {
          return response.data
        } else if (response.data && Array.isArray(response.data.results)) {
          return response.data.results
        }
        return []
      } catch (error) {
        console.error('Error fetching properties:', error)
        return []
      }
    },
    {
      keepPreviousData: true,
      placeholderData: [],
    },
  )

  const properties = Array.isArray(propertiesData) ? propertiesData : []

  const saveMutation = useMutation(
    async (data) => {
      if (selectedProperty) {
        return api.put(`/properties/${selectedProperty.id}/`, data)
      }
      return api.post('/properties/', data)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties')
        setOpenDialog(false)
        setSelectedProperty(null)
        setFormData({
          name: '',
          property_type: 'apartment',
          status: 'available',
          price: '',
          area: '',
          location: '',
          city: 'Bengaluru',
          bedrooms: 2,
          bathrooms: 2,
          description: '',
          amenities: [],
          possession_date: '',
        })
        setSnackbar({
          open: true,
          message: selectedProperty ? 'Property updated!' : 'Property added!',
          severity: 'success',
        })
      },
    },
  )

  const deleteMutation = useMutation((id) => api.delete(`/properties/${id}/`), {
    onSuccess: () => {
      queryClient.invalidateQueries('properties')
      setSnackbar({
        open: true,
        message: 'Property deleted!',
        severity: 'success',
      })
    },
  })

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      booked: 'warning',
      sold: 'error',
      under_construction: 'info',
    }
    return colors[status] || 'default'
  }

  const getTypeIcon = (type) => {
    const icons = {
      villa: '🏠',
      apartment: '🏢',
      plot: '📐',
      commercial: '🏗️',
      penthouse: '🏛️',
    }
    return icons[type] || '🏠'
  }

  const propertyTypes = [
    'villa',
    'apartment',
    'plot',
    'commercial',
    'penthouse',
  ]
  const cities = [
    'Bengaluru',
    'Dubai',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Chennai',
  ]
  const amenitiesList = [
    'Swimming Pool',
    'Gym',
    'Parking',
    'Garden',
    'Security',
    'Club House',
    'Elevator',
    'WiFi',
  ]

  const handleSubmit = () => {
    saveMutation.mutate(formData)
  }

  const handleEdit = (property) => {
    setSelectedProperty(property)
    setFormData(property)
    setOpenDialog(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this property?')) {
      deleteMutation.mutate(id)
    }
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
          Failed to load properties. Please try again.
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
          Properties ({properties.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedProperty(null)
            setOpenDialog(true)
          }}
          sx={{
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
          }}
        >
          Add Property
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`All (${properties.length})`} />
          <Tab
            label={`Available (${properties.filter((p) => p.status === 'available').length})`}
          />
          <Tab
            label={`Booked (${properties.filter((p) => p.status === 'booked').length})`}
          />
          <Tab
            label={`Under Construction (${properties.filter((p) => p.status === 'under_construction').length})`}
          />
        </Tabs>
      </Paper>

      {properties.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No properties found. Add your first property!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardMedia
                  sx={{
                    height: 200,
                    position: 'relative',
                    backgroundImage: `url(${getPropertyImage(property.property_type)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      pt: 4,
                    }}
                  >
                    <Chip
                      label={property.status}
                      size="small"
                      color={getStatusColor(property.status)}
                      sx={{ color: 'white' }}
                    />
                    <Chip
                      label={`${getTypeIcon(property.property_type)} ${property.property_type}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    />
                  </Box>
                </CardMedia>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    {property.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {property.location}, {property.city}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AttachMoney fontSize="small" color="secondary" />
                      <Typography variant="h6" color="secondary.main">
                        ₹{parseInt(property.price).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        icon={<Bed />}
                        label={property.bedrooms}
                        size="small"
                      />
                      <Chip
                        icon={<Bathtub />}
                        label={property.bathrooms}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {property.area} •{' '}
                    {property.amenities?.slice(0, 3).join(', ') || ''}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEdit(property)}
                    >
                      <Edit fontSize="small" />
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Delete fontSize="small" />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog - same as before */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProperty ? 'Edit Property' : 'Add New Property'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.property_type}
                  label="Type"
                  onChange={(e) =>
                    setFormData({ ...formData, property_type: e.target.value })
                  }
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                  <MenuItem value="under_construction">
                    Under Construction
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Area"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                placeholder="e.g., 2500 sq ft"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={formData.city}
                  label="City"
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bedrooms: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bathrooms: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Possession Date"
                type="date"
                value={formData.possession_date}
                onChange={(e) =>
                  setFormData({ ...formData, possession_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedProperty ? 'Update' : 'Add'}
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

export default Properties
