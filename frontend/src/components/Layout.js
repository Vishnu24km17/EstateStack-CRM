import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  List as MuiList,
  ListItemButton,
  CircularProgress,
  Paper,
  Button,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Note as NoteIcon,
  Search,
  Settings,
  Logout,
  AccountCircle,
  Notifications,
  SmartToy,
  Business,
  Compare,
  LocationOn,
  Clear,
  Schedule,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import api from '../api/config'

const drawerWidth = 240

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Leads', icon: <People />, path: '/leads' },
  { text: 'Properties', icon: <Business />, path: '/properties' },
  { text: 'Competitors', icon: <Compare />, path: '/competitors' },
  { text: 'Location Search', icon: <LocationOn />, path: '/locations' },
  { text: 'Notes', icon: <NoteIcon />, path: '/notes' },
  { text: 'AI Assistant', icon: <SmartToy />, path: '/ai-assistant' },
]

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      // Fetch follow-up notes
      const response = await api.get('/notes/notes/?note_type=follow_up')
      const notes = Array.isArray(response.data)
        ? response.data
        : response.data?.results || []

      // Filter upcoming follow-ups
      const now = new Date()
      const upcomingFollowups = notes
        .filter((note) => {
          if (!note.scheduled_date) return false
          const scheduledDate = new Date(note.scheduled_date)
          return scheduledDate >= now
        })
        .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
        .slice(0, 10)

      // Get lead names for each note
      const notificationsWithDetails = await Promise.all(
        upcomingFollowups.map(async (note) => {
          try {
            const leadResponse = await api.get(`/leads/leads/${note.lead}/`)
            const lead = leadResponse.data
            return {
              id: note.id,
              title: note.title,
              content: note.content,
              scheduled_date: note.scheduled_date,
              lead_name:
                lead.full_name || lead.first_name + ' ' + lead.last_name,
              lead_id: note.lead,
            }
          } catch {
            return {
              id: note.id,
              title: note.title,
              content: note.content,
              scheduled_date: note.scheduled_date,
              lead_name: 'Unknown Lead',
              lead_id: note.lead,
            }
          }
        }),
      )

      setNotifications(notificationsWithDetails)
      setNotificationCount(notificationsWithDetails.length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setNotificationCount(0)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
    // Mark as read by clearing the count (you can implement proper read status)
    setNotificationCount(0)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleNotificationClick = (leadId) => {
    setNotificationAnchor(null)
    navigate(`/leads/${leadId}`)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      const response = await api.get(`/leads/leads/?search=${searchQuery}`)
      setSearchResults(response.data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSearchResultClick = (leadId) => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
    navigate(`/leads/${leadId}`)
  }

  const getPageTitle = () => {
    const currentItem = menuItems.find(
      (item) => item.path === location.pathname,
    )
    if (currentItem) return currentItem.text
    if (location.pathname === '/profile') return 'Profile'
    if (location.pathname === '/settings') return 'Settings'
    return 'CRM'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <Business sx={{ color: 'secondary.main', fontSize: 32 }} />
          <Typography variant="h6" color="primary" fontWeight="bold">
            EstateStack CRM
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
              borderRadius: 2,
              mx: 1,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                color: location.pathname === item.path ? 'white' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem
          button
          onClick={() => navigate('/settings')}
          selected={location.pathname === '/settings'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '& .MuiListItemIcon-root': {
                color: 'white',
              },
            },
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
          }}
        >
          <ListItemIcon
            sx={{
              color: location.pathname === '/settings' ? 'white' : 'inherit',
            }}
          >
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.dark',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #1a237e 0%, #0d1445 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            {/* Global Search Button in Navbar */}
            <Tooltip title="Search Leads">
              <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                <Search />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" onClick={handleNotificationOpen}>
                <Badge badgeContent={notificationCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Chip
              label={`₹${(Math.random() * 10 + 5).toFixed(1)}Cr Pipeline`}
              size="small"
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'flex' },
              }}
            />

            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose()
                navigate('/profile')
              }}
            >
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>My Profile</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose()
                navigate('/settings')
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
            </MenuItem>
          </Menu>

          {/* Notifications Dropdown */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 400,
                borderRadius: 2,
                mt: 1,
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Upcoming Follow-ups
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {notifications.length} reminder
                {notifications.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Notifications
                  sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                />
                <Typography variant="body2" color="textSecondary">
                  No upcoming follow-ups
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  You're all caught up! 🎉
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                {notifications.map((note) => (
                  <MenuItem
                    key={note.id}
                    onClick={() => handleNotificationClick(note.lead_id)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 0.5,
                      py: 1.5,
                      borderBottom: '1px solid #f5f5f5',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        {note.lead_name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ ml: 3 }}
                    >
                      {note.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ ml: 3 }}
                    >
                      📅 {formatDate(note.scheduled_date)}
                    </Typography>
                  </MenuItem>
                ))}
              </Box>
            )}

            <Box
              sx={{
                p: 1.5,
                borderTop: '1px solid #e0e0e0',
                textAlign: 'center',
              }}
            >
              <Button
                size="small"
                onClick={() => {
                  handleNotificationClose()
                  navigate('/notes')
                }}
              >
                View All Notes
              </Button>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Global Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false)
          setSearchQuery('')
          setSearchResults([])
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2 },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Search color="primary" />
            <Typography variant="h6">Search Leads</Typography>
            <IconButton
              size="small"
              onClick={() => {
                setSearchOpen(false)
                setSearchQuery('')
                setSearchResults([])
              }}
              sx={{ ml: 'auto' }}
            >
              <Clear />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Search by name, email, company, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <Clear
                    onClick={() => setSearchQuery('')}
                    sx={{ cursor: 'pointer', color: 'text.secondary' }}
                  />
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searchLoading}
              sx={{ minWidth: 80 }}
            >
              {searchLoading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Box>

          {searchLoading && (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress />
            </Box>
          )}

          {searchResults.length > 0 && (
            <MuiList sx={{ mt: 2, maxHeight: 350, overflow: 'auto' }}>
              {searchResults.map((lead) => (
                <ListItemButton
                  key={lead.id}
                  onClick={() => handleSearchResultClick(lead.id)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'primary.light' },
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}
                    >
                      {lead.first_name?.[0]}
                      {lead.last_name?.[0]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lead.first_name} ${lead.last_name}`}
                    secondary={
                      <>
                        {lead.email && <span>{lead.email} • </span>}
                        {lead.company && <span>{lead.company}</span>}
                        {lead.status && (
                          <Chip
                            label={lead.status}
                            size="small"
                            sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                            color={
                              lead.status === 'won'
                                ? 'success'
                                : lead.status === 'lost'
                                  ? 'error'
                                  : 'default'
                            }
                          />
                        )}
                      </>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItemButton>
              ))}
            </MuiList>
          )}

          {searchResults.length === 0 && searchQuery && !searchLoading && (
            <Box textAlign="center" py={3}>
              <Typography variant="body2" color="textSecondary">
                No leads found for "{searchQuery}"
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Try a different search term
              </Typography>
            </Box>
          )}

          {!searchQuery && !searchLoading && searchResults.length === 0 && (
            <Box textAlign="center" py={3}>
              <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Search for leads by name, email, company, or phone
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Press Enter or click Search
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default Layout
