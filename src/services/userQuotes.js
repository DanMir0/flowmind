import { supabase } from '@/services/supabase'

export const getUserQuotes = async (userId) => {

  const { data, error } = await supabase
    .from('user_quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export const deleteUserQuote = async (id) => {

  const { error } = await supabase
    .from('user_quotes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const pinUserQuote = async (userId, quoteId) => {

  // сначала снимаем pin со всех
  await supabase
    .from('user_quotes')
    .update({ is_pinned: false })
    .eq('user_id', userId)

  // ставим pin нужной
  const { error } = await supabase
    .from('user_quotes')
    .update({ is_pinned: true })
    .eq('id', quoteId)

  if (error) throw error
}
