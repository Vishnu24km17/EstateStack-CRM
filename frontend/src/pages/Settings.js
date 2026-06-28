import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  createTheme,
  ThemeProvider,
} from '@mui/material'
import {
  Notifications,
  DarkMode,
  Language,
  Security,
  DataUsage,
  Delete,
  Refresh,
  Save,
  ColorLens,
} from '@mui/icons-material'
import { useSettings } from '../context/SettingsContext'

function Settings() {
  const { settings, updateSettings, resetSettings, clearAllData } =
    useSettings()
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [selectedCategory, setSelectedCategory] = useState('notifications')

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // Handle notification changes
  const handleNotificationChange = (event) => {
    updateSettings('notifications', {
      [event.target.name]: event.target.checked,
    })
    showSnackbar('Notification preference updated!', 'success')
  }

  // Handle appearance changes
  const handleAppearanceChange = (event) => {
    updateSettings('appearance', {
      [event.target.name]: event.target.checked,
    })
    showSnackbar('Appearance updated!', 'success')
  }

  // Handle language changes
  const handleLanguageChange = (field, value) => {
    updateSettings('language', { [field]: value })
    showSnackbar('Language preference updated!', 'success')
  }

  // Handle privacy changes
  const handlePrivacyChange = (event) => {
    updateSettings('privacy', {
      [event.target.name]: event.target.checked,
    })
    showSnackbar('Privacy setting updated!', 'success')
  }

  // Handle color change
  const handleColorChange = (event) => {
    updateSettings('appearance', { primaryColor: event.target.value })
    showSnackbar('Primary color updated!', 'success')
  }

  // Handle font size change
  const handleFontSizeChange = (event, value) => {
    updateSettings('appearance', { fontSize: value })
  }

  // Handle save all
  const handleSaveAll = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
    showSnackbar('All settings saved successfully!', 'success')
  }

  // Handle reset
  const handleReset = () => {
    if (
      window.confirm('Are you sure you want to reset all settings to default?')
    ) {
      resetSettings()
      showSnackbar('Settings reset to default!', 'info')
    }
  }

  // Handle clear data
  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all your data? This action cannot be undone.',
      )
    ) {
      clearAllData()
    }
  }

  // Get current settings
  const notificationSettings = settings.notifications || {}
  const appearanceSettings = settings.appearance || {}
  const languageSettings = settings.language || {}
  const privacySettings = settings.privacy || {}

  // Color options
  const colorOptions = {
    blue: '#1a237e',
    green: '#2e7d32',
    purple: '#7b1fa2',
    orange: '#e65100',
    red: '#c62828',
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Customize your CRM experience and application preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Left Sidebar - Settings Categories */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List component="nav" dense>
              <ListItem
                button
                selected={selectedCategory === 'notifications'}
                onClick={() => setSelectedCategory('notifications')}
              >
                <ListItemIcon>
                  <Notifications fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
              <ListItem
                button
                selected={selectedCategory === 'appearance'}
                onClick={() => setSelectedCategory('appearance')}
              >
                <ListItemIcon>
                  <DarkMode fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Appearance" />
              </ListItem>
              <ListItem
                button
                selected={selectedCategory === 'language'}
                onClick={() => setSelectedCategory('language')}
              >
                <ListItemIcon>
                  <Language fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Language & Region" />
              </ListItem>
              <ListItem
                button
                selected={selectedCategory === 'privacy'}
                onClick={() => setSelectedCategory('privacy')}
              >
                <ListItemIcon>
                  <Security fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Privacy & Security" />
              </ListItem>
              <ListItem
                button
                selected={selectedCategory === 'data'}
                onClick={() => setSelectedCategory('data')}
              >
                <ListItemIcon>
                  <DataUsage fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Data Management" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Right Content - Settings Panels */}
        <Grid item xs={12} md={9}>
          {/* Notifications Settings */}
          {selectedCategory === 'notifications' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Choose what notifications you want to receive
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.emailNotifications || false}
                    onChange={handleNotificationChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Receive email updates about your leads and tasks
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.leadAlerts || false}
                    onChange={handleNotificationChange}
                    name="leadAlerts"
                    color="primary"
                  />
                }
                label="Lead Alerts"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Get notified when new leads are assigned to you
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.taskReminders || false}
                    onChange={handleNotificationChange}
                    name="taskReminders"
                    color="primary"
                  />
                }
                label="Task Reminders"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Receive reminders for upcoming tasks and follow-ups
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.systemUpdates || false}
                    onChange={handleNotificationChange}
                    name="systemUpdates"
                    color="primary"
                  />
                }
                label="System Updates"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Get notified about new features and system updates
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={notificationSettings.marketingEmails || false}
                    onChange={handleNotificationChange}
                    name="marketingEmails"
                    color="primary"
                  />
                }
                label="Marketing & Promotional Emails"
              />
            </Paper>
          )}

          {/* Appearance Settings */}
          {selectedCategory === 'appearance' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Customize the look and feel of your CRM
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={appearanceSettings.darkMode || false}
                    onChange={handleAppearanceChange}
                    name="darkMode"
                    color="primary"
                  />
                }
                label="Dark Mode"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Switch between light and dark theme (applies on next page
                refresh)
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={appearanceSettings.compactView || false}
                    onChange={handleAppearanceChange}
                    name="compactView"
                    color="primary"
                  />
                }
                label="Compact View"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 3 }}
              >
                Reduce spacing for denser information display
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                <InputLabel>Primary Color</InputLabel>
                <Select
                  value={appearanceSettings.primaryColor || 'blue'}
                  label="Primary Color"
                  onChange={handleColorChange}
                >
                  <MenuItem value="blue">Blue</MenuItem>
                  <MenuItem value="green">Green</MenuItem>
                  <MenuItem value="purple">Purple</MenuItem>
                  <MenuItem value="orange">Orange</MenuItem>
                  <MenuItem value="red">Red</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="body2" gutterBottom>
                Font Size: {appearanceSettings.fontSize || 16}px
              </Typography>
              <Slider
                value={appearanceSettings.fontSize || 16}
                onChange={handleFontSizeChange}
                min={12}
                max={24}
                step={1}
                valueLabelDisplay="auto"
                sx={{ maxWidth: 300 }}
              />
            </Paper>
          )}

          {/* Language & Region */}
          {selectedCategory === 'language' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Language & Region
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={languageSettings.language || 'en'}
                  label="Language"
                  onChange={(e) =>
                    handleLanguageChange('language', e.target.value)
                  }
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">Hindi</MenuItem>
                  <MenuItem value="kn">Kannada</MenuItem>
                  <MenuItem value="ta">Tamil</MenuItem>
                  <MenuItem value="te">Telugu</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Time Zone</InputLabel>
                <Select
                  value={languageSettings.timezone || 'Asia/Kolkata'}
                  label="Time Zone"
                  onChange={(e) =>
                    handleLanguageChange('timezone', e.target.value)
                  }
                >
                  <MenuItem value="Asia/Kolkata">India (UTC +5:30)</MenuItem>
                  <MenuItem value="Asia/Dubai">Dubai (UTC +4:00)</MenuItem>
                  <MenuItem value="Asia/Singapore">
                    Singapore (UTC +8:00)
                  </MenuItem>
                  <MenuItem value="America/New_York">
                    New York (UTC -5:00)
                  </MenuItem>
                  <MenuItem value="Europe/London">London (UTC +0:00)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Date Format</InputLabel>
                <Select
                  value={languageSettings.dateFormat || 'DD/MM/YYYY'}
                  label="Date Format"
                  onChange={(e) =>
                    handleLanguageChange('dateFormat', e.target.value)
                  }
                >
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          )}

          {/* Privacy & Security */}
          {selectedCategory === 'privacy' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Privacy & Security
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.shareData || false}
                    onChange={handlePrivacyChange}
                    name="shareData"
                    color="primary"
                  />
                }
                label="Share anonymous usage data"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Help us improve by sharing anonymous usage statistics
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.analyticsEnabled || false}
                    onChange={handlePrivacyChange}
                    name="analyticsEnabled"
                    color="primary"
                  />
                }
                label="Enable analytics"
              />
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Allow us to collect analytics to improve your experience
              </Typography>

             
          
            </Paper>
          )}

          {/* Data Management */}
          {selectedCategory === 'data' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Alert severity="warning" sx={{ mb: 3 }}>
                These actions will permanently delete your data and cannot be
                undone.
              </Alert>

              <Button
                variant="outlined"
                color="warning"
                startIcon={<Refresh />}
                onClick={handleReset}
                sx={{ mr: 2, mb: 2 }}
              >
                Reset Settings
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleClearData}
                sx={{ mr: 2, mb: 2 }}
              >
                Clear All Data
              </Button>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveAll}
                sx={{ mr: 2, mb: 2 }}
              >
                Save All Settings
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>

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

export default Settings
