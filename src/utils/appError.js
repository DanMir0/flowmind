// /utils/appError.js
import { toast } from 'vue-sonner'
/**
 * Унифицированная ошибка приложения
 */
export class AppError extends Error {

  constructor(message, options = {}) {
    super(message)

    this.name = 'AppError'

    // машинный код ошибки (для логики)
    this.code = options.code || 'UNKNOWN_ERROR'

    // тип ошибки (для UI/UX)
    this.type = options.type || 'unknown'

    // оригинальная ошибка (для дебага)
    this.original = options.original || null

    // контекст (где произошла ошибка)
    this.context = options.context || null
  }

}

/**
 * Обработка ошибок Supabase
 */
export const handleSupabaseError = (error, context = '') => {

  if (!error) return

  console.error('[Supabase Error]', context, error)

  const appError = new AppError(
    normalizeSupabaseMessage(error),
    {
      code: error.code || 'SUPABASE_ERROR',
      type: mapSupabaseErrorType(error),
      original: error,
      context
    }
  )

  toast.error(appError.message)

  throw appError
}

/**
 * Нормализация сообщений (чтобы не показывать сырой текст)
 */
const normalizeSupabaseMessage = (error) => {

  const message = error.message || ''

  // можно расширять по мере необходимости
  if (message.includes('JWT')) {
    return 'Session expired. Please log in again.'
  }

  if (message.includes('permission denied')) {
    return 'You do not have access to this resource.'
  }

  if (message.includes('violates row-level security')) {
    return 'Access denied.'
  }

  if (message.includes('network')) {
    return 'Network error. Check your connection.'
  }

  return 'Something went wrong. Please try again.'
}


/**
 * Типизация ошибок (для UI логики)
 */
const mapSupabaseErrorType = (error) => {

  const message = error.message || ''

  if (message.includes('JWT')) return 'auth'
  if (message.includes('permission')) return 'auth'
  if (message.includes('row-level')) return 'auth'

  if (message.includes('network')) return 'network'

  return 'database'
}
