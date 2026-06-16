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

      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)

      const totalMinutes = state.sessions
        .filter(session =>
          new Date(session.started_at) >= weekAgo
        )
        .reduce((sum, session) => {
          return sum + (session.duration_minutes || 0)
        }, 0)

      if (totalMinutes < 60) {
        return `${totalMinutes}m`
      }

      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      if (minutes === 0) {
        return `${hours}h`
      }

      return `${hours}:${String(minutes).padStart(2, '0')}h`
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

      console.log(data)
      console.log(error)
      return data
    }
  }
})
