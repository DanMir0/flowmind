<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/services/supabase.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

/**
 * Priority label
 */
const priorityLabel = computed(() => {
  switch (props.task.priority) {
    case 1:
      return 'High'
    case 2:
      return 'Medium'
    default:
      return 'Low'
  }
})

/**
 * Priority css class
 */
const priorityClass = computed(() => {
  switch (props.task.priority) {
    case 1:
      return 'high'
    case 2:
      return 'medium'
    default:
      return 'low'
  }
})

/**
 * Formatted deadline
 */
const formattedDeadline = computed(() => {
  return props.task.deadline
    ? new Date(props.task.deadline).toLocaleDateString()
    : '—'
})

/**
 * Open attached file
 */
async function openFile(file) {
  const { data, error } = await supabase
    .storage
    .from('task-files')
    .createSignedUrl(file.file_path, 120)

  if (error) {
    console.error(error)
    return
  }

  const response = await fetch(data.signedUrl)
  const blob = await response.blob()

  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = file.file_name // ОРИГИНАЛЬНОЕ ИМЯ (РУССКОЕ)
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}


// onMounted(async () => {
//   const { data } = await supabase
//     .from('task_files')
//     .select('*')
//     .eq('task_id', props.task.id)
//
//   files.value = data || []
// })
</script>

<template>
  <div class="task-card">
    <h3>{{ task.title }}</h3>

    <p class="meta">
      Deadline:
      <span>{{ formattedDeadline }}</span>
    </p>

    <p class="meta">
      Priority:
      <span :class="['priority', priorityClass]">
        {{ priorityLabel }}
      </span>
    </p>

    <!-- Files -->
    <div v-if="task.files_count" class="files-indicator">

      📎 {{ task.files_count }}
    </div>

    <!--    <div v-if="files.length" class="files">-->
<!--      <p class="files-title">Files:</p>-->
<!--      <ul>-->
<!--        <li-->
<!--          v-for="file in files"-->
<!--          :key="file.id"-->
<!--        >-->
<!--          <a href="#" @click.prevent="openFile(file)">-->
<!--            {{ file.file_name }}-->
<!--          </a>-->
<!--        </li>-->
<!--      </ul>-->
<!--    </div>-->

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
.files-indicator {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}


.task-card {
  background: white;
  padding: 22px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card h3 {
  font-size: 18px;
  font-weight: 700;
}

.meta {
  font-size: 14px;
  color: #555;
}

.priority {
  font-weight: 600;
}

.priority.high {
  color: #e53935;
}

.priority.medium {
  color: #fb8c00;
}

.priority.low {
  color: #43a047;
}

.actions {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: white;
}

.btn.edit {
  background: #7a3cff;
}

.btn.edit:hover {
  background: #5e2fd1;
}

.btn.delete {
  background: #e53935;
}

.btn.delete:hover {
  background: #c62828;
}

.files-title {
  font-weight: 600;
  font-size: 14px;
}

.files ul {
  padding-left: 16px;
}

.files a {
  color: #7a3cff;
  cursor: pointer;
}
</style>
