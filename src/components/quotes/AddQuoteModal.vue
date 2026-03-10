<script setup>

import { ref } from 'vue'
import { useQuotes } from '@/composable/useQuotes'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close'])

const quoteText = ref('')
const quoteAuthor = ref('')

const { createUserQuote } = useQuotes()

const save = async () => {

  if (!quoteText.value.trim()) return

  await createUserQuote(
    quoteText.value,
    quoteAuthor.value
  )

  quoteText.value = ''
  quoteAuthor.value = ''

  emit('close')

}

</script>

<template>

  <div
    v-if="open"
    class="modal-overlay"
    @click="emit('close')">

    <div
      class="modal"
      @click.stop>

      <h3>Add your quote</h3>

      <textarea
        v-model="quoteText"
        placeholder="Write your quote..." />

      <input
        v-model="quoteAuthor"
        placeholder="Author (optional)" />

      <button
        class="save"
        @click="save">
        Save quote
      </button>

    </div>

  </div>

</template>
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: 420px;
  max-width: 90%;
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
}

.modal h3 {
  margin: 0;
  font-size: 18px;
}

.modal textarea {
  min-height: 100px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
  resize: vertical;
}

.modal input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.save {
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #7b5cff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.save:hover {
  opacity: 0.9;
}
</style>
