<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { storeToRefs } from 'pinia'
import TaskCard from '@/components/TaskCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteTaskModal.vue'
import EditTaskModal from '@/components/EditTaskModal.vue'
import EmptyState from '@/components/EmptyState.vue'
import Loader from '@/components/Loader.vue'

const tasksStore = useTasksStore()
const { tasks, loading, error } = storeToRefs(tasksStore)

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
}

async function confirmDelete() {
  await tasksStore.deleteTask(taskToDelete.value.id)
  taskToDelete.value = null
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

    <Loader v-if="tasksStore.loading">Loading...</Loader>
    <p v-if="error" class="error">{{ error }}</p>

    <EmptyState
      v-if="emptyType"
      :type="emptyType"
      @add="showAddModal = true"
      @resetFilters="() => {
        priorityFilter = 'all'
        statusFilter = 'all'
        sortKey = 'created_desc'
      }"
      @showCompleted="statusFilter = 'completed'" />

    <TransitionGroup name="list" tag="div" class="tasks-grid">
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

.error {
  color: #e53935;
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
