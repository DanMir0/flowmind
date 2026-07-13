import { ref } from 'vue'
import { supabase } from '@/services/supabase.js'
import {
  getUserQuotes,
  deleteUserQuote,
  updateUserQuote
} from '@/services/userQuotes'
import { showSuccess, showError} from '@/utils/toast.js'
import { useQuotes } from '@/composable/useQuotes.js'
import { clearPinnedQuote } from '@/services/quotes'
import { useAuthStore } from '@/store/auth.js'

export function useUserQuotes() {

  const quotes = ref([])
  const loading = ref(false)
  const errorMessage = ref(null)
  const { loadQuote, pinCurrentUserQuote } = useQuotes()
  const PAGE_SIZE = 8
  const page = ref(0)
  const hasMore = ref(true)

  const loadQuotes = async (userId) => {
    const authStore = useAuthStore()
    if (!userId) return

    try {
      loading.value = true
      page.value = 0
      errorMessage.value = null

      await authStore.fetchProfile()

      const data = await getUserQuotes(userId, page.value, PAGE_SIZE)

      const pinnedId = authStore.profile?.pinned_quote_id
      const pinnedType = authStore.profile?.pinned_quote_type

      quotes.value = data.map(q => ({
        ...q,
        is_pinned:
          pinnedType === 'user' &&
          pinnedId === q.id
      }))

      hasMore.value = data.length === PAGE_SIZE
    } catch (err) {
      errorMessage.value = err.message || 'Failed to load quotes'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    const authStore = useAuthStore()

    page.value++

    const data = await getUserQuotes(
      authStore.user.id,
      page.value,
      PAGE_SIZE
    )

    const pinnedId = authStore.profile?.pinned_quote_id
    const pinnedType = authStore.profile?.pinned_quote_type

    const mapped = data.map(q => ({
      ...q,
      is_pinned:
        pinnedType === 'user' &&
        pinnedId === q.id
    }))

    quotes.value.push(...mapped)

    hasMore.value = data.length === PAGE_SIZE
  }

  const removeQuote = async (quoteId) => {
    try {
      await deleteUserQuote(quoteId)
      quotes.value = quotes.value.filter(
        q => q.id !== quoteId
      )
      showSuccess('Quote delete')
    } catch (err) {
      showError(err.message || 'Failed to delete quote')
    }
  }

  const pinQuote = async (quoteId) => {

    try {

      await pinCurrentUserQuote(quoteId)

      quotes.value.forEach(q => {
        q.is_pinned = q.id === quoteId
      })

    } catch (err) {

      showError(err.message || 'Failed to update pin')

    }

  }

  const editQuote = async (payload) => {

    try {

      const updated = await updateUserQuote(payload.id, {
        text: payload.text,
        author: payload.author
      })

      quotes.value = quotes.value.map(q =>
        q.id === updated.id
          ? updated
          : q
      )

      showSuccess('Quote updated')

    } catch (err) {

      showError(err.message || 'Failed to update quote')

    }

  }

  const unpinAllQuotes = async (userId) => {

    await clearPinnedQuote(userId)

    quotes.value.forEach(q => {
      q.is_pinned = false
    })

    await loadQuote()
  }

  const setRandomQuotes = async (userId, enabled) => {
    const authStore = useAuthStore()
    const { error } = await supabase
      .from('profiles')
      .update({
        use_random_quotes: enabled
      })
      .eq('user_id', userId)

    await authStore.fetchProfile()
    await loadQuote()

    if (error) throw error
  }

  return {
    quotes,
    loading,
    errorMessage,
    hasMore,
    loadMore,
    loadQuotes,
    removeQuote,
    pinQuote,
    editQuote,
    unpinAllQuotes,
    setRandomQuotes
  }
}
