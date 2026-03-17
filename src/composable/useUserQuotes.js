import { ref } from 'vue'

import {
  getUserQuotes,
  deleteUserQuote,
  togglePin
} from '@/services/userQuotes'

export function useUserQuotes(userId) {

  const quotes = ref([])
  const loading = ref(false)

  const loadQuotes = async (userId) => {

    if (!userId) return

    try {

      loading.value = true

      quotes.value = await getUserQuotes(userId)

    } catch (err) {

      console.error(err)

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

      console.error(err)

    }
  }

  const pinQuote = async (quoteId) => {

    const current = quotes.value.find(q => q.id === quoteId)

    try {

      await togglePin(userId, quoteId)

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
      console.error(err)
    }
  }

  return {
    quotes,
    loading,
    loadQuotes,
    removeQuote,
    pinQuote
  }
}
