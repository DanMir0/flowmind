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

function priorityLabel(priority) {
  switch (priority) {
    case 1:
      return 'High'
    case 2:
      return 'Medium'
    case 3:
      return 'Low'
    default:
      return 'Low'
  }
}

function priorityClass(priority) {
  switch (priority) {
    case 1:
      return 'high'
    case 2:
      return 'medium'
    case 3:
      return 'low'
    default:
      return 'low'
  }
}

function formatMonth(date) {
  return new Date(date)
    .toLocaleDateString('en-US', {
      month: 'short'
    })
    .toUpperCase()
}

function formatDay(date) {
  return new Date(date).getDate()
}

function formatTime(date) {
  return new Date(date)
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
}
</script>

<template>
  <div class="dashboard">

    <div class="welcome">
      <h1>Good morning, {{ auth.user?.user_metadata?.username || auth.user?.email?.split('@')[0] }} 👋</h1>
      <p>Here's what's happening today.</p>
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
          <span class="panel-title">Today's Tasks</span>
          <router-link class="panel-view" :to="{name: 'todo'}">View all</router-link>
        </div>

        <div
          v-if="todayTasks.length"
          class="task-list">
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            @click="goToTodoPage">
            <div>
              <div class="task-title">
                {{ task.title }}
              </div>

              <div class="task-category">
                {{ task.category }}
              </div>
            </div>

            <div
              class="priority"
              :class="priorityClass(task.priority)">
              ● {{ priorityLabel(task.priority) }}
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
          <span class="panel-title">Upcoming</span>
          <router-link class="panel-view" :to="{name: 'calendar'}">View calendar</router-link>
        </div>

        <div
          v-if="upcomingTasks.length"
          class="task-list">
          <div
            v-for="task in upcomingTasks"
            :key="task.id"
            class="upcoming-item">
            <div class="date-box">
              <span>{{ formatMonth(task.deadline) }}</span>

              <strong>
                {{ formatDay(task.deadline) }}
              </strong>
            </div>

            <div>
              <div class="upcoming-time">
                {{ formatTime(task.deadline) }}
              </div>

              <div class="upcoming-title">
                {{ task.title }}
              </div>

              <div class="upcoming-category">
                Personal
              </div>
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
          class="timer-image">

        <h3>Focus Timer</h3>

        <p>
          Stay focused and boost productivity.
        </p>

        <button
          class="start-btn"
          @click="goToTimerPage">
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
  border: 1px solid #f1f5f9;
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
  display: flex;
  justify-content: space-between;
}

.panel-view {
  color: #5b02f4;
  font-size: 14px;
}

.panel-view:hover {
  cursor: pointer;
  color: #863fff;
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item:hover {
  background: #f3f4f6;
  border-radius: 10px;
  cursor: pointer;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.task-title {
  font-weight: 600;
  color: #111827;
}

.task-category {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.priority {
  font-size: 14px;
  font-weight: 500;
}

.priority.high {
  color: #ef4444;
}

.priority.medium {
  color: #f59e0b;
}

.priority.low {
  color: #10b981;
}

.upcoming-item {
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
}

.date-box {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.date-box span {
  font-size: 11px;
  color: #7c3aed;
  font-weight: 600;
}

.date-box strong {
  font-size: 22px;
}

.upcoming-time {
  color: #6b7280;
  font-size: 13px;
}

.upcoming-title {
  font-weight: 600;
  margin-top: 3px;
}

.upcoming-category {
  color: #9ca3af;
  font-size: 13px;
}

.timer-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.timer-image {
  width: 180px;
  margin: 20px auto;
  display: block;
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
