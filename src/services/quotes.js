// services/quotes.js
import { supabase } from '@/services/supabase'

export const getPinnedQuote = async (userId) => {
  const {data} =  await supabase
    .from('user_quotes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_pinned', true)
    .maybeSingle()
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

  console.log(data)
  return data?.id
}

export const getQuoteTranslation = async (quoteId, locale) => {
  console.log('quoteId', quoteId)
  console.log('locale', locale)

  const { data: all } = await supabase
    .from('quote_translations')
    .select('*')

  console.log('ALL', all.length)

  const byId = all.filter(q => q.quote_id === quoteId)

  console.log('BY ID', byId)

  const byLocale = byId.filter(q => q.locale === locale)

  console.log('BY LOCALE', byLocale)

  const { data, error } = await supabase
    .from('quote_translations')
    .select('*')
    .eq('quote_id', quoteId)
    .eq('locale', locale)

  console.log('QUERY RESULT', data)
  console.log(error)

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
  return data
}

export const clearPinned = async (userId) => {
  const { data } = await supabase
    .from('user_quotes')
    .update({ is_pinned: false })
    .eq('user_id', userId)
  return data
}

export const pinUserQuote = async (quoteId) => {
  const { data } = await supabase
    .from('user_quotes')
    .update({ is_pinned: true })
    .eq('id', quoteId)
  return data
}
