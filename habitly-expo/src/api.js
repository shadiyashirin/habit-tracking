import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE as BASE } from './config/apiBase'

// Use the SAME keys as AuthContext.jsx so tokens are shared
const ACCESS_KEY  = 'access_token'
const REFRESH_KEY = 'refresh_token'

// ─── Token helpers ──────────────────────────────────────────────────
async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY)
}

async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY)
}

async function setTokens(access, refresh) {
  await AsyncStorage.setItem(ACCESS_KEY, access)
  if (refresh) await AsyncStorage.setItem(REFRESH_KEY, refresh)
}

// ─── Authenticated request with auto-refresh ────────────────────────
async function request(path, options = {}) {
  let token = await getAccessToken()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  // If 401, try refreshing the token once
  if (res.status === 401) {
    const refresh = await getRefreshToken()
    if (refresh) {
      const refreshRes = await fetch(`${BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      })

      if (refreshRes.ok) {
        const data = await refreshRes.json()
        await setTokens(data.access, data.refresh)
        token = data.access

        // Retry original request with new token
        const retryHeaders = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        }
        res = await fetch(`${BASE}${path}`, { ...options, headers: retryHeaders })
      }
    }
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

// ─── API functions ──────────────────────────────────────────────────
export const fetchHabits = () => request('/habits/')
export const fetchStats  = () => request('/habits/stats/')

export const createHabit = (data) =>
  request('/habits/', { method: 'POST', body: JSON.stringify(data) })

export const deleteHabit = (id) =>
  request(`/habits/${id}/`, { method: 'DELETE' })

export const toggleLog = (habitId, date, completed) =>
  request('/habits/toggle/', {
    method: 'POST',
    body: JSON.stringify({ habit_id: habitId, date, completed }),
  })
