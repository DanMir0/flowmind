<script setup>
import { computed } from 'vue'
import { getDeadlineState } from '@/utils/getDeadlineState.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const deadlineInfo = computed(() =>
  getDeadlineState(props.task.deadline)
)

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
  <div class="task-card"  :class="deadlineInfo.state">

    <div
      v-if="deadlineInfo.state === 'overdue'"
      class="overdue-badge"
    >
      ⛔ Overdue
    </div>
    <h3>{{ task.title }}</h3>
    <p class="deadline">
      🕒 {{ formattedDeadline }}
      <span
        v-if="deadlineInfo.label"
        class="deadline-label"
        :class="deadlineInfo.state"
      >
        · {{ deadlineInfo.label }}
      </span>
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
  position: relative;
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

/* DEADLINE STATES */
.task-card.soon {
  border: 1.5px solid #ffb703;
  background: rgba(255,183,3,0.06);
}

.task-card.overdue {
  border: 1.5px solid #ff4d4f;
  background: rgba(255,77,79,0.06);
}

/* OVERDUE BADGE */
.overdue-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
}

/* DEADLINE TEXT */
.deadline {
  font-size: 14px;
}

.deadline-label.soon {
  color: #f59e0b;
  font-weight: 600;
}

.deadline-label.overdue {
  color: #ff4d4f;
  font-weight: 700;
  }

.task-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.08);
}

.task-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
  line-height: 1.3;
}

/* overdue badge */
.badge-overdue {
  display: block !important; /* На всякий случай */
  opacity: 1 !important;
  visibility: visible !important;
  position: absolute;
  top: 14px;
  right: 14px;
  background: #e53935;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
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
  padding: 8px 20px;
  border-radius: 12px;
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
