import { ref } from 'vue'

import {
  getUserQuotes,
  deleteUserQuote,
  togglePin
} from '@/services/userQuotes'
import { useAuthStore } from '@/store/auth.js'

export function useUserQuotes() {

  const quotes = ref([])
  const loading = ref(false)
  const errorMessage = ref(null)

  const loadQuotes = async (userId) => {

    if (!userId) return

    try {
      loading.value = true
      errorMessage.value = null

      quotes.value = await getUserQuotes(userId)
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
    } catch (err) {
      errorMessage.value = err.message || 'Failed to delete quote'
    }
  }

  const pinQuote = async (quoteId) => {

    const current = quotes.value.find(q => q.id === quoteId)
    const authStore = useAuthStore()

    try {

      await togglePin(authStore.user.id, quoteId)

      // UI обновление
      if (current.is_pinned) {

        // был pinned → снимаем
        quotes.value = quotes.value.map(q => ({
          ...q,
          is_pinned: false
        }))

      } else {

        // не был → делаем pinned
        quotes.value = quotes.value.map(q => ({
          ...q,
          is_pinned: q.id === quoteId
        }))
      }

    } catch (err) {
      errorMessage.value = err.message || 'Failed to update pin'
    }
  }

  return {
    quotes,
    loading,
    errorMessage,
    loadQuotes,
    removeQuote,
    pinQuote
  }
}
