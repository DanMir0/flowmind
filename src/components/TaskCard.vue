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

    <div class="priority-badge" :class="priorityClass">
      <span v-if="task.priority === 1">🔥</span>
      <span v-else-if="task.priority === 2">⚡</span>
      <span v-else>🌿</span>
      {{ priorityLabel }}
    </div>

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
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.08);
}

.task-card h3 {
  font-size: 18px;
  font-weight: 700;
}

.meta {
  font-size: 14px;
  color: #555;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;

}

.priority-badge span {
  margin-right: 6px;
}

/* High */
.priority-badge.high {
  background: rgba(229, 57, 53, 0.12);
  color: #e53935;
}

/* Medium */
.priority-badge.medium {
  background: rgba(255, 167, 38, 0.15);
  color: #ffa726;
}

/* Low */
.priority-badge.low {
  background: rgba(67, 160, 71, 0.15);
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
</style>
