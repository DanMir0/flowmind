<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useTasksStore } from '@/store/tasks'
import Loader from '@/components/Loader.vue'
import { toast } from 'vue-sonner'
import { useModal } from '@/composable/useModal.js'
import BaseSelect from '@/components/BaseSelect.vue'

const emit = defineEmits(['close'])
const tasksStore = useTasksStore()

const { modalRef } = useModal(emit)

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  onSave: {
    type: Function
  }
})

const task = computed(() =>
  tasksStore.tasks.find(t => t.id === props.task.id)
)

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
const startTime = ref('')
const endTime = ref('')
const title = ref('')
const description = ref('')
const priority = ref('')
const category = ref('')
const deadline = ref(null)
const error = ref('')

const newFiles = ref([])
const filesToDelete = ref([])

const saving = ref(false)
const filesLoading = ref(false)

/* реактивно берём файлы ИЗ STORE */
const existingFiles = computed(() => task.value?.task_files || [])

const isValidTimeRange = computed(() => {
  if (!startTime.value || !endTime.value) return true
  return startTime.value < endTime.value
})
watch(startTime, (val) => {
  if (!endTime.value && val) {
    const [h, m] = val.split(':')
    const nextHour = String(Number(h) + 1).padStart(2, '0')
    endTime.value = `${nextHour}:${m}`
  }
})
/* sync task → form */
watch(
  task,
  (task) => {
    if (!task) return

    title.value = task.title
    description.value = task.description || ''
    priority.value = task.priority
    deadline.value = task.deadline
      ? task.deadline.slice(0, 10)
      : null
    category.value = task.category || ''

    if (task.time && task.time.includes('-')) {
      const [start, end] = task.time.split('-')
      startTime.value = start
      endTime.value = end
    } else {
      startTime.value = ''
      endTime.value = ''
    }

    newFiles.value = []
    filesToDelete.value = []
  },
  { immediate: true }
)

/* lazy-load файлов */
onMounted(async () => {

  filesLoading.value = true

  try {
    await tasksStore.loadTaskFiles(props.task.id)
  } finally {
    filesLoading.value = false
  }
})

async function onFileChange(e) {
  const selectedFiles = Array.from(e.target.files)

  const existingNames = existingFiles.value.map(f => f.file_name)
  const newNames = newFiles.value.map(f => f.name)

  const duplicates = []
  const filtered = []

  selectedFiles.forEach(file => {
    const duplicateInExisting = existingNames.includes(file.name)
    const duplicateInNew = newNames.includes(file.name)

    if (duplicateInExisting || duplicateInNew) {
      duplicates.push(file.name)
    } else {
      filtered.push(file)
    }
  })

  if (duplicates.length) {
    toast.warning(
      duplicates.length === 1
        ? `File "${duplicates[0]}" already added`
        : `${duplicates.length} files were skipped (already added)`
    )
  }

  if (filtered.length) {
    newFiles.value.push(...filtered)
  }

  e.target.value = ''

  await nextTick()

  const el = document.querySelector('.files-scroll')
  if (el) el.scrollTop = el.scrollHeight
}

/* ТОЛЬКО UI */
function markFileForDelete(file) {
  filesToDelete.value.push(file)
}

function removeNewFile(index) {
  newFiles.value.splice(index, 1)
}

async function save() {
  if (saving.value) return
  if (!isValidTimeRange.value) {
    error.value = 'End time must be after start time'
    return
  }
  saving.value = true

  const timeRange =
    startTime.value && endTime.value
      ? `${startTime.value}-${endTime.value}`
      : null

  try {
    await props.onSave({
      id: props.task.id,
      title: title.value,
      description: description.value,
      priority: priority.value,
      deadline: deadline.value,
      newFiles: newFiles.value,
      filesToDelete: filesToDelete.value,
      category: category.value || null,
      time: timeRange
    })

  emit('close')
  } finally {
    saving.value = false
    newFiles.value = []
  }
}

function close() {
  if (saving.value) return
  emit('close')
}

</script>

<template>
  <div class="modal-wrapper">
    <Loader :visible="saving" />

    <div
      class="modal-backdrop"
      @click.self="emit('close')">
      <div ref="modalRef" class="modal">
        <h2>Edit Task</h2>

        <input v-model="title" placeholder="Title" />

        <textarea
          v-model="description"
          placeholder="Description" />

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

        <input type="date" v-model="deadline" />

        <div class="time-range">
          <input
            type="time"
            v-model="startTime"
          />

          <span class="time-separator">—</span>

          <input
            type="time"
            v-model="endTime"
          />
        </div>

        <p v-if="!isValidTimeRange" class="error">
          End time must be after start time
        </p>

        <!-- FILES SECTION -->
        <div class="files-wrapper">
          <p class="label">Attached files</p>

          <!-- SCROLL AREA (все файлы внутри) -->
          <div class="files-scroll">

            <!-- loading -->
            <div v-if="filesLoading">
              <div
                v-for="i in 2"
                :key="i"
                class="file-skeleton"
              />
            </div>

            <!-- existing files -->
            <TransitionGroup
              v-else
              name="file"
              tag="div">
              <div
                v-for="file in existingFiles.filter(
                  f => !filesToDelete.some(d => d.id === f.id)
                )"
                :key="'existing-' + file.id"
                class="file-preview">
                <span class="file-name">
                  {{ file.file_name }}
                </span>

                <button
                  class="remove-file"
                  type="button"
                  @click="markFileForDelete(file)">
                  ✕
                </button>
              </div>
            </TransitionGroup>

            <!-- new files -->
            <TransitionGroup
              name="file"
              tag="div">
              <div
                v-for="(file, index) in newFiles"
                :key="'new-' + file.name + file.size"
                class="file-preview">
                <span class="file-name">
                  {{ file.name }}
                </span>

                <button
                  class="remove-file"
                  type="button"
                  @click="removeNewFile(index)">
                  ✕
                </button>
              </div>
            </TransitionGroup>

          </div>

          <!-- ADD FILE BUTTON (вне scroll) -->
          <label class="file-btn">
            <input
              type="file"
              multiple
              class="hidden-input"
              @change="onFileChange"
            />
            📎 Add files
          </label>

        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <!-- ACTIONS -->
        <div class="actions">
          <button
            class="btn save"
            @click="save">
            Save
          </button>

          <button
            class="btn cancel"
            @click="close">
            Cancel
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: relative; /* 👈 критично для overlay */
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
  transition: height 0.25s ease;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal h2 {
  margin-bottom: 10px;
}

input,
textarea,
select {
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid #ddd;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn {
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: white;
}

.btn.save {
  background: #7a3cff;
}

.btn.cancel {
  background: #9e9e9e;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #e53935;
}

.files-wrapper {
  margin-bottom: 12px;
}

.files-scroll {
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

/* skeleton loader */
.file-skeleton {
  height: 36px;
  border-radius: 12px;
  margin-bottom: 6px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e6e6e6 37%,
    #f0f0f0 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
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
