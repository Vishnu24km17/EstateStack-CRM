import React, { createContext, useState, useEffect } from 'react'
import api from '../api/config'
import jwt_decode from 'jwt-decode'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        const decoded = jwt_decode(token)
        if (decoded.exp * 1000 > Date.now()) {
          const userData = JSON.parse(localStorage.getItem('user'))
          setUser(userData)
          setIsAuthenticated(true)
          console.log(
            '✅ User authenticated from localStorage:',
            userData?.username,
          )
        } else {
          console.log('⏰ Token expired')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('❌ Auth error:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      console.log('📤 Attempting login for:', username)
      const response = await api.post('/auth/login/', { username, password })
      console.log('📥 Login response received')

      const { access, refresh, user } = response.data

      // Store tokens
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('user', JSON.stringify(user))

      // Update state
      setUser(user)
      setIsAuthenticated(true)

      console.log('✅ Login successful for:', user.username)
      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message)
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Login failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    console.log('👋 User logged out')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
