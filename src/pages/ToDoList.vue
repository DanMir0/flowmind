<script setup>
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '@/store/tasks'
import { storeToRefs } from 'pinia'

import TaskCard from '@/components/TaskCard.vue'
import AddTaskModal from '@/components/AddTaskModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteTaskModal.vue'
import EditTaskModal from '@/components/EditTaskModal.vue'

const tasksStore = useTasksStore()
const { tasks, loading, error } = storeToRefs(tasksStore)

const showAddModal = ref(false)
const taskToDelete = ref(null)
const taskToEdit = ref(null)

const sortKey = ref('created_desc')
const priorityFilter = ref('all')

const priorityFilters = [
  { label: 'All', value: 'all' },
  { label: 'High', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Low', value: 3 },
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

    default:
      return list
  }
})

const filteredTasks = computed(() => {
  if (priorityFilter.value === 'all') {
    return sortedTasks.value
  }

  return sortedTasks.value.filter(
    t => t.priority === priorityFilter.value
  )
})

onMounted(() => {
  tasksStore.fetchTasks()
})

function requestDelete(task) {
  taskToDelete.value = task
}

function requestEdit(task) {
  taskToEdit.value = task
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
</script>

<template>
  <div class="page">

    <div class="header-row">
      <h2>My Tasks</h2>

      <div class="controls">

        <div class="filters">
          <button
            v-for="option in priorityFilters"
            :key="option.value"
            :class="['filter-pill', { active: priorityFilter === option.value }]"
            @click="priorityFilter = option.value">
            {{ option.label }}
          </button>
        </div>

        <select v-model="sortKey" class="sort-select">
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
    <p v-if="!filteredTasks.length && !loading">
      No tasks with this priority
    </p>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="tasks-grid">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @delete="requestDelete"
        @edit="requestEdit"
        @toggle-complete="toggleComplete"
      />
    </div>

    <AddTaskModal
      v-if="showAddModal"
      @close="showAddModal = false"
    />

    <EditTaskModal
      v-if="taskToEdit"
      :task="taskToEdit"
      :on-save="saveEdit"
      @close="taskToEdit = null"
    />

    <ConfirmDeleteModal
      v-if="taskToDelete"
      :title="taskToDelete.title"
      @confirm="confirmDelete"
      @cancel="taskToDelete = null"
    />
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
  gap: 14px;
  align-items: center;
}

.sort-select {
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  font-weight: 500;
  background: white;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 8px;
}

.filter-pill {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-weight: 500;
}

.filter-pill.active {
  background: #f1ebff;
  border-color: #7a3cff;
  color: #7a3cff;
}

</style>



