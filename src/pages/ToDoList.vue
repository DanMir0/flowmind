<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { storeToRefs } from 'pinia'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import EditTaskModal from '@/components/EditTaskModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import { showError, showSuccess } from '@/utils/toast.js'
import { useRoute } from 'vue-router'
import BaseSelect from '@/components/BaseSelect.vue'
import { useSubscriptionStore } from '@/store/subscription.js'
import MobileFilterTabs from '@/components/MobileFilterTabs.vue'

const tasksStore = useTasksStore()
const subscriptionStore = useSubscriptionStore()
const { tasks, loading, error, isInitialized, searchQuery } = storeToRefs(tasksStore)

const showAddModal = ref(false)
const taskToDelete = ref(null)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const taskToEdit = ref(null)
const route = useRoute()
const sortKey = ref('manual')
const priorityFilter = ref('all')
const statusFilter = ref('all')
const draggedTask = ref(null)
const draggingId = ref(null)
const visibleCount = ref(15)

const isPremium = computed(() => {
  return subscriptionStore.status === 'active' || subscriptionStore.status === 'trial'
})

const canDrag = computed(() => {
  return (
    isPremium.value &&
    sortKey.value === 'manual' &&
    priorityFilter.value === 'all' &&
    statusFilter.value === 'all' &&
    !searchQuery.value.trim()
  )
})

const isReordering = ref(false)
const dropTargetId = ref(null)

const priorityFilters = [
  { label: 'All', value: 'all' },
  { label: 'High', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Low', value: 3 }
]

const sortValue = [
  { label: 'Manual', value: 'manual' },
  { label: 'Newest first', value: 'created_desc' },
  { label: 'Oldest first', value: 'created_asc' },
  { label: 'High priority', value: 'priority_desc' },
  { label: 'Low priority', value: 'priority_asc' },
  { label: 'Nearest deadline', value: 'deadline_asc' },
  { label: 'Farthest deadline', value: 'deadline_desc' }
]

const sortedTasks = computed(() => {
  const list = [...tasks.value]

  switch (sortKey.value) {
    case 'created_asc':
      return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    case 'created_desc':
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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
      return [...tasks.value].sort((a, b) => a.position - b.position)

    default:
      return [...tasks.value]
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
      return searchedTasks.value.filter(t => !t.completed)
    case 'completed':
      return searchedTasks.value.filter(t => t.completed)
    case 'overdue':
      return searchedTasks.value.filter(task =>
        !task.completed &&
        task.deadline &&
        new Date(task.deadline) < new Date()
      )
    default:
      return searchedTasks.value
  }
})

const displayedTasks = computed(() =>
  visibleTasks.value.slice(0, visibleCount.value)
)

const hasMoreTasks = computed(() =>
  visibleTasks.value.length > visibleCount.value
)

function loadMore() {
  visibleCount.value += 15
}

function onDragStart(task, event) {

  if (sortKey.value !== 'manual') {
    event.preventDefault()

    showError('Switch to Manual sorting to reorder tasks.')

    return
  } else if (statusFilter.value !== 'all') {
    event.preventDefault()

    showError('Switch to All status to reorder tasks.')
    return
  } else if (priorityFilter.value !== 'all') {
    event.preventDefault()

    showError('Switch to All priority to reorder tasks.')
    return
  }

  if (!canDrag.value) {
    event.preventDefault()
    showError('Drag & Drop is a Premium feature. Upgrade to Premium to reorder your tasks.')
    return
  }

  if (isReordering.value) {
    event.preventDefault()
    return
  }

  draggedTask.value = task
  draggingId.value = task.id
  dropTargetId.value = null

  event.dataTransfer.effectAllowed = 'move'

  // Не показываем стандартную полупрозрачную копию браузера.
  const img = new Image()
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4='

  event.dataTransfer.setDragImage(img, 0, 0)
}

function onDragOver(task) {
  if (!canDrag.value) return
  if (!draggedTask.value) return
  if (isReordering.value) return

  if (draggedTask.value.id === task.id) {
    dropTargetId.value = null
    return
  }

  dropTargetId.value = task.id
}

function onDragLeave(task) {
  if (dropTargetId.value === task.id) {
    dropTargetId.value = null
  }
}

function onDragEnd() {
  draggingId.value = null
  draggedTask.value = null
  dropTargetId.value = null
}

async function onDrop(targetTask) {
  if (!canDrag.value) {
    onDragEnd()

    return
  }

  if (!draggedTask.value) {
    onDragEnd()
    return
  }

  if (draggedTask.value.id === targetTask.id) {
    onDragEnd()
    return
  }

  if (isReordering.value) return

  const draggedId = draggedTask.value.id

  try {
    isReordering.value = true

    await tasksStore.reorderTasks(
      draggedId,
      targetTask.id
    )
  } catch (error) {
    if (error.message === 'PREMIUM_REQUIRED') {
      showError(
        'Drag & Drop is a Premium feature. Upgrade to Premium to reorder your tasks.'
      )
    } else {
      showError('Failed to reorder tasks.')
    }
  } finally {
    isReordering.value = false
    onDragEnd()
  }
}

function requestDelete(task) {
  taskToDelete.value = task
  showDeleteModal.value = true
}

function requestEdit(taskId) {
  showEditModal.value = true
  taskToEdit.value = taskId
}

async function saveEdit(payload) {
  await tasksStore.updateTask(payload.id, payload)
  taskToEdit.value = null
  showSuccess('Task save!')
}

async function confirmDelete() {
  await tasksStore.deleteTask(taskToDelete.value.id)
  showDeleteModal.value = false
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

function buildDateTokens(dateValue) {
  if (!dateValue) return []

  const date = new Date(dateValue)

  if (isNaN(date)) return []

  const monthLong = date.toLocaleString('en-US', {
    month: 'long'
  }).toLowerCase()

  const monthShort = date.toLocaleString('en-US', {
    month: 'short'
  }).toLowerCase()

  const day = String(date.getDate())
  const year = String(date.getFullYear())

  return [
    monthLong,
    monthShort,
    day,
    year,
    `${monthLong} ${day}`,
    `${day} ${monthLong}`,
    `${monthShort} ${day}`,
    `${day} ${monthShort}`
  ]
}

function buildSearchText(task) {
  const parts = [
    task.title,
    task.description,

    ...buildDateTokens(task.created_at),
    ...buildDateTokens(task.deadline)
  ]

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const searchedTasks = computed(() => {
  const query = searchQuery.value
    ?.trim()
    .toLowerCase()

  if (!query) {
    return priorityFilteredTasks.value
  }

  return [...priorityFilteredTasks.value]
    .filter(task => {
      const searchText = buildSearchText(task)

      return query
        .split(/\s+/)
        .every(word => searchText.includes(word))
    })
    .sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || ''
      const bTitle = b.title?.toLowerCase() || ''

      const aStarts = aTitle.startsWith(query)
      const bStarts = bTitle.startsWith(query)

      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1

      return 0
    })
})

function closeEditModal() {
  showEditModal.value = false
  taskToEdit.value = null
}

watch(taskToEdit, (val) => {
  if (val) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})
watch(
  [priorityFilter, statusFilter, searchQuery],
  () => {
    visibleCount.value = 15
  }
)

onMounted(() => {
  const editId = route.query.edit
  const addTask = route.query.add
  const status = route.query.status

  if (editId) {
    showEditModal.value = true
    taskToEdit.value = editId
  }

  if (addTask === 'true') {
    openAddTaskModal()
  }

  if (status === 'completed') {
    statusFilter.value = 'completed'
  }

  if (status === 'overdue') {
    statusFilter.value = 'overdue'
  }

  if (status === 'all') {
    statusFilter.value = 'all'
  }
})

function openAddTaskModal() {
  if (
    subscriptionStore.status !== 'trial' &&
    subscriptionStore.status !== 'active' &&
    tasksStore.tasks.length >= 5
  ) {
    showError(
      'You\'ve reached the 5-task limit. Upgrade to Premium for unlimited tasks.'
    )

    return
  }

  showAddModal.value = true
}

onMounted(() => {
  window.addEventListener('open-add-task', openAddTaskModal)
})

onUnmounted(() => {
  window.removeEventListener('open-add-task', openAddTaskModal)
})
</script>

<template>
  <div class="page">

    <!-- MOBILE FILTERS -->
    <MobileFilterTabs
      class="mobile-filters"
      v-model:priority="priorityFilter"
      v-model:status="statusFilter" />

    <div class="header-row">

      <div class="header-block-text">
        <h1 class="header-title">My Tasks</h1>

        <p class="header-description">
          {{ visibleTasks.length }}
          {{ visibleTasks.length === 1 ? 'task' : 'tasks' }}
        </p>
      </div>

      <div class="controls">

        <!-- PRIORITY -->
        <div class="filters-group">
          <button
            v-for="option in priorityFilters"
            :key="option.value"
            :class="[
              'filter-pill',
              { active: priorityFilter === option.value }
            ]"
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

        <!-- SORT -->
        <BaseSelect
          v-model="sortKey"
          :options="sortValue"
          labelKey="label"
          valueKey="value"
          placeholder="Select sort"
          class="sort-select" />

        <!-- DESKTOP ADD -->
        <button
          class="add-btn"
          @click="openAddTaskModal">
          Add Task
        </button>

      </div>
    </div>


    <!-- LOADING -->
    <div
      v-if="loading || !isInitialized"
      class="tasks-grid">
      <div
        v-for="i in 5"
        :key="i"
        class="task-card skeleton">
        <div class="skeleton-toggle"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-deadline"></div>
        <div class="skeleton-priority"></div>

        <div class="skeleton-buttons">
          <div class="skeleton-btn primary"></div>
          <div class="skeleton-btn danger"></div>
        </div>
      </div>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="error"
      class="error-wrapper">
      <div class="error-card">

        <h2 class="error-title">
          Connection error!
        </h2>

        <div class="error-illustration"></div>

        <p class="error-text">
          {{ error }}
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


    <!-- EMPTY -->
    <EmptyState
      v-else-if="emptyType"
      :type="emptyType"
      @add="openAddTaskModal"
      @resetFilters="() => {
        priorityFilter = 'all'
        statusFilter = 'all'
        sortKey = 'created_desc'
      }"
      @showCompleted="statusFilter = 'completed'" />

    <!-- TASKS -->
    <div v-else>

      <TransitionGroup
        name="list"
        tag="div"
        class="tasks-grid">
        <TaskCard
          v-for="task in displayedTasks"
          :key="task._key || task.id"
          :task="task"
          :class="{
            dragging: draggingId === task.id,
            'drop-target': dropTargetId === task.id,
            'drag-disabled': !canDrag
          }"
          :draggable="canDrag"
          @dragstart="onDragStart(task, $event)"
          @dragend="onDragEnd"
          @dragover.prevent="onDragOver(task)"
          @dragleave="onDragLeave(task)"
          @drop.prevent="onDrop(task)"
          @delete="requestDelete"
          @edit="requestEdit"
          @toggle-complete="toggleComplete" />
      </TransitionGroup>
      <div
        v-if="hasMoreTasks"
        class="load-more-wrapper">
        <button
          class="load-more-btn"
          @click="loadMore">
          Load More
          ({{ visibleTasks.length - displayedTasks.length }})
        </button>
      </div>

    </div>


    <!-- MODALS -->
    <AddTaskModal
      :isOpen="showAddModal"
      @close="showAddModal = false" />

    <EditTaskModal
      :isOpen="showEditModal"
      :task-id="taskToEdit || ''"
      :on-save="saveEdit"
      @close="closeEditModal" />

    <ConfirmDeleteModal
      :isOpen="showDeleteModal"
      :title="taskToDelete?.title"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false" />
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  background: var(--bg-page);
  width: 100%;
  padding: 32px 24px 40px;
  box-sizing: border-box;
}

.mobile-filters {
  display: none;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}

.header-block-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.header-title {
  color: var(--text);
  font-size: 26px;
}

.header-description {
  margin: 0;
  color: var(--text-grey);
  font-size: 18px;
}

.add-btn {
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  background: var(--menu-link);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
}

.add-btn:hover {
  background: #5e2fd1;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 22px;
  align-items: stretch;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

/* группа фильтров */
.filters-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: var(--quick-input-bg);
  border-radius: 14px;
  border: 1px solid var(--border);
}

.filter-pill {
  padding: 8px 14px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: var(--text);
  transition: all 0.2s ease;
}

.filter-pill:hover {
  color: var(--premium-bg);
}

.filter-pill.active {
  background: var(--menu-link);
  color: var(--bg);
}

.sort-select {
  width: 220px;
}

.dragging {
  opacity: 0.45;
  transform: scale(0.98);
  transition: opacity 0.15s ease,
  transform 0.15s ease;
}

.drop-target {
  transform: translateY(-4px);
  box-shadow: 0 0 0 2px var(--menu-link),
  0 12px 30px rgba(124, 58, 237, 0.15);
  transition: transform 0.15s ease,
  box-shadow 0.15s ease;
}

.drag-disabled {
  cursor: default;
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08),
  inset 0 1px 0 rgba(255, 255, 255, 0.6);
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
  color: var(--bg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 18px rgba(91, 77, 255, 0.35);
}

.error-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 24px rgba(91, 77, 255, 0.45);
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
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%)
  }
  100% {
    transform: translateX(100%)
  }
}

/* элементы */

.skeleton-toggle {
  width: 50px;
  height: 24px;
  border-radius: 20px;
  background: var(--border);
  margin-bottom: 12px;
}

.skeleton-title {
  width: 60%;
  height: 18px;
  background: var(--border);
  border-radius: 6px;
  margin-bottom: 10px;
}

.skeleton-deadline {
  width: 30%;
  height: 12px;
  background: var(--border);
  border-radius: 6px;
  margin-bottom: 12px;
}

.skeleton-priority {
  width: 80px;
  height: 28px;
  background: var(--border);
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
  background: var(--border);
}

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.load-more-btn {
  padding: 12px 20px;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  background: var(--bg);
  color: var(--text-grey);
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}

.load-more-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  transform: translateY(-1px);
}

/* =========================================================
   TABLET
   ========================================================= */

@media (min-width: 768px) and (max-width: 1024px) {

  .page {
    min-height: calc(100vh - 64px);
    padding: 24px 20px 32px;
  }

  .header-row {
    gap: 16px;
    margin-bottom: 22px;
  }

  .header-title {
    font-size: 23px;
  }

  .header-description {
    font-size: 13px;
  }

  .controls {
    gap: 8px;
  }

  .filters-group {
    gap: 2px;
    padding: 4px;
  }

  .filter-pill {
    padding: 7px 10px;
    font-size: 12px;
  }

  .mobile-filters {
    display: flex;
  }

  .sort-select {
    width: 150px;
  }

  .add-btn {
    padding: 9px 14px;
    font-size: 13px;
  }

  /*
   * Two task cards per row.
   */
  .tasks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 767px) {

  .page {
    min-height: calc(100vh - 56px);
    padding: 14px 12px 82px;
  }

  /* -------------------------
     MOBILE FILTERS
     ------------------------- */
  .mobile-filters {
    display: flex;
    margin-bottom: 14px;
    border-radius: 8px;
  }

  /* -------------------------
     HEADER
     ------------------------- */
  .header-row {
    margin-bottom: 16px;
    align-items: center;
  }

  .header-block-text {
    gap: 2px;
  }

  .header-title {
    font-size: 20px;
    line-height: 1.2;
  }

  .header-description {
    font-size: 12px;
  }

  /*
   * Desktop filters are completely hidden.
   * Filtering is handled by MobileFilterTabs.
   */
  .controls {
    display: none;
  }

  /* -------------------------
     TASK GRID
     ------------------------- */
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /*
   * TaskCard should fill the available width.
   */
  .tasks-grid > * {
    min-width: 0;
    width: 100%;
  }

  /* -------------------------
     LOAD MORE
     ------------------------- */
  .load-more-wrapper {
    margin-top: 18px;
    padding-bottom: 10px;
  }

  .load-more-btn {
    width: 100%;
    min-height: 44px;
  }

  /* -------------------------
     ERROR
     ------------------------- */
  .error-wrapper {
    margin-top: 30px;
  }

  .error-card {
    padding: 24px 16px;
    border-radius: 20px;
  }

  .error-illustration {
    height: 180px;
  }

  .error-title {
    font-size: 20px;
  }

  .error-text {
    font-size: 14px;
  }

  /* -------------------------
     SKELETON
     ------------------------- */
  .skeleton-toggle {
    width: 38px;
    height: 22px;
  }

  .skeleton-title {
    width: 65%;
  }
}
</style>
<style>
.list-move {
  transition: transform 0.25s ease;
}

.list-enter-active,
.list-leave-active {
  transition: opacity 0.2s ease,
  transform 0.2s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
