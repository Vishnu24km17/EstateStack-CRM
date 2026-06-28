import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext' // ← ADD THIS
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        {' '}
       
        <App />
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>,
)
