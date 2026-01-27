<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const title = ref('')
const description = ref('')
const priority = ref(3)
const deadline = ref(null)
const newFiles = ref([])
const existingFiles = ref([])
const filesToDelete =  ref([])

watch(
  () => props.task,
  (task) => {
    if (!task) return
    title.value = task.title
    description.value = task.description || ''
    priority.value = task.priority
    deadline.value = task.deadline
      ? task.deadline.slice(0, 10)
      : null
    existingFiles.value = task.task_files || []
    filesToDelete.value = []
    newFiles.value = []
  },
  { immediate: true }
)

function onFileChange(e) {
  const files = Array.from(e.target.files)
  newFiles.value.push(...files)
  e.target.value = ''
}

function markFileForDelete(file) {
  existingFiles.value = existingFiles.value.filter(f => f.id !== file.id)
  filesToDelete.value.push(file)
}

function removeNewFile(index) {
  newFiles.value.splice(index, 1)
}

function save() {
  emit('save', {
    id: props.task.id,
    title: title.value,
    description: description.value,
    priority: priority.value,
    deadline: deadline.value,
    newFiles: newFiles.value,
    filesToDelete: filesToDelete.value,
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <h2>Edit Task</h2>

      <input v-model="title" placeholder="Title" />

      <textarea
        v-model="description"
        placeholder="Description"
      />

      <select v-model="priority">
        <option :value="1">High</option>
        <option :value="2">Medium</option>
        <option :value="3">Low</option>
      </select>

      <input type="date" v-model="deadline" />

      <!-- EXISTING FILES -->
      <div v-if="existingFiles.length" class="files-section">
        <p class="label">Attached files</p>

        <div
          v-for="file in existingFiles"
          :key="file.id"
          class="file-preview"
        >
          <span class="file-name">{{ file.file_name }}</span>

          <button
            class="remove-file"
            @click="markFileForDelete(file)"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- ADD FILES -->
      <label class="file-btn">
        <input
          type="file"
          multiple
          class="hidden-input"
          @change="onFileChange"
        />
        📎 Add files
      </label>

      <!-- NEW FILES PREVIEW -->
      <div
        v-for="(file, index) in newFiles"
        :key="file.name + index"
        class="file-preview"
      >
        <span class="file-name">{{ file.name }}</span>

        <button
          class="remove-file"
          @click="removeNewFile(index)"
          type="button"
        >
          ✕
        </button>
      </div>

      <div class="actions">
        <button class="btn save" @click="save">Save</button>
        <button class="btn cancel" @click="emit('close')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  padding: 28px;
  border-radius: 20px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.files-section {
  margin-bottom: 12px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
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
</style>
