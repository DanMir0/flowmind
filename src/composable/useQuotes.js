import { ref, watch } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/services/supabase'

import {
  getPinnedQuote,
  getQuotesCount,
  getQuoteIdByIndex,
  getQuoteTranslation,
  addUserQuote,
  pinUserQuote,
  pinSystemQuote
} from '@/services/quotes'
import { useSubscriptionStore } from '@/store/subscription.js'

const DEFAULT_LOCALE = 'en'
const CACHE_KEY = 'daily_quote'
const isPinned = ref(false)

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

  const getUserQuoteById = async (id) => {

    const { data, error } = await supabase
      .from('user_quotes')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error

    return data
  }

  const getSystemQuoteById = async (quoteId, locale) => {

    const { data, error } = await supabase
      .from('quote_translations')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('locale', locale)
      .maybeSingle()

    if (error) throw error

    return data
  }

  const loadQuote = async () => {
    isPinned.value = false
    try {

      loading.value = true

      const pinned = await getPinnedQuote()

      if (pinned?.pinned_quote_id) {

        let quote = null

        if (pinned.pinned_quote_type === 'user') {

          quote = await getUserQuoteById(
            pinned.pinned_quote_id
          )

        } else {

          quote = await getSystemQuoteById(
            pinned.pinned_quote_id,
            settingsStore.locale
          )

          if (!quote && settingsStore.locale !== DEFAULT_LOCALE) {

            quote = await getSystemQuoteById(
              pinned.pinned_quote_id,
              DEFAULT_LOCALE
            )

          }

        }

        if (quote) {
          displayedQuote.value = quote
          isPinned.value = true
          return
        }

      }

      // -----------------------
      // обычная ежедневная цитата
      // -----------------------

      const count = await getQuotesCount()

      if (!count) return

      const today = new Date()

      const dayOfYear = Math.floor(
        (today - new Date(today.getFullYear(), 0, 0))
        / 86400000
      )

      const index = dayOfYear % count

      const quoteId = await getQuoteIdByIndex(index)

      let translation = await getQuoteTranslation(
        quoteId,
        settingsStore.locale
      )

      if (!translation &&
        settingsStore.locale !== DEFAULT_LOCALE) {

        translation = await getQuoteTranslation(
          quoteId,
          DEFAULT_LOCALE
        )

      }

      displayedQuote.value = translation

      if (translation)
        saveCache(translation)

    }
    finally {
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
  const pinCurrentSystemQuote = async () => {

    if (!displayedQuote.value)
      return

    await pinSystemQuote(
      displayedQuote.value.quote_id
    )

    await authStore.fetchProfile()
    await loadQuote()

  }

  const pinCurrentUserQuote = async (quoteId) => {

    await pinUserQuote(
      quoteId,
      authStore.user.id
    )
    await authStore.fetchProfile()
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
    pinCurrentUserQuote,
    pinCurrentSystemQuote,
    isPinned,
  }

}
