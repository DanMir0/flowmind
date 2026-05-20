import { defineStore } from 'pinia'
import {useTasksStore} from '@/store/tasks.js'
import {supabase} from '@/services/supabase.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,
  }),

  actions: {
    async init() {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        this.user = data.session.user

        // profile НЕ блокирует init
        this.fetchProfile().catch(() => {})
      }

      this.initialized = true
    },

    async signUp(email, password, username) {
      this.loading = true

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      this.loading = false
      return data
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      this.user = data.user
      await this.fetchProfile()

      return data
    },

    async signOut() {
      const taskStore = useTasksStore()

      const { error } = await supabase.auth.signOut()
      this.user = null
      this.profile = null
      taskStore.reset()

      return error
    },

    async fetchProfile() {
      if (!this.user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle()

      if (error) {throw error}
      this.profile = data
      return data
    },

    // Если пользователь не авторизирован и нажимает на любую кнопку в dashboard, то перекидыват на страницу логина
    goToLoginIfGuest(router) {
      if (!this.user) {
        router.push({ name: 'login' })
        return false
      }
      return true
    }

  }
})
