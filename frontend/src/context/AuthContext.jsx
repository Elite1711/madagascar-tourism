import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const { token, user: u } = await authService.login(credentials)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      return await authService.register(payload)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un <AuthProvider>')
  return ctx
}
