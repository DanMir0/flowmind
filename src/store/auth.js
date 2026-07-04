import { defineStore } from 'pinia'
import {useTasksStore} from '@/store/tasks.js'
import {supabase} from '@/services/supabase.js'
import { useSubscriptionStore } from '@/store/subscription.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,
  }),

  actions: {
    async init() {
      const subscriptionStore = useSubscriptionStore()

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        this.user = data.session.user

        // profile НЕ блокирует init
        this.fetchProfile().catch(() => {})
        await subscriptionStore.loadSubscription(this.user.id)
      }

      this.initialized = true
    },

    async signUp(email, password, username) {
      const {data, error } = await
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        })

      if (error) throw error

      return data
    },

    async signIn(email, password) {
      const subscriptionStore = useSubscriptionStore()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      this.user = data.user
      await this.fetchProfile()
      await subscriptionStore.loadSubscription(this.user.id)

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
        .eq('user_id', this.user.id)
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
