import { supabase } from '@/services/supabase'
import {handleSupabaseError} from '@/utils/appError.js'

export const getUserQuotes = async (userId) => {
  const { data, error } = await supabase
    .from('user_quotes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) handleSupabaseError(error, 'getUserQuotes')

  return data
}

export const deleteUserQuote = async (id) => {

  const { error } = await supabase
    .from('user_quotes')
    .delete()
    .eq('id', id)

  if (error) handleSupabaseError(error, 'deleteUserQuote')
}

export const updateUserQuote = async (quoteId, payload) => {

  const { data, error } = await supabase
    .from('user_quotes')
    .update({
      text: payload.text,
      author: payload.author
    })
    .eq('id', quoteId)
    .select()
    .single()

  if (error) {
    handleSupabaseError(error, 'updateUserQuote')
  }

  return data
}
