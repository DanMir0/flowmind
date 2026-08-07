import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/auth'

export const useSettingsStore = defineStore('settings', {

  state: () => ({
    locale: 'en',
    theme: 'light'
  }),

  actions: {

    async loadSettings() {

      const auth = useAuthStore()

      if (!auth.user)
        return

      const { data, error } = await supabase
        .from('profiles')
        .select(`quote_locale, theme`)
        .eq('user_id', auth.user.id)
        .maybeSingle()

      if (error)
        throw error

      this.locale = data?.quote_locale || 'en'
      this.theme = data?.theme || 'light'
      localStorage.setItem('theme', this.theme)
      document.documentElement.setAttribute(
        'data-theme',
        this.theme
      )
    },

    async changeLocale(locale) {

      const auth = useAuthStore()

      this.locale = locale

      const { error } = await supabase
        .from('profiles')
        .update({
          quote_locale: locale
        })
        .eq('user_id', auth.user.id)

      if (error)
        throw error
    },

    async changeTheme(theme) {

      this.theme = theme
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute(
        'data-theme',
        theme
      )

      const auth = useAuthStore()

      if (!auth.user) return

      await supabase
        .from('profiles')
        .update({
          theme: theme
        })
        .eq('user_id', auth.user.id)

    },

  }

})
