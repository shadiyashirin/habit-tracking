import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE as BASE } from '../config/apiBase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,     setToken]     = useState(null)
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)

  // ── Restore session on mount ──────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('access_token').then(t => {
      if (t) {
        setToken(t)
        fetchMe(t)
      } else {
        setLoading(false)
      }
    })
  }, [])

  // ── Fetch authenticated user profile ──────────────────────────────
  async function fetchMe(t) {
    try {
      const res = await fetch(`${BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (res.ok) {
        setUser(await res.json())
      } else if (res.status === 401) {
        // Access token expired — try refreshing
        const refreshed = await tryRefreshToken()
        if (!refreshed) {
          await clearTokens()
        }
      } else {
        await clearTokens()
      }
    } catch {
      // network error — keep token, show cached state
    } finally {
      setLoading(false)
    }
  }

  // ── Token refresh ─────────────────────────────────────────────────
  async function tryRefreshToken() {
    try {
      const refresh = await AsyncStorage.getItem('refresh_token')
      if (!refresh) return false

      const res = await fetch(`${BASE}/auth/refresh/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refresh }),
      })

      if (res.ok) {
        const data = await res.json()
        const newAccess  = data.access
        const newRefresh = data.refresh || refresh

        await AsyncStorage.setItem('access_token',  newAccess)
        await AsyncStorage.setItem('refresh_token', newRefresh)
        setToken(newAccess)

        // Re-fetch user profile with the new token
        const meRes = await fetch(`${BASE}/auth/me/`, {
          headers: { Authorization: `Bearer ${newAccess}` },
        })
        if (meRes.ok) {
          setUser(await meRes.json())
        }
        return true
      }
      return false
    } catch {
      return false
    }
  }

  // ── Clear all stored tokens ───────────────────────────────────────
  async function clearTokens() {
    await AsyncStorage.removeItem('access_token')
    await AsyncStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
  }

  // ── Login ─────────────────────────────────────────────────────────
  async function login(username, password) {
    try {
      setAuthError(null)
      const res = await fetch(`${BASE}/auth/login/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAuthError(data.detail || 'Invalid credentials')
        return false
      }

      // TokenObtainPairView returns { access, refresh } at the top level
      await AsyncStorage.setItem('access_token',  data.access)
      await AsyncStorage.setItem('refresh_token', data.refresh)
      setToken(data.access)
      await fetchMe(data.access)
      return true
    } catch (e) {
      setAuthError('Network error. Is the server running?')
      return false
    }
  }

  // ── Register ──────────────────────────────────────────────────────
  async function register(username, email, password, password2) {
    try {
      setAuthError(null)
      const res = await fetch(`${BASE}/auth/register/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, email, password, password2 }),
      })
      const data = await res.json()

      if (!res.ok) {
        // Parse DRF validation errors into a readable string
        const msg = typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Registration failed'
        setAuthError(msg)
        return false
      }

      // Backend RegisterView returns { user, tokens: { access, refresh } }
      const { access, refresh } = data.tokens
      await AsyncStorage.setItem('access_token',  access)
      await AsyncStorage.setItem('refresh_token', refresh)
      setToken(access)
      setUser(data.user)
      return true
    } catch (e) {
      setAuthError('Network error. Is the server running?')
      return false
    }
  }

  // ── Logout ────────────────────────────────────────────────────────
  async function logout() {
    await clearTokens()
  }

  // ── Provide context ───────────────────────────────────────────────
  const value = {
    user,
    token,
    authError,
    setAuthError,
    isAuthenticated: !!token && !!user,
    isLoading:       loading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook for consumers ────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return ctx
}
