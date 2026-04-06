<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { useAuthStore } from '@/store/auth'
import Loader from '@/components/Loader.vue'
import { useModal } from '@/composable/useModal.js'
import { showSuccess, showError } from '@/utils/toast.js'

const emit = defineEmits(['close'])

const tasksStore = useTasksStore()
const auth = useAuthStore()

const { modalRef } = useModal(emit)

const category = ref('')
const startTime = ref('')
const endTime = ref('')
const title = ref('')
const description = ref('')
const deadline = ref('')
const priority = ref(3)
const newFiles = ref([])

const loading = ref(false)
const error = ref('')

const dateTouched = ref(false)

const isValidTimeRange = computed(() => {
  if (!startTime.value || !endTime.value) return true

  return startTime.value < endTime.value
})

const isValidDate = computed(() => {
  if (!deadline.value) return true

  const pattern = /^\d{4}-\d{2}-\d{2}$/
  if (!pattern.test(deadline.value)) return false

  const date = new Date(deadline.value)
  if (isNaN(date.getTime())) return false

  const now = new Date()

  // запрещаем прошлые даты
  if (date < now.setHours(0,0,0,0)) return false

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
  if (!isValidTimeRange.value) {
    error.value = 'End time must be after start time'
    return
  }
  loading.value = true
  error.value = ''

  const timeRange = startTime.value && endTime.value
    ? `${startTime.value}-${endTime.value}`
    : null

  try {
    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      deadline: deadline.value || null,
      priority: priority.value,
      newFiles: newFiles.value,
      category: category.value || null,
      time: timeRange,
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

        <select v-model="priority">
          <option :value="1">High</option>
          <option :value="2">Medium</option>
          <option :value="3">Low</option>
        </select>

        <!-- CATEGORY -->
        <select v-model="category">
          <option disabled value="">Select category</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Study">Study</option>
        </select>

        <!-- TIME -->
        <div class="time-range">
          <input
            type="time"
            v-model="startTime"
            placeholder="Start"
          />

          <span class="time-separator">—</span>

          <input
            type="time"
            v-model="endTime"
            placeholder="End"
          />
        </div>

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

          <div class="files-list">
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
          <button class="cancel" @click="emit('close')">
            Cancel
          </button>

          <button
            :class="[!canSubmit || !canAddTask ? 'btn-disabled' : 'save']"
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

.cancel {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 10px 18px;
  border-radius: 22px;
  color: #666;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 120px;
  flex: 1;
}

.cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  color: #333;
}

.cancel:active {
  transform: translateY(0);
}

.save {
  background: linear-gradient(145deg, #7a3cff, #6a2ee0);
  border: 1px solid rgba(122, 60, 255, 0.2);
  border-radius: 40px;
  padding: 10px 20px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: all 0.25s ease;
  max-width: 120px;
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.25);
  position: relative;
  overflow: hidden;
  flex: 1;
}

.save:hover {
  transform: translateY(-2px);
  background: linear-gradient(145deg, #8a4cff, #7a3ee0);
  box-shadow: 0 8px 18px rgba(122, 60, 255, 0.35);
  border-color: rgba(122, 60, 255, 0.3);
}

.save:hover::before {
  left: 100%;
}

.save::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.save:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.2);
}

.btn-disabled {
  background: linear-gradient(145deg, #e0d9f0, #d4cce8);
  border: 1px solid rgba(100, 70, 150, 0.15);
  border-radius: 40px;
  padding: 10px 20px;
  color: #a094b9;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
  cursor: not-allowed;
  flex: 1;
  max-width: 120px;
  box-shadow: none;
  opacity: 0.7;
  position: relative;
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
.time-range {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.time-range input {
  flex: 1;
}

.time-separator {
  font-weight: 600;
  opacity: 0.6;
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
