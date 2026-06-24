<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { useAuthStore } from '@/store/auth'
import Loader from '@/components/Loader.vue'
import { useModal } from '@/composable/useModal.js'
import { showSuccess, showError } from '@/utils/toast.js'
import BaseSelect from '@/components/BaseSelect.vue'

const emit = defineEmits(['close'])

const tasksStore = useTasksStore()
const auth = useAuthStore()

const { modalRef } = useModal(emit)

const category = ref('')
const title = ref('')
const description = ref('')
const deadline = ref('')
const priority = ref(3)
const newFiles = ref([])

const loading = ref(false)
const error = ref('')

const dateTouched = ref(false)

const categories = [
  'Work', 'Personal', 'Study', 'Workout', 'Appointments',
  'Ideas', 'Health', 'Home', 'Social', 'Travel', 'Learning',
  'Deadlines', 'Shopping', 'Family', 'Creative'
]
const priorities = [
  { label: 'High', value: 1},
  { label: 'Medium', value: 2},
  { label: 'Low', value: 3},
]

const isValidDate = computed(() => {
  if (!deadline.value) return true

  const pattern = /^\d{4}-\d{2}-\d{2}$/
  if (!pattern.test(deadline.value)) return false

  const date = new Date(deadline.value)
  if (isNaN(date.getTime())) return false

  const now = new Date()

  // запрещаем прошлые даты
  if (date < now.setHours(0, 0, 0, 0)) return false

  // ограничим верхний диапазон
  const max = new Date()
  max.setFullYear(max.getFullYear() + 20)

  if (date > max) return false

  return true
})

const canAddTask = computed(() =>
  auth.initialized && auth.user
)

const canSubmit = computed(() =>
  title.value.trim().length > 0 && isValidDate.value
)

function onFileChange(e) {
  newFiles.value.push(...Array.from(e.target.files))
  e.target.value = ''
}

function removeNewFile(index) {
  newFiles.value.splice(index, 1)
}

async function submit() {
  if (!isValidDate.value) {
    error.value = 'Invalid deadline date'
    return
  }
  if (!canSubmit.value || loading.value) return

  loading.value = true
  error.value = ''


  try {
    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      deadline: deadline.value || null,
      priority: priority.value,
      newFiles: newFiles.value,
      category: category.value || null,
    })
    showSuccess('Task added!')
    emit('close')

  } catch (e) {
    showError('Failed to add task')
  } finally {
    loading.value = false
    newFiles.value = []
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="modal-wrapper">
    <div class="modal-backdrop" @click.self="!loading && emit('close')">
      <div ref="modalRef" class="modal">
        <Loader :visible="loading" />
        <h3>Add Task</h3>

        <input v-model="title" placeholder="Task title" />

        <textarea
          v-model="description"
          placeholder="Description" />

        <input type="date" v-model="deadline" @blur="dateTouched = true"/>
        <p v-if="dateTouched && !isValidDate" class="error">
          Please enter a valid date
        </p>

        <BaseSelect
          v-model="priority"
          :options="priorities"
          labelKey="label"
          valueKey="value"
          placeholder="Select priority"/>

        <!-- CATEGORY -->
        <BaseSelect
          v-model="category"
          :options="categories"
          placeholder="Select category"/>

        <!-- File upload -->
        <div class="file-upload">

          <label class="file-btn">
            <input
              type="file"
              multiple
              class="hidden-input"
              @change="onFileChange" />
            📎 Attach file
          </label>

          <div v-if="newFiles.length > 0" class="files-list">
            <TransitionGroup name="file" tag="div">
              <div
                v-for="(file, index) in newFiles"
                :key="file.name + file.size"
                class="file-preview">
                <span class="file-name">{{ file.name }}</span>

                <button
                  class="remove-file"
                  type="button"
                  @click="removeNewFile(index)">
                  ✕
                </button>
              </div>
            </TransitionGroup>
          </div>

        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="actions">
          <button class="btn btn-cancel" @click="emit('close')">
            Cancel
          </button>

          <button
            class="btn btn-primary"
            :disabled="!canSubmit || !canAddTask"
            @click="submit">
            {{ loading ? 'Saving...' : 'Add Task' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input, textarea, select {
  margin-bottom: 0 !important;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.files-list {
  min-height: 40px;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 4px;
}

.files-list::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-thumb {
  background: rgba(122, 60, 255, 0.4);
  border-radius: 6px;
}

.files-list::-webkit-scrollbar-track {
  background: transparent;
}

.modal {
  will-change: transform, opacity;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 28px;
  border-radius: 20px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.12),
  0 15px 30px rgba(0, 0, 0, 0.08);
}

.modal input,
.modal textarea,
.modal select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  margin-bottom: 14px;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn {
  flex: 1;
  max-width: 120px;
  padding: 10px 18px;
  border-radius: 22px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #7a3cff;
  color: #ffffff;
  border: none;
  box-shadow: 0 2px 6px rgba(122, 60, 255, 0.25);
}

.btn-primary:hover {
  background: #6633d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.35);
}

.btn-primary:disabled {
  background: #c4b0f0;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #444;
}

.btn-cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-2px);
}

.error {
  color: #e53935;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.hidden-input {
  display: none;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px dashed #7a3cff;
  background: rgba(122, 60, 255, 0.05);
  color: #7a3cff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-btn:hover {
  background: rgba(122, 60, 255, 0.12);
}

.file-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7f5ff;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 6px;
  font-size: 14px;
}

.file-name {
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-file {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #e53935;
}

.time-range input {
  flex: 1;
}

</style>
<style>
/* TransitionGroup animations */
.file-enter-active,
.file-leave-active,
.file-move {
  transition: all 0.2s ease;
}

.file-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.file-leave-to {
  opacity: 0;
  transform: translateX(6px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-backdrop .modal,
.modal-leave-active .modal-backdrop .modal {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
  opacity 0.25s ease;
}

.modal-enter-from .modal-backdrop .modal {
  transform: translateY(60px) scale(0.9);
  opacity: 0;
}

.modal-leave-to .modal-backdrop .modal {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}
</style>
