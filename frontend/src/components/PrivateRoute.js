import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CircularProgress, Box } from '@mui/material'

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth()

  console.log(
    '🔒 PrivateRoute - isAuthenticated:',
    isAuthenticated,
    'loading:',
    loading,
  )

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  console.log('✅ Authenticated, rendering outlet')
  return <Outlet />
}

export default PrivateRoute
