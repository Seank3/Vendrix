import { useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('auth_token')

    if (!storedToken) {
      setIsLoading(false)
      return
    }

    try {
      const response = await authAPI.me()
      setUser(response.user)
      setToken(storedToken)
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('auth_token')
      setUser(null)
      setToken(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: newToken, user: userData } = response

      localStorage.setItem('auth_token', newToken)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    }
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }
}