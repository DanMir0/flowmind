<script setup>
import router from '@/router/router.js'
import { useAuthStore } from '@/store/auth.js'
import { computed } from 'vue'
import { useTasksStore } from '@/store/tasks.js'

const auth = useAuthStore()
const tasksStore = useTasksStore()

const totalTasks = computed(() => tasksStore.tasks.length)

const completedTasks = computed(() =>
  tasksStore.tasks.filter(task => task.completed).length
)

const dueToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  return tasksStore.tasks.filter(task =>
    task.deadline?.startsWith(today)
  ).length
})

const todayTasks = computed(() =>
  tasksStore.tasks
    .filter(task => !task.completed)
    .slice(0, 5)
)

const upcomingTasks = computed(() =>
  [...tasksStore.tasks]
    .filter(task => task.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    )
    .slice(0, 5)
)

async function goToTodoPage() {
  if (auth.goToLoginIfGuest(router)) {
    await router.push({ name: 'todo' })
  }
}

async function goToCalendarPage() {
  if (auth.goToLoginIfGuest(router)) {
    await router.push({ name: 'calendar' })
  }
}

async function goToTimerPage() {
  if (auth.goToLoginIfGuest(router)) {
    await router.push({ name: 'timer' })
  }
}
</script>

<template>
  <div class="dashboard">

    <div class="welcome">
      <h1>Welcome back 👋</h1>
      <p>Manage your tasks and stay productive.</p>
    </div>

    <!-- STATS -->
    <section class="stats-grid">

      <div class="stat-card">
        <div class="stat-value">
          {{ totalTasks }}
        </div>

        <div class="stat-label">
          Total Tasks
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-value">
          {{ completedTasks }}
        </div>

        <div class="stat-label">
          Completed
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-value">
          0h
        </div>

        <div class="stat-label">
          Focus Hours
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-value">
          {{ dueToday }}
        </div>

        <div class="stat-label">
          Due Today
        </div>
      </div>

    </section>

    <!-- MAIN GRID -->
    <section class="main-grid">

      <!-- TODAY -->
      <div class="panel">
        <div class="panel-header">
          Today's Tasks
        </div>

        <div
          v-if="todayTasks.length"
          class="task-list"
        >
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            @click="goToTodoPage"
          >
            <div class="task-title">
              {{ task.title }}
            </div>

            <div
              v-if="task.deadline"
              class="task-deadline"
            >
              {{ task.deadline }}
            </div>
          </div>
        </div>

        <div v-else class="empty">
          No active tasks
        </div>
      </div>

      <!-- UPCOMING -->
      <div class="panel">
        <div class="panel-header">
          Upcoming
        </div>

        <div
          v-if="upcomingTasks.length"
          class="task-list"
        >
          <div
            v-for="task in upcomingTasks"
            :key="task.id"
            class="task-item"
            @click="goToCalendarPage"
          >
            <div class="task-title">
              {{ task.title }}
            </div>

            <div class="task-deadline">
              {{ task.deadline }}
            </div>
          </div>
        </div>

        <div v-else class="empty">
          No upcoming tasks
        </div>
      </div>

      <!-- TIMER -->
      <div class="panel timer-panel">

        <img
          src="../assets/timer.png"
          alt="timer"
          class="timer-image"
        >

        <h3>Focus Timer</h3>

        <p>
          Stay focused and boost productivity.
        </p>

        <button
          class="start-btn"
          @click="goToTimerPage"
        >
          Start Focus Session
        </button>

      </div>

    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-content">
        <span>© 2026 TaskMaster. All rights reserved.</span>

        <span class="divider"></span>

        <a href="/privacy">Privacy Policy</a>

        <span class="divider"></span>

        <a href="/terms">Terms of Service</a>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.dashboard {
  min-height: calc(100vh - 72px);
  background: #f8fafc;
  padding: 32px;
}

.welcome {
  margin-bottom: 32px;
}

.welcome h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #111827;
}

.welcome p {
  margin-top: 8px;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
}

.stat-value {
  font-size: 34px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  margin-top: 8px;
  color: #6b7280;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.9fr;
  gap: 24px;
}

.panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
}

.panel-header {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 14px;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: .2s;
}

.task-item:hover {
  background: #f3f4f6;
}

.task-title {
  font-weight: 600;
  color: #111827;
}

.task-deadline {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.timer-panel {
  text-align: center;
}

.timer-image {
  width: 130px;
  margin-bottom: 20px;
}

.timer-panel h3 {
  margin-bottom: 10px;
}

.timer-panel p {
  color: #6b7280;
  margin-bottom: 20px;
}

.start-btn {
  border: none;
  background: #7c3aed;
  color: white;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 600;
}

.start-btn:hover {
  background: #6d28d9;
}

.empty {
  color: #9ca3af;
}

.footer {
  margin-top: 40px;
  padding: 24px 0;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  color: #6b7280;
  font-size: 14px;
}

.footer a {
  color: #7c3aed;
  text-decoration: none;
}

.divider {
  width: 1px;
  height: 14px;
  background: #e5e7eb;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-wrap: wrap;
  }

  .divider {
    display: none;
  }
}
</style>
