import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { createFocusTrap } from 'focus-trap'

export function useModal(emit) {
  const modalRef = ref(null)
  let trap = null
  let previouslyFocusedElement = null

  function lockScroll() {
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll() {
    document.body.style.overflow = ''
  }

  function handleEsc(e) {
    if (e.key === 'Escape') {
      emit('close')
    }
  }

  onMounted(async () => {
    previouslyFocusedElement = document.activeElement

    await nextTick()

    trap = createFocusTrap(modalRef.value, {
      escapeDeactivates: false,
      clickOutsideDeactivates: false
    })

    trap.activate()

    lockScroll()
    document.addEventListener('keydown', handleEsc)
  })

  onUnmounted(() => {
    if (trap) trap.deactivate()

    unlockScroll()
    document.removeEventListener('keydown', handleEsc)

    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus()
    }
  })

  return {
    modalRef
  }
}
