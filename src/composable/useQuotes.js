import { ref, watch } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useAuthStore } from '@/store/auth'

import {
  getPinnedQuote,
  getQuotesCount,
  getQuoteIdByIndex,
  getQuoteTranslation,
  addUserQuote,
  clearPinned,
  pinUserQuote
} from '@/services/quotes'
import { useSubscriptionStore } from '@/store/subscription.js'

const DEFAULT_LOCALE = 'en'
const CACHE_KEY = 'daily_quote'

const saveCache = (quote) => {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      quote,
      date: new Date().toDateString()
    })
  )
}

const loadCache = () => {
  const cache = localStorage.getItem(CACHE_KEY)

  if (!cache) return null

  const parsed = JSON.parse(cache)

  if (parsed.date !== new Date().toDateString()) {
    return null
  }

  return parsed.quote
}

export function useQuotes() {

  const settingsStore = useSettingsStore()
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()

  const displayedQuote = ref(null)
  const loading = ref(false)

  const loadQuote = async () => {

    try {

      loading.value = true

      // pinned quote
      const pinned = await getPinnedQuote(authStore.user?.id)

      if (pinned) {
        displayedQuote.value = pinned
        loading.value = false
        return
      }

      // daily quote
      const count = await getQuotesCount()


      if (count === null || count === undefined) {
        loading.value = false
        return
      }

      const today = new Date()

      const dayOfYear = Math.floor(
        (today - new Date(today.getFullYear(), 0, 0)) / 86400000
      )

      const index = dayOfYear % count

      const quoteId = await getQuoteIdByIndex(index)


      let translation = await getQuoteTranslation(
        quoteId,
        settingsStore.locale
      )

      // fallback language
      if (!translation && settingsStore.locale !== DEFAULT_LOCALE) {
        translation = await getQuoteTranslation(
          quoteId,
          DEFAULT_LOCALE
        )
      }

      displayedQuote.value = translation

      // cache only system quotes
      if (translation) {
        saveCache(translation)
      }

    } catch (error) {

    } finally {

      loading.value = false

    }
  }

  const createUserQuote = async (quoteText, authorText) => {

    if (!authStore.user) return

    if (!subscriptionStore.isPro) {
      throw new Error('Pro subscription required')
    }

    await addUserQuote(
      authStore.user.id,
      quoteText,
      settingsStore.locale,
      authorText,
    )

  }

  const pinQuote = async (quoteId) => {

    if (!authStore.user) return

    await clearPinned(authStore.user.id)

    await pinUserQuote(quoteId)

    await loadQuote()

  }

  watch(
    () => settingsStore.locale,
    () => loadQuote(),
    { immediate: true }
  )

  return {
    displayedQuote,
    loading,
    loadQuote,
    createUserQuote,
    pinQuote
  }

}
