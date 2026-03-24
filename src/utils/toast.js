import { toast } from 'vue-sonner'

export const showSuccess = (msg) =>
  toast.success(msg, {
    style: {
      background: '#7c3aed',
      color: '#fff'
    }
  })

export const showError = (msg) =>
  toast.error(msg, {
    style: {
      background: '#ef4444',
      color: '#fff'
    }
  })
