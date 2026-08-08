import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    status: 'free',
    plan: 'free',
    expiresAt: null,
    loading: false,
  }),

  getters: {
    isTrial: (state) => {
      return state.status === 'trial'
    },

    isActive: (state) => {
      return state.status === 'active'
    },

    isExpired: (state) => {
      return state.status === 'expired'
    },

    isPremium: (state) => {
      return state.status === 'trial' ||
        state.status === 'active'
    },

    daysLeft: (state) => {
      if (!state.expiresAt) {
        return 0
      }

      const expires = new Date(state.expiresAt)
      const now = new Date()

      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        return 0
      }

      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    },
  },

  actions: {
    async loadSubscription(userId) {
      if (!userId) {
        this.reset()
        return
      }

      this.loading = true

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            subscription_status,
            subscription_plan,
            subscription_expires_at
          `)
          .eq('user_id', userId)
          .maybeSingle()

        if (error) {
          throw error
        }

        if (!data) {
          this.reset()
          return
        }

        this.status = data.subscription_status || 'free'
        this.plan = data.subscription_plan || 'free'
        this.expiresAt = data.subscription_expires_at || null

      } catch (error) {
        console.error('Load subscription error:', error)

        this.reset()

      } finally {
        this.loading = false
      }
    },

    async startTrial() {
      this.loading = true

      try {
        const { data, error } = await supabase.functions.invoke(
          'start-trial'
        )

        if (error) {
          throw error
        }

        if (!data?.success) {
          throw new Error(
            data?.error || 'Failed to start free trial'
          )
        }

        // Сразу обновляем store
        this.status = data.status
        this.plan = data.plan
        this.expiresAt = data.expires_at

        return data

      } catch (error) {
        console.error('Start trial error:', error)
        throw error

      } finally {
        this.loading = false
      }
    },

    reset() {
      this.status = 'free'
      this.plan = 'free'
      this.expiresAt = null
      this.loading = false
    },
  },
})
