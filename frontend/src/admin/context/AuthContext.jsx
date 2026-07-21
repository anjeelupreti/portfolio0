import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '../api/adminClient'
import { login as loginRequest, getMe } from '../api/adminResources'

const AuthContext = createContext(null)

/** Provides admin auth state (user, tokens, loading) to the dashboard tree; wraps the admin routes in App.jsx. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(getAccessToken())
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password)
    setTokens({ access: data.access, refresh: data.refresh })
    setAccessToken(data.access)
    const me = await getMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = {
    user,
    setUser,
    accessToken,
    loading,
    isAuthenticated: Boolean(user) && Boolean(getRefreshToken()),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Accesses the AuthContext value; throws if called outside AuthProvider. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
