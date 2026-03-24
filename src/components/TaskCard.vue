<script setup>
import { computed } from 'vue'
import { getDeadlineState } from '@/utils/getDeadlineState.js'

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

defineEmits(['edit', 'delete', 'toggle-complete'])

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
  <div class="task-card" :class="[deadlineInfo.state, { completed: task.completed }, $props.class]">
    <div class="task-header">
      <label class="toggle">
        <input
          type="checkbox"
          :checked="task.completed"
          @change="$emit('toggle-complete', task)" />
        <span class="slider"></span>
      </label>
      <span class="toggle-label">
        {{ task.completed ? 'Done' : 'Todo' }}
      </span>
    </div>

    <div
      v-if="deadlineInfo.state === 'overdue'"
      class="overdue-badge">
      ⛔ Overdue
    </div>

    <h3>{{ task.title }}</h3>

    <p class="deadline">
      🕒 {{ formattedDeadline }}
      <span
        v-if="deadlineInfo.label"
        class="deadline-label"
        :class="deadlineInfo.state">
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
        @click="$emit('edit', task)">
        <span class="btn-text">Edit</span>
      </button>

      <button
        class="btn delete"
        @click="$emit('delete', task)">
        <span class="btn-text">Delete</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  position: relative;
  background: white;
  padding: 24px;
  border-radius: 20px;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(139, 92, 246, 0.1);
  cursor: grab;
  user-select: none;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 40px -12px rgba(139, 92, 246, 0.25);
}

.task-card.dragging {
  opacity: 0.6;
  transform: scale(0.97);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.25);
  cursor: grabbing;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

/* Completed state */
.task-card.completed {
  background: #f9fafb;
  border-color: rgba(34, 197, 94, 0.2);
}

.task-card.completed h3 {
  text-decoration: line-through;
  color: #9ca3af;
}

/* Header */
.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle styles (обновленные) */
.toggle {
  position: relative;
  width: 46px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: #e5e7eb;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.25s;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.slider::before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.25s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.toggle input:checked + .slider {
  background: linear-gradient(145deg, #22c55e, #16a34a);
}

.toggle input:checked + .slider::before {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  letter-spacing: 0.3px;
}

/* Title */
.task-card h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  margin: 0;
}

/* Deadline */
.deadline {
  font-size: 14px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.deadline-label {
  font-weight: 600;
}

.deadline-label.soon {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.deadline-label.overdue {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

/* Priority Badge (обновленный) */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.priority-badge span {
  margin-right: 6px;
  font-size: 14px;
}

.priority-badge.high {
  background: linear-gradient(145deg, #fff5f5, #ffe5e5);
  color: #e53935;
  border: 1px solid rgba(229, 57, 53, 0.2);
}

.priority-badge.medium {
  background: linear-gradient(145deg, #fff9e6, #fff2d9);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.priority-badge.low {
  background: linear-gradient(145deg, #f0fdf4, #e6f7e6);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* Files indicator */
.files-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  width: fit-content;
  gap: 4px;
}

/* Deadline state borders */
.task-card.soon {
  border: 1.5px solid #f59e0b;
  background: rgba(245, 158, 11, 0.02);
}

.task-card.overdue {
  border: 1.5px solid #ef4444;
  background: rgba(239, 68, 68, 0.02);
}

/* Overdue badge (обновленный) */
.overdue-badge {
  position: absolute;
  top: -10px;
  right: 20px;
  background: linear-gradient(145deg, #ef4444, #dc2626);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 999px;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
  letter-spacing: 0.3px;
}

/* Actions (обновленные) */
.actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  border: none;
  padding: 10px 20px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  max-width: 100px;
}

/* Edit Button Styles */
.btn.edit {
  background: linear-gradient(145deg, #f5f3ff, #ede9fe);
  color: #6d4fa8;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.btn.edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(139, 92, 246, 0.3);
}

.btn.edit:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

/* Delete Button Styles */
.btn.delete {
  background: linear-gradient(145deg, #fff5f5, #ffe5e5);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.2);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
}

.btn.delete:hover {
  background: linear-gradient(145deg, #e53e3e, #c53030);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(229, 62, 62, 0.25);
  border-color: transparent;
}

.btn.delete:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
}

/* Button text animation */
.btn-text {
  display: inline-block;
  transition: transform 0.2s;
}

.btn:hover .btn-text {
  transform: scale(1.02);
}

/* Ripple effect */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.btn:focus:not(:active)::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .task-card {
    padding: 20px;
  }

  .actions {
    flex-direction: column;
  }

  .btn {
    max-width: 100%;
  }
}
</style>
