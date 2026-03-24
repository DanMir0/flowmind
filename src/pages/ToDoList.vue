<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { storeToRefs } from 'pinia'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import EditTaskModal from '@/components/EditTaskModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showSuccess } from '@/utils/toast.js'

const tasksStore = useTasksStore()
const { tasks, loading, error, isInitialized } = storeToRefs(tasksStore)

const showAddModal = ref(false)
const taskToDelete = ref(null)
const taskToEdit = ref(null)

const sortKey = ref('manual')
const priorityFilter = ref('all')
const statusFilter = ref('active')
const draggedTask = ref(null)
const draggingId = ref(null)

const priorityFilters = [
  { label: 'All', value: 'all' },
  { label: 'High', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Low', value: 3 }
]

const sortedTasks = computed(() => {
  const list = [...tasks.value]

  switch (sortKey.value) {
    case 'created_asc':
      return list.sort((a, b) => a.id - b.id)

    case 'created_desc':
      return list.sort((a, b) => b.id - a.id)

    case 'priority_asc':
      return list.sort((a, b) => b.priority - a.priority)

    case 'priority_desc':
      return list.sort((a, b) => a.priority - b.priority)

    case 'deadline_asc':
      return list.sort((a, b) =>
        new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31')
      )

    case 'deadline_desc':
      return list.sort((a, b) =>
        new Date(b.deadline || '0001-01-01') - new Date(a.deadline || '0001-01-01')
      )

    case 'manual':
      return list.sort((a, b) => a.position - b.position)

    default:
      return list
  }
})

const priorityFilteredTasks = computed(() => {
  if (priorityFilter.value === 'all') {
    return sortedTasks.value
  }

  return sortedTasks.value.filter(
    t => t.priority === priorityFilter.value
  )
})

const visibleTasks = computed(() => {
  switch (statusFilter.value) {
    case 'active':
      return priorityFilteredTasks.value.filter(t => !t.completed)
    case 'completed':
      return priorityFilteredTasks.value.filter(t => t.completed)
    default:
      return priorityFilteredTasks.value
  }
})

function onDragStart(task, event) {
  if (sortKey.value !== 'manual') return

  draggingId.value = task.id
  draggedTask.value = task
  const img = new Image()
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='

  event.dataTransfer.setDragImage(img, 0,0)
  event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  draggingId.value = null
  draggedTask.value = null
}

async function onDrop(targetTask) {
  if (sortKey.value !== 'manual') return
  if (!draggedTask.value || draggedTask.value.id === targetTask.id) return

  await tasksStore.reorderTasks(
    draggedTask.value.id,
    targetTask.id
  )

  draggedTask.value = null
}

function requestDelete(task) {
  taskToDelete.value = task
}

function requestEdit(task) {
  taskToEdit.value = null
  nextTick(() => {
    taskToEdit.value = { ...task }
  })
}

async function saveEdit(payload) {
  await tasksStore.updateTask(payload.id, payload)
  taskToEdit.value = null
  showSuccess('Task save!')
}

async function confirmDelete() {
  await tasksStore.deleteTask(taskToDelete.value.id)
  taskToDelete.value = null
  showSuccess('Task deleted!')
}

async function toggleComplete(task) {
  await tasksStore.toggleTaskCompleted(task.id, !task.completed)
}

const emptyType = computed(() => {
  if (loading.value) return null

  if (!tasks.value.length) {
    return 'no-tasks'
  }

  if (
    tasks.value.length > 0 &&
    visibleTasks.value.length === 0 &&
    statusFilter.value === 'active'
  ) {
    return 'all-completed'
  }

  if (visibleTasks.value.length === 0) {
    return 'filtered'
  }

  return null
})

watch(taskToEdit, (val) => {
  if (val) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

</script>

<template>

  <div class="page">

    <div class="header-row">
      <h2>My Tasks</h2>

      <div class="controls">

        <!-- PRIORITY -->
        <div class="filters-group">
          <button
            v-for="option in priorityFilters"
            :key="option.value"
            :class="['filter-pill', { active: priorityFilter === option.value }]"
            @click="priorityFilter = option.value">
            {{ option.label }}
          </button>
        </div>

        <!-- STATUS -->
        <div class="filters-group">
          <button
            class="filter-pill"
            :class="{ active: statusFilter === 'active' }"
            @click="statusFilter = 'active'">
            Active
          </button>

          <button
            class="filter-pill"
            :class="{ active: statusFilter === 'completed' }"
            @click="statusFilter = 'completed'">
            Completed
          </button>

          <button
            class="filter-pill"
            :class="{ active: statusFilter === 'all' }"
            @click="statusFilter = 'all'">
            All
          </button>
        </div>

        <div
          v-if="sortKey !== 'manual'"
          class="drag-disabled-warning">
          Drag & drop available only in Manual mode
        </div>

        <!-- SORT -->
        <select v-model="sortKey" class="sort-select">
          <option value="manual">Manual</option>
          <option value="created_desc">Newest first</option>
          <option value="created_asc">Oldest first</option>
          <option value="priority_desc">High priority</option>
          <option value="priority_asc">Low priority</option>
          <option value="deadline_asc">Nearest deadline</option>
          <option value="deadline_desc">Farthest deadline</option>
        </select>

        <button class="add-btn" @click="showAddModal = true">
          Add Task
        </button>
      </div>
    </div>


    <div v-if="loading || !isInitialized" class="tasks-grid">
      <div v-for="i in 5" :key="i" class="task-card skeleton">

        <!-- toggle -->
        <div class="skeleton-toggle"></div>

        <!-- title -->
        <div class="skeleton-title"></div>

        <!-- deadline -->
        <div class="skeleton-deadline"></div>

        <!-- priority -->
        <div class="skeleton-priority"></div>

        <!-- buttons -->
        <div class="skeleton-buttons">
          <div class="skeleton-btn primary"></div>
          <div class="skeleton-btn danger"></div>
        </div>

      </div>
    </div>

    <div v-else-if="error" class="error-wrapper">
      <div class="error-card">
        <h2 class="error-title">Connection error!</h2>

        <div class="error-illustration"></div>

        <p class="error-text">
          {{ error}}
        </p>

        <p class="error-subtext">
          Please try again.
        </p>

        <button
          class="error-btn"
          @click="tasksStore.fetchTasks()">
          Retry
        </button>

      </div>
    </div>

    <EmptyState
      v-else-if="emptyType"
      :type="emptyType"
      @add="showAddModal = true"
      @resetFilters="() => {
        priorityFilter = 'all'
        statusFilter = 'all'
        sortKey = 'created_desc'
      }"
      @showCompleted="statusFilter = 'completed'" />

    <TransitionGroup v-else  name="list" tag="div" class="tasks-grid">
      <TaskCard
        v-for="task in visibleTasks"
        :key="task.id"
        :task="task"
        :class="{ dragging: draggingId === task.id }"
        draggable="true"
        @dragstart="onDragStart(task, $event)"
        @dragend="onDragEnd"
        @dragover.prevent
        @drop="onDrop(task)"
        @delete="requestDelete"
        @edit="requestEdit"
        @toggle-complete="toggleComplete"
      />
    </TransitionGroup>

    <Teleport to="body">
      <Transition name="modal">
        <AddTaskModal
          v-if="showAddModal"
          @close="showAddModal = false" />
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <EditTaskModal
          v-if="taskToEdit"
          :task="taskToEdit"
          :on-save="saveEdit"
          @close="taskToEdit = null" />
      </Transition>
    </Teleport>

    <Transition name="modal">
      <ConfirmDeleteModal
        v-if="taskToDelete"
        :title="taskToDelete.title"
        @confirm="confirmDelete"
        @cancel="taskToDelete = null" />
    </Transition>
  </div>
</template>

<style scoped>
.page {
  padding: 40px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.add-btn {
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  background: #7a3cff;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.add-btn:hover {
  background: #5e2fd1;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* группа фильтров */
.filters-group {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #fafafa;
  border-radius: 24px;
  border: 1px solid #eee;
}

.filter-pill {
  padding: 8px 14px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #555;
  transition: all 0.2s ease;
}

.filter-pill:hover {
  background: #f0f0f0;
}

.filter-pill.active {
  background: #7a3cff;
  color: white;
}

.sort-select {
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  font-weight: 500;
  background: white;
  cursor: pointer;
}
.error-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
}

/* карточка */
.error-card {
  width: 100%;
  max-width: 720px;
  padding: 40px 30px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  box-shadow:
    0 10px 30px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.6);
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.4s ease;
}

/* фоновая иллюстрация */
.error-illustration {
  width: 100%;
  height: 255px;
  background-image: url("@/assets/errorFatch.png");
  background-size: cover;
  background-position: bottom;
  opacity: 0.9;
}

/* заголовок */
.error-title {
  font-size: 22px;
  font-weight: 700;
  color: #5b4dff;
  margin-bottom: 12px;
}

/* основной текст */
.error-text {
  font-size: 15px;
  color: #444;
  margin-bottom: 6px;
}

/* вторичный текст */
.error-subtext {
  font-size: 14px;
  color: #888;
  margin-bottom: 18px;
}

/* кнопка */
.error-btn {
  padding: 12px 26px;
  border: none;
  border-radius: 14px;

  background: linear-gradient(135deg, #7b5cff, #5b4dff);
  color: white;

  font-size: 15px;
  font-weight: 600;

  cursor: pointer;
  transition: all 0.2s ease;

  box-shadow: 0 6px 18px rgba(91,77,255,0.35);
}

.error-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 24px rgba(91,77,255,0.45);
}

.error-btn:active {
  transform: scale(0.97);
}

/* анимация появления */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.skeleton {
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.6),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(100%) }
}

/* элементы */

.skeleton-toggle {
  width: 50px;
  height: 24px;
  border-radius: 20px;
  background: #eee;
  margin-bottom: 12px;
}

.skeleton-title {
  width: 60%;
  height: 18px;
  background: #eee;
  border-radius: 6px;
  margin-bottom: 10px;
}

.skeleton-deadline {
  width: 30%;
  height: 12px;
  background: #eee;
  border-radius: 6px;
  margin-bottom: 12px;
}

.skeleton-priority {
  width: 80px;
  height: 28px;
  background: #eee;
  border-radius: 20px;
  margin-bottom: 16px;
}

.skeleton-buttons {
  display: flex;
  gap: 10px;
}

.skeleton-btn {
  width: 80px;
  height: 36px;
  border-radius: 20px;
  background: #eee;
}
</style>
<style>
.list-move {
  transition: transform 0.25s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

</style>
