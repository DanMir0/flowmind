<!--<script setup>-->
<!--import { computed } from 'vue'-->
<!--import { getDeadlineState } from '@/utils/getDeadlineState.js'-->

<!--const props = defineProps({-->
<!--  task: {-->
<!--    type: Object,-->
<!--    required: true-->
<!--  },-->
<!--  class: {-->
<!--    type: String,-->
<!--    default: ''-->
<!--  }-->
<!--})-->

<!--defineEmits(['edit', 'delete', 'toggle-complete'])-->

<!--// const deadlineInfo = computed(() =>-->
<!--//   getDeadlineState(props.task.deadline)-->
<!--// )-->

<!--const filesCount = computed(() => {-->
<!--  if (Array.isArray(props.task.task_files)) {-->
<!--    return props.task.task_files.length-->
<!--  }-->

<!--  return props.task.files_count || 0-->
<!--})-->

<!--/**-->
<!-- * Priority label-->
<!-- */-->
<!--// const priorityLabel = computed(() => {-->
<!--//   switch (props.task.priority) {-->
<!--//     case 1:-->
<!--//       return 'High'-->
<!--//     case 2:-->
<!--//       return 'Medium'-->
<!--//     default:-->
<!--//       return 'Low'-->
<!--//   }-->
<!--// })-->

<!--/**-->
<!-- * Priority css class-->
<!-- */-->
<!--const priorityClass = computed(() => {-->
<!--  switch (props.task.priority) {-->
<!--    case 1:-->
<!--      return 'high'-->
<!--    case 2:-->
<!--      return 'medium'-->
<!--    default:-->
<!--      return 'low'-->
<!--  }-->
<!--})-->

<!--/**-->
<!-- * Formatted deadline-->
<!-- */-->
<!--const formattedDeadline = computed(() => {-->
<!--  return props.task.deadline-->
<!--    ? new Date(props.task.deadline).toLocaleDateString()-->
<!--    : '—'-->
<!--})-->

<!--function  formatTaskDate(date) {-->
<!--  if (!date) return ''-->

<!--  const d = new Date(date)-->

<!--  return d.toLocaleDateString('en-US', {-->
<!--    month: 'long',-->
<!--    day: 'numeric'-->
<!--  })-->
<!--}-->

<!--const priorityLabel = computed(() => {-->
<!--  if (props.task.priority === 1) return 'HIGH'-->
<!--  if (props.task.priority === 2) return 'MEDIUM'-->
<!--  return 'LOW'-->
<!--})-->

<!--const deadlineInfo = computed(() => {-->
<!--  if (!props.task.deadline) return { state: '', label: '' }-->

<!--  const now = new Date()-->
<!--  const d = new Date(props.task.deadline)-->

<!--  if (d < now) {-->
<!--    return { state: 'overdue', label: 'Overdue' }-->
<!--  }-->

<!--  const diff = (d - now) / (1000 * 60 * 60 * 24)-->

<!--  if (diff <= 2) {-->
<!--    return { state: 'soon', label: 'Soon' }-->
<!--  }-->

<!--  return { state: '', label: '' }-->
<!--})-->
<!--</script>-->
<!--&lt;!&ndash;<template>&ndash;&gt;-->
<!--&lt;!&ndash;  <div class="task-card" :class="[deadlineInfo.state, { completed: task.completed }, $props.class]">&ndash;&gt;-->
<!--&lt;!&ndash;    <div class="task-header">&ndash;&gt;-->
<!--&lt;!&ndash;      <label class="toggle">&ndash;&gt;-->
<!--&lt;!&ndash;        <input&ndash;&gt;-->
<!--&lt;!&ndash;          type="checkbox"&ndash;&gt;-->
<!--&lt;!&ndash;          :checked="task.completed"&ndash;&gt;-->
<!--&lt;!&ndash;          @change="$emit('toggle-complete', task)" />&ndash;&gt;-->
<!--&lt;!&ndash;        <span class="slider"></span>&ndash;&gt;-->
<!--&lt;!&ndash;      </label>&ndash;&gt;-->
<!--&lt;!&ndash;      <span class="toggle-label">&ndash;&gt;-->
<!--&lt;!&ndash;        {{ task.completed ? 'Done' : 'Todo' }}&ndash;&gt;-->
<!--&lt;!&ndash;      </span>&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->

<!--&lt;!&ndash;    <div&ndash;&gt;-->
<!--&lt;!&ndash;      v-if="deadlineInfo.state === 'overdue'"&ndash;&gt;-->
<!--&lt;!&ndash;      class="overdue-badge">&ndash;&gt;-->
<!--&lt;!&ndash;      ⛔ Overdue&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->

<!--&lt;!&ndash;    <h3>{{ task.title }}</h3>&ndash;&gt;-->

<!--&lt;!&ndash;    <p class="deadline">&ndash;&gt;-->
<!--&lt;!&ndash;      🕒 {{ formattedDeadline }}&ndash;&gt;-->
<!--&lt;!&ndash;      <span&ndash;&gt;-->
<!--&lt;!&ndash;        v-if="deadlineInfo.label"&ndash;&gt;-->
<!--&lt;!&ndash;        class="deadline-label"&ndash;&gt;-->
<!--&lt;!&ndash;        :class="deadlineInfo.state">&ndash;&gt;-->
<!--&lt;!&ndash;        · {{ deadlineInfo.label }}&ndash;&gt;-->
<!--&lt;!&ndash;      </span>&ndash;&gt;-->
<!--&lt;!&ndash;    </p>&ndash;&gt;-->

<!--&lt;!&ndash;    <div class="priority-badge" :class="priorityClass">&ndash;&gt;-->
<!--&lt;!&ndash;      <span v-if="task.priority === 1">🔥</span>&ndash;&gt;-->
<!--&lt;!&ndash;      <span v-else-if="task.priority === 2">⚡</span>&ndash;&gt;-->
<!--&lt;!&ndash;      <span v-else>🌿</span>&ndash;&gt;-->
<!--&lt;!&ndash;      {{ priorityLabel }}&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->

<!--&lt;!&ndash;    &lt;!&ndash; Files &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    <div v-if="filesCount > 0" class="files-indicator">&ndash;&gt;-->
<!--&lt;!&ndash;      📎 {{ filesCount }}&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->

<!--&lt;!&ndash;    <div class="actions">&ndash;&gt;-->
<!--&lt;!&ndash;      <button&ndash;&gt;-->
<!--&lt;!&ndash;        class="btn edit"&ndash;&gt;-->
<!--&lt;!&ndash;        @click="$emit('edit', task)">&ndash;&gt;-->
<!--&lt;!&ndash;        <span class="btn-text">Edit</span>&ndash;&gt;-->
<!--&lt;!&ndash;      </button>&ndash;&gt;-->

<!--&lt;!&ndash;      <button&ndash;&gt;-->
<!--&lt;!&ndash;        class="btn delete"&ndash;&gt;-->
<!--&lt;!&ndash;        @click="$emit('delete', task)">&ndash;&gt;-->
<!--&lt;!&ndash;        <span class="btn-text">Delete</span>&ndash;&gt;-->
<!--&lt;!&ndash;      </button>&ndash;&gt;-->
<!--&lt;!&ndash;    </div>&ndash;&gt;-->
<!--&lt;!&ndash;  </div>&ndash;&gt;-->
<!--&lt;!&ndash;</template>&ndash;&gt;-->

<!--&lt;!&ndash;<style scoped>&ndash;&gt;-->
<!--&lt;!&ndash;.task-card {&ndash;&gt;-->
<!--&lt;!&ndash;  position: relative;&ndash;&gt;-->
<!--&lt;!&ndash;  background: white;&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 24px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.05);&ndash;&gt;-->
<!--&lt;!&ndash;  display: flex;&ndash;&gt;-->
<!--&lt;!&ndash;  flex-direction: column;&ndash;&gt;-->
<!--&lt;!&ndash;  gap: 14px;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: transform 0.2s, box-shadow 0.2s;&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(139, 92, 246, 0.1);&ndash;&gt;-->
<!--&lt;!&ndash;  cursor: grab;&ndash;&gt;-->
<!--&lt;!&ndash;  user-select: none;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.task-card:hover {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateY(-2px);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 25px 40px -12px rgba(139, 92, 246, 0.25);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.task-card.dragging {&ndash;&gt;-->
<!--&lt;!&ndash;  opacity: 0.6;&ndash;&gt;-->
<!--&lt;!&ndash;  transform: scale(0.97);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.25);&ndash;&gt;-->
<!--&lt;!&ndash;  cursor: grabbing;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: transform 0.15s ease, box-shadow 0.15s ease;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Completed state */&ndash;&gt;-->
<!--&lt;!&ndash;.task-card.completed {&ndash;&gt;-->
<!--&lt;!&ndash;  background: #f9fafb;&ndash;&gt;-->
<!--&lt;!&ndash;  border-color: rgba(34, 197, 94, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.task-card.completed h3 {&ndash;&gt;-->
<!--&lt;!&ndash;  text-decoration: line-through;&ndash;&gt;-->
<!--&lt;!&ndash;  color: #9ca3af;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Header */&ndash;&gt;-->
<!--&lt;!&ndash;.task-header {&ndash;&gt;-->
<!--&lt;!&ndash;  display: flex;&ndash;&gt;-->
<!--&lt;!&ndash;  align-items: center;&ndash;&gt;-->
<!--&lt;!&ndash;  gap: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Toggle styles (обновленные) */&ndash;&gt;-->
<!--&lt;!&ndash;.toggle {&ndash;&gt;-->
<!--&lt;!&ndash;  position: relative;&ndash;&gt;-->
<!--&lt;!&ndash;  width: 46px;&ndash;&gt;-->
<!--&lt;!&ndash;  height: 24px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.toggle input {&ndash;&gt;-->
<!--&lt;!&ndash;  opacity: 0;&ndash;&gt;-->
<!--&lt;!&ndash;  width: 0;&ndash;&gt;-->
<!--&lt;!&ndash;  height: 0;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.slider {&ndash;&gt;-->
<!--&lt;!&ndash;  position: absolute;&ndash;&gt;-->
<!--&lt;!&ndash;  inset: 0;&ndash;&gt;-->
<!--&lt;!&ndash;  background: #e5e7eb;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  cursor: pointer;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: background 0.25s;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.slider::before {&ndash;&gt;-->
<!--&lt;!&ndash;  content: '';&ndash;&gt;-->
<!--&lt;!&ndash;  position: absolute;&ndash;&gt;-->
<!--&lt;!&ndash;  height: 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  width: 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  left: 2px;&ndash;&gt;-->
<!--&lt;!&ndash;  top: 2px;&ndash;&gt;-->
<!--&lt;!&ndash;  background: white;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 50%;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: transform 0.25s;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.toggle input:checked + .slider {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #22c55e, #16a34a);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.toggle input:checked + .slider::before {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateX(22px);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.toggle-label {&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 13px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 600;&ndash;&gt;-->
<!--&lt;!&ndash;  color: #6b7280;&ndash;&gt;-->
<!--&lt;!&ndash;  letter-spacing: 0.3px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Title */&ndash;&gt;-->
<!--&lt;!&ndash;.task-card h3 {&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 18px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 700;&ndash;&gt;-->
<!--&lt;!&ndash;  color: #1f2937;&ndash;&gt;-->
<!--&lt;!&ndash;  line-height: 1.4;&ndash;&gt;-->
<!--&lt;!&ndash;  margin: 0;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Deadline */&ndash;&gt;-->
<!--&lt;!&ndash;.deadline {&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 14px;&ndash;&gt;-->
<!--&lt;!&ndash;  color: #4b5563;&ndash;&gt;-->
<!--&lt;!&ndash;  display: flex;&ndash;&gt;-->
<!--&lt;!&ndash;  align-items: center;&ndash;&gt;-->
<!--&lt;!&ndash;  gap: 4px;&ndash;&gt;-->
<!--&lt;!&ndash;  margin: 0;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.deadline-label {&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 600;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.deadline-label.soon {&ndash;&gt;-->
<!--&lt;!&ndash;  color: #f59e0b;&ndash;&gt;-->
<!--&lt;!&ndash;  background: rgba(245, 158, 11, 0.1);&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 2px 8px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.deadline-label.overdue {&ndash;&gt;-->
<!--&lt;!&ndash;  color: #ef4444;&ndash;&gt;-->
<!--&lt;!&ndash;  background: rgba(239, 68, 68, 0.1);&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 2px 8px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Priority Badge (обновленный) */&ndash;&gt;-->
<!--&lt;!&ndash;.priority-badge {&ndash;&gt;-->
<!--&lt;!&ndash;  display: inline-flex;&ndash;&gt;-->
<!--&lt;!&ndash;  align-items: center;&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 6px 14px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 13px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 600;&ndash;&gt;-->
<!--&lt;!&ndash;  width: fit-content;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: all 0.2s;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.priority-badge span {&ndash;&gt;-->
<!--&lt;!&ndash;  margin-right: 6px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 14px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.priority-badge.high {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #fff5f5, #ffe5e5);&ndash;&gt;-->
<!--&lt;!&ndash;  color: #e53935;&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(229, 57, 53, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.priority-badge.medium {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #fff9e6, #fff2d9);&ndash;&gt;-->
<!--&lt;!&ndash;  color: #f59e0b;&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(245, 158, 11, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.priority-badge.low {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #f0fdf4, #e6f7e6);&ndash;&gt;-->
<!--&lt;!&ndash;  color: #22c55e;&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(34, 197, 94, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Files indicator */&ndash;&gt;-->
<!--&lt;!&ndash;.files-indicator {&ndash;&gt;-->
<!--&lt;!&ndash;  display: inline-flex;&ndash;&gt;-->
<!--&lt;!&ndash;  align-items: center;&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 4px 12px;&ndash;&gt;-->
<!--&lt;!&ndash;  background: #f3f4f6;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 500;&ndash;&gt;-->
<!--&lt;!&ndash;  color: #4b5563;&ndash;&gt;-->
<!--&lt;!&ndash;  width: fit-content;&ndash;&gt;-->
<!--&lt;!&ndash;  gap: 4px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Deadline state borders */&ndash;&gt;-->
<!--&lt;!&ndash;.task-card.soon {&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1.5px solid #f59e0b;&ndash;&gt;-->
<!--&lt;!&ndash;  background: rgba(245, 158, 11, 0.02);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.task-card.overdue {&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1.5px solid #ef4444;&ndash;&gt;-->
<!--&lt;!&ndash;  background: rgba(239, 68, 68, 0.02);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Overdue badge (обновленный) */&ndash;&gt;-->
<!--&lt;!&ndash;.overdue-badge {&ndash;&gt;-->
<!--&lt;!&ndash;  position: absolute;&ndash;&gt;-->
<!--&lt;!&ndash;  top: -10px;&ndash;&gt;-->
<!--&lt;!&ndash;  right: 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #ef4444, #dc2626);&ndash;&gt;-->
<!--&lt;!&ndash;  color: white;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 700;&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 6px 16px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 999px;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);&ndash;&gt;-->
<!--&lt;!&ndash;  letter-spacing: 0.3px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Actions (обновленные) */&ndash;&gt;-->
<!--&lt;!&ndash;.actions {&ndash;&gt;-->
<!--&lt;!&ndash;  margin-top: 8px;&ndash;&gt;-->
<!--&lt;!&ndash;  display: flex;&ndash;&gt;-->
<!--&lt;!&ndash;  gap: 12px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn {&ndash;&gt;-->
<!--&lt;!&ndash;  flex: 1;&ndash;&gt;-->
<!--&lt;!&ndash;  border: none;&ndash;&gt;-->
<!--&lt;!&ndash;  padding: 10px 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 40px;&ndash;&gt;-->
<!--&lt;!&ndash;  cursor: pointer;&ndash;&gt;-->
<!--&lt;!&ndash;  font-size: 14px;&ndash;&gt;-->
<!--&lt;!&ndash;  font-weight: 600;&ndash;&gt;-->
<!--&lt;!&ndash;  letter-spacing: 0.3px;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: all 0.25s ease;&ndash;&gt;-->
<!--&lt;!&ndash;  position: relative;&ndash;&gt;-->
<!--&lt;!&ndash;  overflow: hidden;&ndash;&gt;-->
<!--&lt;!&ndash;  max-width: 100px;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Edit Button Styles */&ndash;&gt;-->
<!--&lt;!&ndash;.btn.edit {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #f5f3ff, #ede9fe);&ndash;&gt;-->
<!--&lt;!&ndash;  color: #6d4fa8;&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(139, 92, 246, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn.edit:hover {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateY(-2px);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 12px 22px rgba(139, 92, 246, 0.3);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn.edit:active {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateY(0);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Delete Button Styles */&ndash;&gt;-->
<!--&lt;!&ndash;.btn.delete {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #fff5f5, #ffe5e5);&ndash;&gt;-->
<!--&lt;!&ndash;  color: #e53e3e;&ndash;&gt;-->
<!--&lt;!&ndash;  border: 1px solid rgba(229, 62, 62, 0.2);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn.delete:hover {&ndash;&gt;-->
<!--&lt;!&ndash;  background: linear-gradient(145deg, #e53e3e, #c53030);&ndash;&gt;-->
<!--&lt;!&ndash;  color: white;&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateY(-2px);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 12px 22px rgba(229, 62, 62, 0.25);&ndash;&gt;-->
<!--&lt;!&ndash;  border-color: transparent;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn.delete:active {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: translateY(0);&ndash;&gt;-->
<!--&lt;!&ndash;  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Button text animation */&ndash;&gt;-->
<!--&lt;!&ndash;.btn-text {&ndash;&gt;-->
<!--&lt;!&ndash;  display: inline-block;&ndash;&gt;-->
<!--&lt;!&ndash;  transition: transform 0.2s;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn:hover .btn-text {&ndash;&gt;-->
<!--&lt;!&ndash;  transform: scale(1.02);&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Ripple effect */&ndash;&gt;-->
<!--&lt;!&ndash;.btn::after {&ndash;&gt;-->
<!--&lt;!&ndash;  content: '';&ndash;&gt;-->
<!--&lt;!&ndash;  position: absolute;&ndash;&gt;-->
<!--&lt;!&ndash;  top: 50%;&ndash;&gt;-->
<!--&lt;!&ndash;  left: 50%;&ndash;&gt;-->
<!--&lt;!&ndash;  width: 5px;&ndash;&gt;-->
<!--&lt;!&ndash;  height: 5px;&ndash;&gt;-->
<!--&lt;!&ndash;  background: rgba(255, 255, 255, 0.5);&ndash;&gt;-->
<!--&lt;!&ndash;  opacity: 0;&ndash;&gt;-->
<!--&lt;!&ndash;  border-radius: 100%;&ndash;&gt;-->
<!--&lt;!&ndash;  transform: scale(1, 1) translate(-50%);&ndash;&gt;-->
<!--&lt;!&ndash;  transform-origin: 50% 50%;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;.btn:focus:not(:active)::after {&ndash;&gt;-->
<!--&lt;!&ndash;  animation: ripple 0.6s ease-out;&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;@keyframes ripple {&ndash;&gt;-->
<!--&lt;!&ndash;  0% {&ndash;&gt;-->
<!--&lt;!&ndash;    transform: scale(0, 0);&ndash;&gt;-->
<!--&lt;!&ndash;    opacity: 0.5;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;  20% {&ndash;&gt;-->
<!--&lt;!&ndash;    transform: scale(25, 25);&ndash;&gt;-->
<!--&lt;!&ndash;    opacity: 0.3;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;  100% {&ndash;&gt;-->
<!--&lt;!&ndash;    opacity: 0;&ndash;&gt;-->
<!--&lt;!&ndash;    transform: scale(40, 40);&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->

<!--&lt;!&ndash;/* Responsive */&ndash;&gt;-->
<!--&lt;!&ndash;@media (max-width: 480px) {&ndash;&gt;-->
<!--&lt;!&ndash;  .task-card {&ndash;&gt;-->
<!--&lt;!&ndash;    padding: 20px;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->

<!--&lt;!&ndash;  .actions {&ndash;&gt;-->
<!--&lt;!&ndash;    flex-direction: column;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->

<!--&lt;!&ndash;  .btn {&ndash;&gt;-->
<!--&lt;!&ndash;    max-width: 100%;&ndash;&gt;-->
<!--&lt;!&ndash;  }&ndash;&gt;-->
<!--&lt;!&ndash;}&ndash;&gt;-->
<!--&lt;!&ndash;</style>&ndash;&gt;-->



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
  return files.value.slice(0, 3)
})

const hasMoreFiles = computed(() => {
  return files.value.length > 3
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
        +{{ files.length - 3 }} more
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
        {{ task.time }}
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
  margin-top: 10px;
}

.btn {
  flex: 1;
  border: none;
  padding: 10px;
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
