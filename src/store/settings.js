import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    locale: 'en',      // 'en' | 'ru'
    theme: 'dark'      // 'dark' | 'light'
  }),

  actions: {
    setLocale(locale) {
      this.locale = locale
      localStorage.setItem('locale', locale)
    },

    setTheme(theme) {
      this.theme = theme
      localStorage.setItem('theme', theme)
    },

    loadFromStorage() {
      const savedLocale = localStorage.getItem('locale')
      const savedTheme = localStorage.getItem('theme')

      if (savedLocale) this.locale = savedLocale
      if (savedTheme) this.theme = savedTheme
    }
  }
})
