import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore('subscription', {

  state: () => ({
    isPro: false
  }),

  actions: {

    setPro(value) {
      this.isPro = value
    }

  }

})

