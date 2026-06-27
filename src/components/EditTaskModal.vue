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
  taskId: {
    type: String,
    required: true
  },
  onSave: {
    type: Function
  },
  isOpen: {
    type: Boolean
  }
})

const task = computed(() => tasksStore.tasks.find(t => t.id === props.taskId))

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
const existingFiles = computed(() => task.value?.task_files ?? [])

/* sync task → form */
watch(
  task,
  (t) => {
    if (!t) return

    title.value = t.title
    description.value = t.description ?? ''
    priority.value = t.priority
    deadline.value = t.deadline
      ? t.deadline.slice(0, 10)
      : null
    category.value = t.category ?? ''

    newFiles.value = []
    filesToDelete.value = []
  },
  { immediate: true }
)
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

  saving.value = true

  try {
    await props.onSave({
      id: task.value.id,
      title: title.value,
      description: description.value,
      priority: priority.value,
      deadline: deadline.value,
      newFiles: newFiles.value,
      filesToDelete: filesToDelete.value,
      category: category.value || null,
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
    <Teleport to="body">
      <Transition name="modal" appear>
        <div v-if="isOpen" class="modal-wrapper">
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

              <!-- FILES SECTION -->
              <div class="files-wrapper">
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
                    @change="onFileChange" />
                  <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 8.00092L7 17C7 17.5523 6.55228 18 6 18C5.44772 18 5.00001 17.4897 5 16.9374C5 16.9374 5 16.9374 5 16.9374C5 16.937 5.00029 8.01023 5.00032 8.00092C5.00031 7.96702 5.00089 7.93318 5.00202 7.89931C5.00388 7.84357 5.00744 7.76644 5.01426 7.67094C5.02788 7.4803 5.05463 7.21447 5.10736 6.8981C5.21202 6.27011 5.42321 5.41749 5.85557 4.55278C6.28989 3.68415 6.95706 2.78511 7.97655 2.10545C9.00229 1.42162 10.325 1 12 1C13.6953 1 14.9977 1.42162 16.0235 2.10545C17.0429 2.78511 17.7101 3.68415 18.1444 4.55278C18.5768 5.41749 18.788 6.27011 18.8926 6.8981C18.9454 7.21447 18.9721 7.4803 18.9857 7.67094C18.9926 7.76644 18.9961 7.84357 18.998 7.89931C18.9991 7.93286 18.9997 7.96641 19 7.99998C19.0144 10.7689 19.0003 17.7181 19 18.001C19 18.0268 18.9993 18.0525 18.9985 18.0782C18.9971 18.1193 18.9945 18.175 18.9896 18.2431C18.9799 18.3791 18.961 18.5668 18.9239 18.7894C18.8505 19.2299 18.7018 19.8325 18.3944 20.4472C18.0851 21.0658 17.6054 21.7149 16.8672 22.207C16.1227 22.7034 15.175 23 14 23C12.825 23 11.8773 22.7034 11.1328 22.207C10.3946 21.7149 9.91489 21.0658 9.60557 20.4472C9.29822 19.8325 9.14952 19.2299 9.07611 18.7894C9.039 18.5668 9.02007 18.3791 9.01035 18.2431C9.00549 18.175 9.0029 18.1193 9.00153 18.0782C9.00069 18.0529 9.00008 18.0275 9 18.0022C8.99621 15.0044 9 12.0067 9 9.00902C9.00101 8.95723 9.00276 8.89451 9.00645 8.84282C9.01225 8.76155 9.02338 8.65197 9.04486 8.5231C9.08702 8.27011 9.17322 7.91749 9.35558 7.55278C9.53989 7.18415 9.83207 6.78511 10.2891 6.48045C10.7523 6.17162 11.325 6 12 6C12.675 6 13.2477 6.17162 13.7109 6.48045C14.1679 6.78511 14.4601 7.18415 14.6444 7.55278C14.8268 7.91749 14.913 8.27011 14.9551 8.5231C14.9766 8.65197 14.9877 8.76155 14.9936 8.84282C14.9984 8.91124 14.9999 8.95358 15 8.99794L15 17C15 17.5523 14.5523 18 14 18C13.4477 18 13 17.5523 13 17V9.00902C12.9995 8.99543 12.9962 8.93484 12.9824 8.8519C12.962 8.72989 12.9232 8.58251 12.8556 8.44722C12.7899 8.31585 12.7071 8.21489 12.6015 8.14455C12.5023 8.07838 12.325 8 12 8C11.675 8 11.4977 8.07838 11.3985 8.14455C11.2929 8.21489 11.2101 8.31585 11.1444 8.44722C11.0768 8.58251 11.038 8.72989 11.0176 8.8519C11.0038 8.93484 11.0005 8.99543 11 9.00902V17.9957C11.0009 18.0307 11.0028 18.0657 11.0053 18.1006C11.0112 18.1834 11.0235 18.3082 11.0489 18.4606C11.1005 18.7701 11.2018 19.1675 11.3944 19.5528C11.5851 19.9342 11.8554 20.2851 12.2422 20.543C12.6227 20.7966 13.175 21 14 21C14.825 21 15.3773 20.7966 15.7578 20.543C16.1446 20.2851 16.4149 19.9342 16.6056 19.5528C16.7982 19.1675 16.8995 18.7701 16.9511 18.4606C16.9765 18.3082 16.9888 18.1834 16.9947 18.1006C16.9972 18.0657 16.9991 18.0307 17 17.9956L16.9999 7.99892C16.9997 7.98148 16.9982 7.91625 16.9908 7.81343C16.981 7.67595 16.9609 7.47303 16.9199 7.2269C16.837 6.72989 16.6732 6.08251 16.3556 5.44722C16.0399 4.81585 15.5821 4.21489 14.9141 3.76955C14.2523 3.32838 13.325 3 12 3C10.675 3 9.7477 3.32838 9.08595 3.76955C8.41793 4.21489 7.96011 4.81585 7.64443 5.44722C7.32678 6.08251 7.16298 6.72989 7.08014 7.2269C7.03912 7.47303 7.019 7.67595 7.00918 7.81343C7.0025 7.90687 7.00117 7.9571 7 8.00092Z" fill="#0F0F0F"/>
                  </svg>  Attach file
                </label>

              </div>

              <p v-if="error" class="error">{{ error }}</p>

              <!-- ACTIONS -->
              <div class="actions">
                <button
                  class="btn btn-cancel"
                  @click="close">
                  Cancel
                </button>

                <button
                  class="btn btn-primary"
                  @click="save">
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>


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
  position: absolute;
  inset: 0;
  background: rgba(15,23,42,.35);
  display: flex;
  justify-content: center;
  align-items: center;
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
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
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

.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
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
</style>
