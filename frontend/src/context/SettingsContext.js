import React, { createContext, useState, useContext, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  // Load settings from localStorage or use defaults
  const loadSettings = () => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return getDefaultSettings()
      }
    }
    return getDefaultSettings()
  }

  const getDefaultSettings = () => ({
    // Notification Settings
    notifications: {
      emailNotifications: true,
      leadAlerts: true,
      taskReminders: true,
      systemUpdates: false,
      marketingEmails: false,
    },
    // Appearance Settings
    appearance: {
      darkMode: false,
      compactView: false,
      primaryColor: 'blue',
      fontSize: 16,
    },
    // Language & Region
    language: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
    },
    // Privacy & Security
    privacy: {
      shareData: false,
      analyticsEnabled: true,
      showOnlineStatus: true,
    },
  })

  const [settings, setSettings] = useState(loadSettings)

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings))
  }, [settings])

  // Update specific setting category
  const updateSettings = (category, newValues) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...newValues,
      },
    }))
  }

  // Reset all settings to default
  const resetSettings = () => {
    const defaults = getDefaultSettings()
    setSettings(defaults)
    localStorage.setItem('appSettings', JSON.stringify(defaults))
  }

  // Clear all data (just for demo)
  const clearAllData = () => {
    localStorage.clear()
    sessionStorage.clear()
    // Reload page to reset everything
    window.location.reload()
  }

  const value = {
    settings,
    updateSettings,
    resetSettings,
    clearAllData,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
