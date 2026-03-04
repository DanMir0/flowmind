import { ref } from 'vue'
import { supabase } from '@/services/supabase.js'
import { useSettingsStore } from '@/store/settings.js'
import { useAuthStore } from '@/store/auth.js'

export function useQuotes() {
  const settingsStore = useSettingsStore()
  const userStore = useAuthStore()

  const displayedQuote = ref(null)
  const loading = ref(false)

  const DEFAULT_LOCALE = 'en'

  /*
    Получаем pinned пользовательскую цитату
  */
  const getPinnedUserQuote = async () => {
    if (!userStore.user) return null

    const { data, error } = await supabase
      .from('user_quotes')
      .select('*')
      .eq('user_id', userStore.user.id)
      .eq('is_pinned', true)
      .single()

    if (error) return null
    return data
  }

  /*
    Получаем общее количество системных цитат
  */
  const getQuotesCount = async () => {
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    return count || 0
  }

  /*
    Получаем id цитаты по индексу
  */
  const getQuoteIdByIndex = async (index) => {
    const { data } = await supabase
      .from('quotes')
      .select('id')
      .eq('is_active', true)
      .range(index, index)
      .single()

    return data?.id || null
  }

  /*
    Получаем перевод с fallback
  */
  const getTranslation = async (quoteId, locale) => {
    // 1. Пробуем нужный язык
    const { data } = await supabase
      .from('quote_translations')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('locale', locale)
      .single()

    if (data) return data

    // 2. Fallback на английский
    const { data: fallback } = await supabase
      .from('quote_translations')
      .select('*')
      .eq('quote_id', quoteId)
      .eq('locale', DEFAULT_LOCALE)
      .single()

    return fallback || null
  }

  /*
    Основная загрузка цитаты
  */
  const loadQuote = async () => {
    loading.value = true

    // 1️⃣ Проверяем pinned пользовательскую
    const pinned = await getPinnedUserQuote()
    if (pinned) {
      displayedQuote.value = pinned
      loading.value = false
      return
    }

    // 2️⃣ Daily deterministic quote
    const count = await getQuotesCount()

    if (!count) {
      displayedQuote.value = null
      loading.value = false
      return
    }

    const today = new Date()
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    )

    const index = dayOfYear % count

    const quoteId = await getQuoteIdByIndex(index)

    if (!quoteId) {
      displayedQuote.value = null
      loading.value = false
      return
    }

    const translation = await getTranslation(
      quoteId,
      settingsStore.locale
    )

    displayedQuote.value = translation
    loading.value = false
  }

  /*
    Добавление пользовательской цитаты
  */
  const addUserQuote = async (text) => {
    if (!userStore.user) return

    await supabase.from('user_quotes').insert({
      user_id: userStore.user.id,
      text,
      locale: settingsStore.locale
    })
  }

  /*
    Закрепление пользовательской цитаты
  */
  const pinUserQuote = async (quoteId) => {
    if (!userStore.user) return

    // Снимаем старый pinned
    await supabase
      .from('user_quotes')
      .update({ is_pinned: false })
      .eq('user_id', userStore.user.id)

    // Закрепляем новый
    await supabase
      .from('user_quotes')
      .update({ is_pinned: true })
      .eq('id', quoteId)

    await loadQuote()
  }

  /*
    Авто-перезагрузка при смене языка
  */
  const reloadOnLocaleChange = () => {
    watch(
      () => settingsStore.locale,
      () => {
        loadQuote()
      }
    )
  }

  return {
    displayedQuote,
    loading,
    loadQuote,
    addUserQuote,
    pinUserQuote,
    reloadOnLocaleChange
  }
}
