<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  quote: Object
})

const emit = defineEmits([
  'close',
  'save'
])

const form = reactive({
  text: '',
  author: ''
})

watch(
  () => props.quote,
  (quote) => {
    if (!quote) return

    form.text = quote.text
    form.author = quote.author || ''
  },
  { immediate: true }
)

const save = () => {
  emit('save', {
    id: props.quote.id,
    text: form.text.trim(),
    author: form.author.trim()
  })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click="$emit('close')">

        <div
          class="modal"
          @click.stop>

          <h3>Edit quote</h3>

          <textarea
            v-model="form.text"
            maxlength="500"
            placeholder="Write your quote..." />

          <div class="counter">
            {{ form.text.length }}/500
          </div>

          <input
            v-model="form.author"
            maxlength="100"
            placeholder="Author (optional)" />

          <div class="actions">

            <button
              class="cancel"
              @click="$emit('close')">
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
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
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
  box-shadow: 0 15px 40px rgba(0,0,0,.12);
}

.modal h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.modal textarea {
  min-height: 120px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  resize: vertical;
  transition: .2s;
}

.modal textarea:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}

.modal input {
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
  transition: .2s;
}

.modal input:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}

.counter {
  margin-top: -6px;
  font-size: 12px;
  color: #9CA3AF;
  text-align: right;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel {
  padding: 12px 18px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  transition: .2s;
}

.cancel:hover {
  background: #F9FAFB;
}

.save {
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: #7b5cff;
  color: white;
  cursor: pointer;
  transition: .2s;
}

.save:hover {
  opacity: .9;
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
