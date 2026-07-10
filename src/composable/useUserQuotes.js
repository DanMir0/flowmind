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

export function useUserQuotes() {

  const quotes = ref([])
  const loading = ref(false)
  const errorMessage = ref(null)
  const { loadQuote, pinCurrentUserQuote } = useQuotes()

  const loadQuotes = async (userId) => {

    if (!userId) return

    try {
      loading.value = true
      errorMessage.value = null

      const data = await getUserQuotes(userId)

      quotes.value = data
    } catch (err) {
      errorMessage.value = err.message || 'Failed to load quotes'
    } finally {
      loading.value = false
    }
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

    const { error } = await supabase
      .from('profiles')
      .update({
        use_random_quotes: enabled
      })
      .eq('user_id', userId)

    await loadQuote()

    if (error) throw error
  }

  return {
    quotes,
    loading,
    errorMessage,
    loadQuotes,
    removeQuote,
    pinQuote,
    editQuote,
    unpinAllQuotes,
    setRandomQuotes
  }
}
