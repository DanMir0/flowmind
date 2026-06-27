import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'

export const useFocusStore = defineStore('focus', {
  state: () => ({
    sessions: [],
    loading: false
  }),

  getters: {
    weeklyFocusTime(state) {
      const now = new Date()

      const monday = new Date(now)

      const day = monday.getDay() // 0=Вс, 1=Пн, ...

      const diff = day === 0 ? 6 : day - 1

      monday.setDate(monday.getDate() - diff)

      monday.setHours(0, 0, 0, 0)

      const totalMinutes = state.sessions
        .filter(session =>
          new Date(session.started_at) >= monday
        )
        .reduce((sum, session) => {
          return sum + (session.duration_minutes || 0)
        }, 0)

      if (totalMinutes < 60) {
        return `${totalMinutes}m`
      }

      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      return minutes
        ? `${hours}:${String(minutes).padStart(2, '0')}h`
        : `${hours}h`
    }
  },

  actions: {
    async loadSessions() {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .order('started_at', { ascending: false })

      if (error) throw error

      this.sessions = data
    },

    async createSession(payload) {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: payload.user_id,
          started_at: payload.started_at,
          ended_at: payload.ended_at,
          duration_minutes: payload.duration_minutes,
          completed: payload.completed
        })
        .select()
        .single()


      if (error) throw error

      this.sessions.unshift(data)

      return data
    }
  }
})
