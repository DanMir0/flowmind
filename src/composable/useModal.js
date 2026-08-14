import { ref, watch, nextTick, onUnmounted } from 'vue'
import { createFocusTrap } from 'focus-trap'

export function useModal(isOpen, emit) {
  const modalRef = ref(null)

  let trap = null
  let previouslyFocusedElement = null

  function handleEsc(e) {
    if (e.key === 'Escape') {
      emit('close')
    }
  }

  function handleClickOutside(e) {
    // Проверяем, что клик был вне модального окна
    if (modalRef.value && !modalRef.value.contains(e.target)) {
      emit('close')
    }
  }

  watch(
    isOpen,
    async (open) => {
      if (open) {
        previouslyFocusedElement = document.activeElement

        await nextTick()

        if (!modalRef.value) return

        document.body.style.overflow = 'hidden'

        document.addEventListener('keydown', handleEsc)
        document.addEventListener('mousedown', handleClickOutside)

        trap = createFocusTrap(modalRef.value, {
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
          allowOutsideClick: true
        })

        trap.activate()
      } else {
        trap?.deactivate()
        trap = null

        document.body.style.overflow = ''

        document.removeEventListener('keydown', handleEsc)
        document.removeEventListener('mousedown', handleClickOutside)

        previouslyFocusedElement?.focus?.()
      }
    },
    {
      immediate: true
    }
  )

  onUnmounted(() => {
    trap?.deactivate()
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEsc)
    document.removeEventListener('mousedown', handleClickOutside)
  })

  return {
    modalRef
  }
}
