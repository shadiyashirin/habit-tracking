import { useState, useEffect, useCallback } from 'react'
import { fetchHabits, fetchStats, toggleLog, createHabit, deleteHabit } from '../api'

export function useHabits() {
  const [habits, setHabits]   = useState([])
  const [stats,  setStats]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (silent = false) => {
    try {
      setError(null)
      if (!silent) setLoading(true)
      const [h, s] = await Promise.all([fetchHabits(), fetchStats()])
      setHabits(h)
      setStats(s)
    } catch (e) {
      setError('Cannot reach server. Is the Django backend running?')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = () => {
    setRefreshing(true)
    load(true)
  }

  const toggle = async (habitId, date, completed) => {
    // Optimistic update
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h
        const existing = h.logs.find(l => l.date === date)
        const newLogs = existing
          ? h.logs.map(l => l.date === date ? { ...l, completed } : l)
          : [...h.logs, { id: Date.now(), date, completed }]
        return { ...h, logs: newLogs }
      })
    )
    setStats(prev =>
      prev.map(s => {
        if (s.date !== date) return s
        const delta = completed ? 1 : -1
        const newDone = Math.max(0, s.completed + delta)
        return {
          ...s,
          completed: newDone,
          percentage: Math.round(habits.length > 0 ? (newDone / habits.length) * 100 : 0),
        }
      })
    )
    try {
      await toggleLog(habitId, date, completed)
      const s = await fetchStats()
      setStats(s)
    } catch {
      load(true)
    }
  }

  const addHabit = async ({ name, color }) => {
    await createHabit({ name, color })
    await load(true)
  }

  const removeHabit = async (id) => {
    setHabits(prev => prev.filter(h => h.id !== id))
    try {
      await deleteHabit(id)
      const s = await fetchStats()
      setStats(s)
    } catch {
      load(true)
    }
  }

  const getStreak = (habit) => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const iso = d.toISOString().split('T')[0]
      if (habit.logs.find(l => l.date === iso)?.completed) streak++
      else break
    }
    return streak
  }

  return { habits, stats, loading, error, refreshing, onRefresh, toggle, addHabit, removeHabit, getStreak }
}
