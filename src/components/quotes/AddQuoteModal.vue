<script setup>

import { ref } from 'vue'
import { useQuotes } from '@/composable/useQuotes'
import { showError, showSuccess } from '@/utils/toast.js'
import { useModal } from '@/composable/useModal.js'
import Loader from '@/components/Loader.vue'

const props = defineProps({
  open: Boolean
})
const loading = ref(false)
const emit = defineEmits(['close', 'saved'])
const { modalRef } = useModal(() => props.open, emit)

const quoteText = ref('')
const quoteAuthor = ref('')

const { createUserQuote } = useQuotes()

const save = async () => {

  if (!quoteText.value.trim()) return
  loading.value = true
  try {
    await createUserQuote(
      quoteText.value,
      quoteAuthor.value
    )
    showSuccess('Quote added!')
    quoteText.value = ''
    quoteAuthor.value = ''

    emit('saved')
    emit('close')
  } catch (e) {
    showError('Failed to add quote', e)
  } finally {
    loading.value = false
  }

}

function close() {
  if (loading.value) return
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="modal-overlay"
        @click.self="close">
        <div
          class="modal"
          ref="modalRef">
          <Loader :visible="loading" />
          <h3>Add your quote</h3>

          <textarea
            v-model="quoteText"
            maxlength="300"
            placeholder="Enter quote..."
          />

          <div class="counter">
            {{ quoteText.length }}/300
          </div>

          <input
            v-model="quoteAuthor"
            placeholder="Author (optional)" />

          <div class="actions">

            <button
              class="cancel"
              @click="close">
              Cancel
            </button>

            <button
              class="save"
              @click="save">
              Save changes
            </button>

          </div>
        </div>

      </div>
    </Transition>
  </Teleport>


</template>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: 420px;
  max-width: 90%;
  background: var(--bg);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: var(--text);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.modal h3 {
  margin: 0;
  font-size: 18px;
}

.modal textarea {
  min-height: 100px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-card);
  font-size: 14px;
  resize: vertical;
  background: var(--quick-input-bg);;
}

.modal input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-card);;
  font-size: 14px;
  background: var(--quick-input-bg);;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid var(--border-card);;
  background: var(--bg);
  cursor: pointer;
  transition: .2s;
}

.counter {
  margin-top: -6px;
  text-align: right;
  font-size: 12px;
  color: #9CA3AF;
}

.cancel:hover {
  background: var(--quick-input-bg);
}

.save {
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #7b5cff;
  color: var(--bg);
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.save:hover {
  opacity: 0.9;
}

.modal input:focus, textarea:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, .12);
}

.fade-enter-active,
.fade-leave-active {
  transition: .25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
