import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'

export const useSubscriptionStore = defineStore('subscription', {

  state: () => ({
    isPro: false,
    loading: false
  }),

  actions: {

    async loadSubscription(userId) {
      this.loading = true

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('user_id', userId)
          .maybeSingle()

        if (error) throw error

        this.isPro = data?.subscription_plan !== 'free'
      } catch (error) {
        this.isPro = false
      } finally {
        this.loading = false
      }
    },

  }

})
