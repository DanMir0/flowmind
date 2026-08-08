import { defineStore } from 'pinia'
import {useTasksStore} from '@/store/tasks.js'
import {supabase} from '@/services/supabase.js'
import { useSubscriptionStore } from '@/store/subscription.js'
import { useSettingsStore } from '@/store/settings.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,
  }),

  actions: {
    setUser(user) {
      this.user = user
    },

    async init() {
      const subscriptionStore = useSubscriptionStore()
      const settingsStore = useSettingsStore()

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        this.user = data.session.user

        await settingsStore.loadSettings()
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
      const settingsStore = useSettingsStore()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      this.setUser(data.user)

      await settingsStore.loadSettings()
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

    async updateEmail(newEmail) {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        console.error('Update email error:', error)
        throw error
      }

      // Берём актуального пользователя из Supabase
      const {
        data: { user: updatedUser },
        error: updatedUserError
      } = await supabase.auth.getUser()

      if (updatedUserError) {
        throw updatedUserError
      }

      // Обновляем Pinia
      this.user = updatedUser

      return {
        success: true,
        user: updatedUser,
        message: 'Confirmation email has been sent'
      }
    },

    async deleteAccount() {
      const { data, error } = await supabase.functions.invoke(
        'delete-account'
      )

      if (error) {
        console.error('Delete account error:', error)
        throw error
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete account')
      }
      await supabase.auth.signOut()
      this.user = null
      this.profile = null

      return true
    },

    async refreshUser() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser()

      if (error) {
        throw error
      }

      this.user = user

      if (user) {
        await this.fetchProfile()
      }

      return user
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
