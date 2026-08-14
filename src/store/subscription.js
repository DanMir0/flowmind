import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    status: 'free',
    plan: 'free',

    expiresAt: null,

    trialStartedAt: null,
    trialExpiresAt: null,

    loading: false,
  }),

  getters: {
    isTrial: (state) => state.status === 'trial',

    isActive: (state) => state.status === 'active',

    isExpired: (state) => state.status === 'expired',

    isPremium: (state) => {
      return (
        state.status === 'trial' ||
        state.status === 'active'
      )
    },

    trialUsed: (state) => {
      return !!state.trialStartedAt
    },

    daysLeft: (state) => {
      const expiresAt =
        state.status === 'trial'
          ? state.trialExpiresAt
          : state.expiresAt

      if (!expiresAt) {
        return 0
      }

      const expires = new Date(expiresAt).getTime()
      const now = Date.now()

      const diff = expires - now

      if (diff <= 0) {
        return 0
      }

      return Math.ceil(
        diff / (1000 * 60 * 60 * 24)
      )
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
            subscription_expires_at,
            trial_started_at,
            trial_expires_at
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

        this.status =
          data.subscription_status || 'free'

        this.plan =
          data.subscription_plan || 'free'

        this.expiresAt =
          data.subscription_expires_at || null

        this.trialStartedAt =
          data.trial_started_at || null

        this.trialExpiresAt =
          data.trial_expires_at || null

        const now = Date.now()

        // --------------------------------------------
        // TRIAL EXPIRED
        // --------------------------------------------

        if (
          this.status === 'trial' &&
          this.trialExpiresAt &&
          new Date(this.trialExpiresAt).getTime() <= now
        ) {
          this.status = 'expired'
        }

        // --------------------------------------------
        // ACTIVE SUBSCRIPTION EXPIRED
        // --------------------------------------------

        if (
          this.status === 'active' &&
          this.expiresAt &&
          new Date(this.expiresAt).getTime() <= now
        ) {
          this.status = 'expired'
        }

      } catch (error) {
        this.reset()

      } finally {
        this.loading = false
      }
    },

    async startTrial(plan) {
      this.loading = true

      try {
        const { data, error } =
          await supabase.functions.invoke(
            'start-trial',
            {
              body: {
                plan,
              },
            }
          )

        if (error) {
          throw error
        }

        if (!data?.success) {
          throw new Error(
            data?.error ||
            'Failed to start free trial'
          )
        }

        // --------------------------------------------
        // IMPORTANT:
        // We don't rely only on Edge Function response.
        // Reload the real state from profiles.
        // --------------------------------------------

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser()

        if (user) {
          await this.loadSubscription(user.id)
        }

        return data

      } catch (error) {
        throw error

      } finally {
        this.loading = false
      }
    },

    async testPayment(plan) {
      this.loading = true

      try {
        const { data, error } = await supabase.functions.invoke(
          'test-payment',
          {
            body: { plan }
          }
        )

        if (error) {
          throw error
        }

        if (!data?.success) {
          throw new Error(
            data?.error || 'Test payment failed'
          )
        }

        this.status = data.subscription.status
        this.plan = data.subscription.plan
        this.expiresAt = data.subscription.expires_at

        this.trialStartedAt = data.subscription.trial_started_at ?? this.trialStartedAt
        return data

      } catch (error) {
        throw error

      } finally {
        this.loading = false
      }
    },

    reset() {
      this.status = 'free'
      this.plan = 'free'

      this.expiresAt = null

      this.trialStartedAt = null
      this.trialExpiresAt = null

      this.loading = false
    },
  },
})
