<script setup>
import { onMounted, ref } from 'vue'
import { useTasksStore } from '@/store/tasks.js'
import ConfirmDeleteTaskModal from '@/components/ConfirmDeleteTaskModal.vue'

const tasksStore = useTasksStore()
const showDeleteModal = ref(false)
const taskToDelete = ref(null)

onMounted(async () => {
  await tasksStore.fetchArchivedTasks()
})

function openDeleteModal(task) {
  taskToDelete.value = task
  showDeleteModal.value = true
}

async function confirmDelete() {
  await tasksStore.deleteTask(taskToDelete.value.id)
  showDeleteModal.value = false
  taskToDelete.value = null
}

function cancelDelete() {
  showDeleteModal.value = false
  taskToDelete.value = null
}
</script>

<template>
  <div class="archive-page">
    <div class="archive-header">
      <h2>Archived Tasks</h2>
    </div>

    <div v-if="tasksStore.loading" class="state">
      Loading archive...
    </div>

    <div v-else-if="tasksStore.tasks.length === 0" class="state">
      Archive is empty
    </div>

    <div v-else class="tasks-grid">
      <div
        v-for="task in tasksStore.tasks"
        :key="task.id"
        class="task-card archived"
      >
        <div class="task-top">
          <span class="badge archived-badge">
            Archived
          </span>
        </div>

        <h3 class="task-title">
          {{ task.title }}
        </h3>

        <p v-if="task.description" class="task-desc">
          {{ task.description }}
        </p>

        <div class="task-meta">
          Archived:
          {{ new Date(task.completed_at).toLocaleDateString() }}
        </div>

        <div class="task-actions">
          <button
            class="btn-primary"
            @click="tasksStore.restoreTask(task.id)"
          >
            Restore
          </button>

          <button
            class="btn-danger"
            @click="openDeleteModal(task)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDeleteTaskModal
    v-if="showDeleteModal"
    :title="taskToDelete?.title"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />
</template>

<style scoped>
.archive-page {
  padding: 40px 60px;
}

.archive-header {
  margin-bottom: 25px;
}

/* STATES */

.state {
  margin-top: 40px;
  color: #777;
}

/* GRID */

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}

/* CARD */

.task-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  transition: 0.2s ease;
  display: flex;
  flex-direction: column;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

/* archived look */

.task-card.archived {
  opacity: 0.75;
}

/* TITLE */

.task-title {
  font-size: 18px;
  margin-bottom: 10px;
}

/* DESCRIPTION */

.task-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

/* META */

.task-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 18px;
}

/* BADGE */

.badge {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-block;
}

.archived-badge {
  background: #ecebff;
  color: #5b4bff;
}

/* BUTTONS */

.task-actions {
  margin-top: auto;
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #6d5cff, #7c3aed);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s ease;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-danger {
  background: #ef4444;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s ease;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
