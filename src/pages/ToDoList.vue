<script setup>
import { ref, onMounted } from 'vue'
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
</script>

<template>
  <div class="page">
    <div class="header-row">
      <h2>My Tasks</h2>
      <button class="add-btn" @click="showAddModal = true">
        Add Task
      </button>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="tasks-grid">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @delete="requestDelete"
        @edit="requestEdit"
      />
    </div>

    <AddTaskModal
      v-if="showAddModal"
      @close="showAddModal = false"
    />

    <EditTaskModal
      v-if="taskToEdit"
      :task="taskToEdit"
      @save="saveEdit"
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
</style>



