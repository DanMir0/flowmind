import { ref, watch, nextTick, onUnmounted } from 'vue'
import { createFocusTrap } from 'focus-trap'

export function useModal(props, emit) {
  const modalRef = ref(null)

  let trap = null
  let previouslyFocusedElement = null

  function handleEsc(e) {
    if (e.key === 'Escape') {
      emit('close')
    }
  }

  watch(
    () => props.isOpen,
    async (open) => {
      if (open) {
        previouslyFocusedElement = document.activeElement

        await nextTick()

        if (!modalRef.value) return

        document.body.style.overflow = 'hidden'

        document.addEventListener('keydown', handleEsc)

        trap = createFocusTrap(modalRef.value, {
          escapeDeactivates: false,
          clickOutsideDeactivates: false
        })

        trap.activate()
      } else {
        trap?.deactivate()
        trap = null

        document.body.style.overflow = ''

        document.removeEventListener('keydown', handleEsc)

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
  })

  return {
    modalRef
  }
}
