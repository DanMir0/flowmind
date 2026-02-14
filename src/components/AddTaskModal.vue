<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { useAuthStore } from '@/store/auth'
import Loader from '@/components/Loader.vue'

const emit = defineEmits(['close'])

const tasksStore = useTasksStore()
const auth = useAuthStore()

const title = ref('')
const description = ref('')
const deadline = ref('')
const priority = ref(3)
const newFiles = ref([])

const loading = ref(false)
const error = ref('')

const canAddTask = computed(() =>
  auth.initialized && auth.user
)

const canSubmit = computed(() =>
  title.value.trim().length > 0
)

function onFileChange(e) {
  newFiles.value.push(...Array.from(e.target.files))
  e.target.value = ''
}

function removeNewFile(index) {
  newFiles.value.splice(index, 1)
}

async function submit() {
  if (!canSubmit.value || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      deadline: deadline.value || null,
      priority: priority.value,
      newFiles: newFiles.value
    })

    emit('close')
  } catch (e) {
    error.value = e.message || 'Failed to add task'
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
      <div class="modal">
        <Loader :visible="loading" />
        <h3>Add Task</h3>

        <input v-model="title" placeholder="Task title" />

        <textarea
          v-model="description"
          placeholder="Description" />

        <input type="date" v-model="deadline" />

        <select v-model="priority">
          <option :value="1">High</option>
          <option :value="2">Medium</option>
          <option :value="3">Low</option>
        </select>

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
  justify-content: flex-end;
  gap: 12px;
}

.save {
  background: #7a3cff;
  border: none;
  padding: 10px 18px;
  border-radius: 22px;
  color: white;
  font-weight: bold;
}

.btn-disabled {
  background: #c6bcda;
  border: none;
  padding: 10px 18px;
  border-radius: 22px;
  color: white;
  font-weight: bold;
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
