import { supabase } from '@/services/supabase.js'

export const getPinnedQuote = async (userId) => {
  return await supabase
    .from('user_quotes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_pinned', true)
    .single()
}

export const getQuotesCount = async () => {
  return await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
}

export const getQuoteByIndex = async (index) => {
  return await supabase
    .from('quotes')
    .select('*')
    .range(index, index)
    .single()
}

export const addUserQuote = async (userId, text) => {
  return await supabase
    .from('user_quotes')
    .insert({
      user_id: userId,
      text
    })
}

export const clearPinned = async (userId) => {
  return await supabase
    .from('user_quotes')
    .update({ is_pinned: false })
    .eq('user_id', userId)
}

export const pinUserQuote = async (quoteId) => {
  return await supabase
    .from('user_quotes')
    .update({ is_pinned: true })
    .eq('id', quoteId)
}
