<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { useAuthStore } from '@/store/auth'

const emit = defineEmits(['close'])

const tasksStore = useTasksStore()
const auth = useAuthStore()

const title = ref('')
const description = ref('')
const deadline = ref('')
const priority = ref(3)
const file = ref(null)

const loading = ref(false)
const error = ref('')

const canAddTask = computed(() =>
  auth.initialized && auth.user
)

const canSubmit = computed(() =>
  title.value.trim().length > 0
)

function onFileChange(e) {
  const selected = e.target.files[0]
  if (!selected) return
  file.value = selected
}

function removeFile() {
  file.value = null
}

async function submit() {
  if (!canSubmit.value) return

  loading.value = true
  error.value = ''

  try {
    await tasksStore.addTask({
      title: title.value,
      description: description.value,
      deadline: deadline.value || null,
      priority: priority.value,
      file: file.value || null
    })

    emit('close')
  } catch (e) {
    error.value = e.message || 'Failed to add task'
  } finally {
    loading.value = false
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
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal">
        <h3>Add Task</h3>

        <input v-model="title" placeholder="Task title" />

        <textarea
          v-model="description"
          placeholder="Description"
        />

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
              class="hidden-input"
              @change="onFileChange"
            />
            📎 Attach file
          </label>

          <div v-if="file" class="file-preview">
            <span class="file-name">{{ file.name }}</span>

            <button
              class="remove-file"
              type="button"
              @click="removeFile"
            >
              ✕
            </button>
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
            @click="submit"
          >
            {{ loading ? 'Saving...' : 'Add Task' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  width: 420px;
  background: white;
  padding: 28px;
  border-radius: 18px;
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
  align-items: center;
  justify-content: space-between;
  background: #f7f5ff;
  border-radius: 12px;
  padding: 10px 14px;
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
