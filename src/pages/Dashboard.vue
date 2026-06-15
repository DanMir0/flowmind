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

const todayTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  return tasksStore.tasks
    .filter(task =>
      !task.completed &&
      task.deadline &&
      task.deadline.startsWith(today)
    )
    .slice(0, 5)
})

async function toggleTask(task) {
  await tasksStore.toggleTaskCompleted(
    task.id,
    !task.completed
  )
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const upcomingTasks = computed(() =>
  [...tasksStore.tasks]
    .filter(task => {
      if (!task.deadline || task.completed) return false

      const deadline = new Date(task.deadline)
      deadline.setHours(0, 0, 0, 0)

      return deadline >= today
    })
    .sort(
      (a, b) =>
        new Date(a.deadline) - new Date(b.deadline)
    )
    .slice(0, 4)
)

async function openTask(taskId) {
  if (!auth.goToLoginIfGuest(router)) return

  await router.push({
    name: 'todo',
    query: {
      edit: taskId
    }
  })
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

async function openAddTask() {
  if (!auth.goToLoginIfGuest(router)) return

  await router.push({
    name: 'todo',
    query: {
      add: 'true'
    }
  })
}
</script>

<template>
  <div class="dashboard">

    <div class="welcome">
      <h1>Good morning, {{ auth.user?.user_metadata?.username || auth.user?.email?.split('@')[0] }}
        👋</h1>
      <p>Here's what's happening today.</p>
    </div>

    <!-- STATS -->
    <section class="stats-grid">

      <div class="stat-card">
        <div class="stat-icon purple">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M9 12H15" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M9 16H13" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="stat-card-block">
          <div class="stat-value">
            {{ totalTasks }}
          </div>

          <div class="stat-label">
            Total Tasks
          </div>

          <div class="stat-subtitle">
            All time
          </div>
        </div>

      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#10B981" stroke-width="1.5"/>
            <path d="M8 12L11 15L16 9" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="stat-card-block">
          <div class="stat-value">
            {{ completedTasks }}
          </div>

          <div class="stat-label">
            Completed
          </div>

          <div class="stat-subtitle">
            This week
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon yellow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="1.5"/>
            <path d="M12 6V12L16 14" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-card-block">

          <div class="stat-value">
            0h
          </div>

          <div class="stat-label">
            Focus Hours
          </div>

          <div class="stat-subtitle">
            This week
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6M16 2V6" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3B82F6" stroke-width="1.5"/>
            <path d="M3 10H21" stroke="#3B82F6" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="12" cy="15" r="1.5" fill="#3B82F6" stroke="#3B82F6" stroke-width="1"/>
            <circle cx="16" cy="15" r="1.5" fill="#3B82F6" stroke="#3B82F6" stroke-width="1"/>
            <circle cx="8" cy="15" r="1.5" fill="#3B82F6" stroke="#3B82F6" stroke-width="1"/>
          </svg>
        </div>

        <div class="stat-card-block">
          <div class="stat-value">
            {{ dueToday }}
          </div>

          <div class="stat-label">
            Due Today
          </div>

          <div class="stat-subtitle">
            Stay on track
          </div>
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
            @click="openTask(task.id)">

            <div class="task-left">

              <button
                class="task-checkbox"
                @click.stop="toggleTask(task)">
                <span v-if="task.completed">✓</span>
              </button>

              <div>
                <div
                  class="task-title"
                  :class="{ completed: task.completed }">
                  {{ task.title }}
                </div>

                <div class="task-category">
                  {{ task.description || 'Task' }}
                </div>
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

        <div class="add-task-link" @click="openAddTask">
          + Add new task
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
            v-for="(task, index) in upcomingTasks"
            :key="task.id"
            class="upcoming-item">
            <div class="date-box"
                 :class="index % 2 === 0 ? 'purple-date' : 'pink-date'">
              <span>{{ formatMonth(task.deadline) }}</span>

              <strong>
                {{ formatDay(task.deadline) }}
              </strong>
            </div>

            <div class="upcoming-content">

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

        <div class="panel-header">
          <span class="panel-title">
            Focus Timer
          </span>
        </div>

        <img
          src="../assets/timer.png"
          alt="timer"
          class="timer-image">

        <div class="timer-panel-block">
          <h3>Ready to focus?</h3>

          <p>
            Start a focus session and get things done.
          </p>

          <button
            class="start-btn"
            @click="goToTimerPage">
            Start Timer
          </button>
        </div>

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
  padding: 18px 32px;
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
  margin-top: 4px;
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
  display: flex;
  align-items: center;
  gap: 18px;
}

.stat-icon {
  width: 78px;
  height: 86px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.stat-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.purple {
  background: #f4ebff;
}

.green {
  background: #ecfdf3;
}

.yellow {
  background: #fffaeb;
}

.blue {
  background: #eff8ff;
}

.stat-label {
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
  gap: 10px;
}

.task-item:hover {
  cursor: pointer;
  background: #f9fafb;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: none;
  transition: all .2s ease;
  border-radius: 10px;
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

.task-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
}

.task-checkbox:hover {
  border-color: #7c3aed;
}

.task-title.completed {
  text-decoration: line-through;
  color: #9ca3af;
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
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}

.upcoming-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.date-box {
  width: 56px;
  height: 66px;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.date-box span {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  line-height: 1;
}

.purple-date {
  background: #f5f3ff;
}

.pink-date {
  background: #fdf2f8;
}

.date-box strong {
  margin-top: 4px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.upcoming-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.upcoming-category {
  margin-top: 4px;
  font-size: 13px;
  color: #9ca3af;
}

.timer-panel {
  display: flex;
  flex-direction: column;
}

.timer-panel-block {
  display: flex;
  flex-direction: column;
  align-items: center;
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

.add-task-link {
  margin-top: 20px;
  color: #7c3aed;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  width: fit-content;
}

.add-task-link:hover {
  color: #6d28d9;
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
