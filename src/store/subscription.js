import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase.js'

export const useSubscriptionStore = defineStore('subscription', {

  state: () => ({
    isPro: true,
    loading: false
  }),

  actions: {

    async loadSubscription(userId) {

      this.loading = true

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      this.isPro = !!data
      this.loading = false
    },

    async setPro(value) {
      this.isPro  = value
    },

  }

})

