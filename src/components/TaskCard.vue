<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const filesCount = computed(() => {
  if (Array.isArray(props.task.task_files)) {
    return props.task.task_files.length
  }

  return props.task.files_count || 0
})

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
    <div v-if="filesCount > 0" class="files-indicator">
      📎 {{ filesCount }}
    </div>

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

.files-indicator {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
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
</style>
