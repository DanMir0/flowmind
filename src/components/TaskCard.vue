<script setup>
import { computed, ref } from 'vue'
import {useTasksStore} from '@/store/tasks.js'
import { supabase } from '@/services/supabase.js'
import ExcelIcon from '@/components/icons/ExcelIcon.vue'
import WordIcon from '@/components/icons/WordIcon.vue'
import PdfIcon from '@/components/icons/PdfIcon.vue'
import ImageIcon from '@/components/icons/ImageIcon.vue'
import FileIcon from '@/components/icons/FileIcon.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  class: {
    type: String,
    default: ''
  }
})

const tasksStore = useTasksStore()
const filesLoaded = ref(false)
const localFiles = ref([])
const showAllFiles = ref(false)

const visibleFiles = computed(() => {
  if (showAllFiles.value) return files.value
  return files.value.slice(0, 2)
})

const hasMoreFiles = computed(() => {
  return files.value.length > 2
})

// helper
function getFileIconComponent(file) {
  const name = file.name || file.file_name || ''

  if (name.match(/\.(xls|xlsx)$/i)) return ExcelIcon
  if (name.match(/\.(pdf)$/i)) return PdfIcon
  if (name.match(/\.(doc|docx)$/i)) return WordIcon
  if (name.match(/\.(png|jpg|jpeg|webp)$/i)) return ImageIcon

  return FileIcon
}
async function loadFiles() {
  if (filesLoaded.value) return

  const files = await tasksStore.loadTaskFiles(props.task.id)
  localFiles.value = files
  filesLoaded.value = true
}
defineEmits(['edit', 'delete', 'toggle-complete'])

/**
 * Формат даты (March 18)
 */
function formatTaskDate(date) {
  if (!date) return ''

  const d = new Date(date)

  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Deadline state (overdue / soon)
 */
const deadlineInfo = computed(() => {
  if (!props.task.deadline) {
    return { state: '', label: '' }
  }

  const now = new Date()
  const d = new Date(props.task.deadline)

  if (d < now) {
    return { state: 'overdue', label: 'Overdue' }
  }

  const diff = (d - now) / (1000 * 60 * 60 * 24)

  if (diff <= 2) {
    return { state: 'soon', label: 'Soon' }
  }

  return { state: '', label: '' }
})

/**
 * Priority label
 */
const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 1:
      return 'HIGH'
    case 2:
      return 'MEDIUM'
    default:
      return 'LOW'
  }
})

/**
 * Files (из Supabase)
 */
const files = computed(() => {
  return props.task.task_files || []
})

async function openFile(file) {
  const { data, error } = await supabase
    .storage
    .from('task-files')
    .createSignedUrl(file.file_path, 60)

  if (error) {
    console.error(error)
    return
  }

  window.open(data.signedUrl, '_blank')
}
</script>
<template>
  <div
    class="task-card"
    :class="[deadlineInfo.state, { completed: task.completed }]"
  >
    <!-- HEADER -->
    <div class="header">
      <div class="left">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="$emit('toggle-complete', task)"
        />

        <h3 class="title">
          {{ task.title }}
        </h3>
      </div>

      <div class="right">
        <div
          v-if="deadlineInfo.state === 'overdue'"
          class="badge overdue"
        >
          ⏱️ Overdue
        </div>
      </div>
    </div>

    <!-- CATEGORY -->
    <div v-if="task.category" class="category">
      {{ task.category }}
    </div>

    <!-- DESCRIPTION -->
    <p v-if="task.description" class="description">
      {{ task.description }}
    </p>

    <!-- FILES -->
    <div
      v-if="visibleFiles.length || !filesLoaded"
      class="attachments"
      @mouseenter="loadFiles"
    >
      <div class="attachments-title">Attachments:</div>

      <div
        v-for="file in visibleFiles"
        :key="file.id"
        class="file"
        @click="openFile(file)"
      >
        <component :is="getFileIconComponent(file)" class="file-icon" />
        <span>{{ file.name || file.file_name }}</span>
      </div>

      <!-- SHOW MORE -->
      <div
        v-if="hasMoreFiles && !showAllFiles"
        class="show-more"
        @click="showAllFiles = true"
      >
        +{{ files.length - 2 }} more
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="meta">
        <span class="priority">
          Priority: {{ priorityLabel }}
        </span>

        <span class="dot">•</span>

        <span
          class="date"
          :class="{ overdue: deadlineInfo.state === 'overdue' }"
        >
          Due: {{ formatTaskDate(task.deadline) }}
        </span>
      </div>

      <!-- TIME -->
      <div v-if="task.time" class="time">
        Time: {{ task.time }}
      </div>
    </div>

    <!-- ACTIONS -->
    <div class="actions">
      <button
        class="btn edit"
        @click="$emit('edit', task)"
      >
        Edit
      </button>

      <button
        class="btn delete"
        @click="$emit('delete', task)"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.file {
  display: flex;
  flex-direction: row;
  gap: 3px;
  cursor: pointer;
  padding: 4px 0;
  transition: opacity 0.2s;
}

.file:hover {
  opacity: 0.7;
}

.show-more {
  font-size: 12px;
  color: #888;
  cursor: pointer;
  margin-top: 4px;
}

.task-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: 0.2s;
  height: 100%;
}

.task-card:hover {
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

/* BADGE */
.badge {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
}

.badge.overdue {
  background: #fee2e2;
  color: #b91c1c;
}

/* CATEGORY */
.category {
  display: inline-block;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  width: fit-content;
}

/* DESCRIPTION */
.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* ATTACHMENTS */
.attachments {
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.attachments-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.file {
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

/* FOOTER */
.footer {
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.meta {
  font-size: 13px;
  color: #6b7280;
}

.dot {
  margin: 0 6px;
}

.date.overdue {
  color: #dc2626;
  font-weight: 600;
}

.time {
  font-size: 13px;
  color: #374151;
  margin-top: 4px;
}

/* COMPLETED */
.task-card.completed {
  opacity: 0.6;
}

.task-card.completed .title {
  text-decoration: line-through;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.btn {
  flex: 1;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn.edit {
  background: #ede9fe;
  color: #6d28d9;
}

.btn.edit:hover {
  background: #ddd6fe;
}

.btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.btn.delete:hover {
  background: #fecaca;
}
</style>
