<script setup>
import { ref, watch, computed } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { showSuccess, showError } from '@/utils/toast'
import BaseSelect from '@/components/BaseSelect.vue'
import { useModal } from '@/composable/useModal.js'

const props = defineProps({
  open: Boolean,
  selectedDate: {
    type: Date,
    required: true
  }
})

const emit = defineEmits(['close'])
const { modalRef } = useModal(() => props.open, emit)

const tasksStore = useTasksStore()

const title = ref('')
const description = ref('')
const priority = ref(3)
const priorities = [
  { label: 'High', value: 1},
  { label: 'Medium', value: 2},
  { label: 'Low', value: 3},
]

watch(
  () => props.open,
  (value) => {
    if (value) {
      title.value = ''
      description.value = ''
      priority.value = 3
    }
  }
)

const formattedDate = computed(() => {
  return props.selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const save = async () => {
  if (!title.value.trim()) return

  try {

    const deadline = new Date(props.selectedDate)
    deadline.setHours(12, 0, 0, 0)

    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      priority: priority.value,
      deadline: deadline.toISOString()
    })

    showSuccess('Task created')

    emit('close')

  } catch (e) {
    showError('Failed to create task')
  }
}
</script>

<template>

  <Teleport to="body">

    <Transition name="modal" appear>

      <div
        v-if="open"
        class="overlay"
        @click.self="emit('close')">

        <div
          ref="modalRef"
          class="modal">

          <h2>Add task</h2>

          <div class="selected-date">
            {{ formattedDate }}
          </div>

          <input
            v-model="title"
            placeholder="Task title" />

          <textarea
            v-model="description"
            placeholder="Description (optional)"
          />

          <label>Priority</label>

          <BaseSelect
            v-model="priority"
            :options="priorities"
            labelKey="label"
            valueKey="value"
            placeholder="Select priority"/>

          <div class="buttons">

            <button
              class="cancel"
              @click="emit('close')">
              Cancel
            </button>

            <button
              class="save"
              @click="save">
              Add task
            </button>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>

</template>

<style scoped>

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  width: 430px;
  background: var(--bg);
  border-radius: 22px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, .12);
  color: var(--text);
}

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.selected-date {
  background: var(--quick-input-bg);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  color: #6B7280;
}

input,
textarea,
select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  outline: none;
  transition: .2s;
  box-sizing: border-box;
  background: var(--quick-input-bg);
  color: var(--text);
}

textarea {
  min-height: 110px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #7C3AED;
}

label {
  font-size: 13px;
  color: #6B7280;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 6px;
}

.cancel {
  border: 1px solid var(--bg-btn-cancel);
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
  background: var(--bg-btn-cancel);
  color: #444;
}

.cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-2px);
}

.save {
  border: none;
  background: #7a3cff;
  color: var(--bg);;
  border-radius: 12px;
  padding: 12px 22px;
  cursor: pointer;
}

.save:hover {
  background: #6633d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.35);
}

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .overlay {
    padding: 0;
  }

  .modal {
    max-width: 400px;
    padding: 24px;
    border-radius: 18px;
    gap: 14px;
  }

  h2 {
    font-size: 20px;
  }

  input,
  textarea,
  select {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 10px;
  }

  textarea {
    min-height: 90px;
  }

  .selected-date {
    padding: 10px;
    font-size: 13px;
  }

  .cancel,
  .save {
    padding: 10px 16px;
    font-size: 13px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .overlay {
    padding: 0;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal {
    max-width: 100%;
    padding: 20px 16px 24px;
    border-radius: 24px 24px 0 0;
    animation: slideUp 0.3s ease;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
    border: none;
    border-top: 1px solid var(--border, #e2e8f0);
    gap: 12px;
  }

  /* Полоска сверху для закрытия */
  .modal::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--border, #e2e8f0);
    border-radius: 2px;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  h2 {
    font-size: 18px;
    margin-bottom: 2px;
  }

  .selected-date {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 10px;
  }

  input,
  textarea,
  select {
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 10px;
  }

  textarea {
    min-height: 80px;
  }

  label {
    font-size: 12px;
    margin-top: -4px;
  }

  .buttons {
    flex-direction: row;
    gap: 10px;
    margin-top: 4px;
  }

  .cancel,
  .save {
    flex: 1;
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 10px;
    text-align: center;
    justify-content: center;
  }

  .cancel {
    flex: 0.5;
  }

  .save {
    flex: 1;
  }
}

/* ===== ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px) ===== */
@media (max-width: 380px) {
  .overlay {
    padding: 0;
  }

  .modal {
    padding: 16px 12px 20px;
    border-radius: 20px 20px 0 0;
  }

  .modal::before {
    width: 32px;
    height: 3px;
    top: 8px;
  }

  h2 {
    font-size: 16px;
  }

  .selected-date {
    font-size: 12px;
    padding: 6px 10px;
  }

  input,
  textarea,
  select {
    padding: 8px 10px;
    font-size: 13px;
    border-radius: 8px;
  }

  textarea {
    min-height: 60px;
  }

  .cancel,
  .save {
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 8px;
  }
}
</style>
<style>
/* TransitionGroup animations */
.file-enter-active,
.file-leave-active,
.file-move {
  transition:
    transform .2s ease,
    opacity .2s ease;
}

.file-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.file-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateX(6px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity .25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition:
    transform .35s cubic-bezier(.16,1,.3,1),
    opacity .25s ease;
}
.modal-enter-from .modal {
  transform: translateY(45px) scale(.95);
  opacity: 0;
}
.modal-leave-to .modal {
  transform: translateY(20px) scale(.98);
  opacity: 0;
}

/* Для мобильных - анимация снизу */
@media (max-width: 767px) {
  .modal-enter-from .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-leave-to .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 1;
  }
}

/* ========================================
   ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ TRANSITION GROUP
   ======================================== */
.file-enter-active,
.file-leave-active,
.file-move {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.file-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.file-leave-to {
  opacity: 0;
  position: absolute;
  transform: translateX(6px);
}
</style>
