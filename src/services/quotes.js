// services/quotes.js
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/auth'

export const getPinnedQuote = async () => {
  const authStore = useAuthStore()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      pinned_quote_id,
      pinned_quote_type
    `)
    .eq('user_id', authStore.user.id)
    .maybeSingle()

  if (error)
    throw error

  return data
}

export const getQuotesCount = async () => {
  const {count} = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  return count
}

export const getQuoteIdByIndex = async (index) => {
  const { data } = await supabase
    .from('quotes')
    .select('id')
    .eq('is_active', true)
    .range(index, index)
    .maybeSingle()

  return data?.id
}

export const getQuoteTranslation = async (quoteId, locale) => {

  const { data: all } = await supabase
    .from('quote_translations')
    .select('*')

  const { data, error } = await supabase
    .from('quote_translations')
    .select('*')
    .eq('quote_id', quoteId)
    .eq('locale', locale)

  return data?.[0] ?? null
}
export const addUserQuote = async (userId, text, locale, author) => {
  const {data} = await supabase
    .from('user_quotes')
    .insert({
      user_id: userId,
      text,
      locale: locale,
      author: author,
    })
    .select()
    .single()
  return data
}

export const clearPinned = async (userId) => {
  const { data } = await supabase
    .from('user_quotes')
    .update({ is_pinned: false })
    .eq('user_id', userId)
  return data
}

export const pinUserQuote = async (quoteId, userId) => {

  const { error } = await supabase
    .from('profiles')
    .update({
      pinned_quote_id: quoteId,
      pinned_quote_type: 'user',
      use_random_quotes: false
    })
    .eq('user_id', userId)

  if (error) throw error
}

export const pinSystemQuote = async (quoteId) => {
  const authStore = useAuthStore()
  const { error } = await supabase
    .from('profiles')
    .update({
      pinned_quote_id: quoteId,
      pinned_quote_type: 'system',
      use_random_quotes: false
    })
    .eq('user_id', authStore.user.id)

  if (error) throw error
}

export const clearPinnedQuote = async (userId) => {

  const { error } = await supabase
    .from('profiles')
    .update({
      pinned_quote_id: null,
      pinned_quote_type: null
    })
    .eq('user_id', userId)

  if (error) throw error
}
