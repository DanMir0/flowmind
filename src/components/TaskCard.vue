<script setup>
import { computed, ref, watch } from 'vue'
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

const showAllFiles = ref(false)

const visibleFiles = computed(() => {
  if (!files.value || files.value.length === 0) return []
  if (showAllFiles.value) return files.value
  return files.value.slice(0, 2)
})

const priorityClass = computed(() => {
  switch (props.task?.priority) {
    case 1:
      return 'priority-high'
    case 2:
      return 'priority-medium'
    case 3:
      return 'priority-low'
    default:
      return 'priority-low'
  }
})
const categoryClass = computed(() => {
  const category = props.task?.category

  switch (category) {
    case 'Work':
      return 'category-work'

    case 'Personal':
      return 'category-personal'

    case 'Health':
      return 'category-health'

    case 'Study':
      return 'category-study'

    case 'Creative':
      return 'category-creative'

    default:
      return 'category-default'
  }
})

const dateClass = computed(() => {
  if (deadlineInfo.value?.state === 'overdue') {
    return 'date-overdue'
  }

  if (deadlineInfo.value?.state === 'today') {
    return 'date-today'
  }

  return 'date-default'
})

const hasMoreFiles = computed(() => {
  return (files.value?.length || 0) > 2
})
const hasFiles = computed(() => {
 return  (files.value?.length || 0) > 0
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
defineEmits(['edit', 'delete', 'toggle-complete'])

watch(
  () => props.task,
  (t) => {
    console.log('Task', t)
  },
  { immediate: true }
)

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

  const today = new Date()
  today.setHours(0,0,0,0)

  const deadline = new Date(props.task.deadline)
  deadline.setHours(0,0,0,0)

 if (deadline < today) {
   return {state:  'overdue', label: 'Overdue'}
 }

 if (deadline.getTime() === today.getTime()) {
   return {state: 'today', label: 'Today'}
 }

 return {state: '', label: ''}

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
  console.log('FILES RENDER', props.task.task_files)
    return props.task.task_files ?? []
}
)

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
  <div v-if="task._skeleton" class="task-card skeleton">
    <div class="header">
      <div class="skeleton-checkbox"></div>
      <div class="skeleton-title"></div>
    </div>

    <div class="skeleton-category"></div>
    <div class="skeleton-text"></div>

    <div class="attachments">
      <div class="file-skeleton" v-for="i in 2" :key="i"></div>
    </div>

    <div class="footer">
      <div class="skeleton-meta"></div>
    </div>
  </div>
  <div
    v-else
    class="task-card"
    :class="[deadlineInfo.state, { completed: task.completed }]"
  >
    <!-- HEADER -->
    <div class="header">
      <div class="left">
        <label class="task-checkbox">
          <input type="checkbox" :checked="task.completed" @change="$emit('toggle-complete', task)" />

          <span class="checkbox-custom">
            <svg class="check-icon" viewBox="0 0 24 24">
            <path
              d="M20 6L9 17L4 12"
              stroke="currentColor"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round" />
           </svg>
          </span>
        </label>

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
    <div v-if="task.category" class="category" :class="categoryClass">
      {{ task.category }}
    </div>

    <!-- DESCRIPTION -->
    <p v-if="task.description" class="description">
      {{ task.description }}
    </p>

    <!-- FILES -->
    <div v-if="hasFiles" class="attachments">
      <div class="attachments-title">Attachments:</div>

      <div v-if="task.files_loading">
        <div class="file-skeleton" v-for="i in 2" :key="i"></div>
      </div>

      <div v-else-if="hasFiles">
        <div
          v-for="file in visibleFiles"
          :key="file.id || file.tempId"
          class="file"
          @click="openFile(file)">
          <component :is="getFileIconComponent(file)" class="file-icon" />
          <span>{{ file.file_name }}</span>
        </div>
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
        <span :class="priorityClass" class="priority-pill font-bold">{{ priorityLabel }}</span>

        <span v-show="task.deadline" class="dot">•</span>

        <span :class="dateClass">{{ formatTaskDate(task.deadline) }}</span>
      </div>

    </div>

    <!-- ACTIONS -->
    <div class="actions">
      <button
        class="btn edit"
        @click="$emit('edit', task.id)"
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
.task-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-custom {
  width: 18px;
  height: 18px;

  border: 2px solid #D1D5DB;
  border-radius: 6px;

  background: white;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.2s ease;

  flex-shrink: 0;
}

.task-checkbox input {
  display: none;
}

.task-checkbox:hover .checkbox-custom {
  border-color: #7C3AED;
}

.task-checkbox input:checked + .checkbox-custom {
  background: #7C3AED;
  border-color: #7C3AED;
}

.check-icon {
  width: 12px;
  height: 12px;

  color: white;

  opacity: 0;
  transform: scale(0.8);

  transition: all 0.15s ease;
}

.task-checkbox input:checked + .checkbox-custom .check-icon {
  opacity: 1;
  transform: scale(1);
}

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
  color: #7a3cff;
  cursor: pointer;
  margin-top: 6px;
  font-weight: 500;
}

.show-more:hover {
  text-decoration: underline;
}

.task-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f1f1;

  display: flex;
  flex-direction: column;
  gap: 8px;

  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
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
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
  color: #111827;
}

/* BADGE */
.badge {
  font-size: 11px;
  padding: 4px 8px;;
  border-radius: 999px;
  font-weight: 600;
}

.badge.overdue {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

/* CATEGORY */
.category {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* Work */
.category-work {
  background: #ECFDF3;
  color: #027A48;
}

/* Personal */
.category-personal {
  background: #F5F3FF;
  color: #7C3AED;
}

/* Health */
.category-health {
  background: #ECFEFF;
  color: #0F766E;
}

/* Study */
.category-study {
  background: #EEF2FF;
  color: #4338CA;
}

/* Creative */
.category-creative {
  background: #FFF7ED;
  color: #EA580C;
}

/* Default */
.category-default {
  background: #F3F4F6;
  color: #6B7280;
}

/* DESCRIPTION */
.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #6B7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* PRIORITY */
.priority-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.priority-low {
  background: #EFF6FF;
  color: #2563EB;
}

.priority-medium {
  background: #FEF3C7;
  color: #B45309;
}

.priority-high {
  background: #FAE8FF;
  color: #A21CAF;
}

/* ATTACHMENTS */
.attachments {
  border-top: 1px solid #f3f4f6;
  padding-top: 8px;
}

.attachments-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.file {
  display: flex;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.file:hover {
  opacity: 0.7;
}


/* FOOTER */
.footer {
  border-top: 1px solid #f5f5f5;
  padding-top: 10px;
  margin-top: auto;
}

.meta {
  font-size: 13px;
  color: #6b7280;
}

.dot {
  margin: 0 6px;
}
.date {
  font-weight: 500;
}

.date-default {
  color: #6B7280;
}

.date-overdue {
  color: #DC2626;
}

.date-today {
  color: #7C3AED;
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
  margin-top: 6px;
}

.btn {
  flex: 1;
  border: none;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: 0.2s;
}

.btn.edit {
  background: transparent;
  color: #7C3AED;
  border: 1px solid #E9D5FF;
}

.btn.edit:hover {
  background: #ddd6fe;
}

.btn.delete {
  background: transparent;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.btn.delete:hover {
  background: #fecaca;
}

.font-bold {
  font-weight: 500;
}

.file-skeleton {
  height: 28px;
  border-radius: 6px;
  margin-bottom: 6px;
  background: linear-gradient(
    90deg,
    #eee 25%,
    #ddd 37%,
    #eee 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0 }
  100% { background-position: -100% 0 }
}

</style>
