<script setup>
import router from '@/router/router.js'
import { useAuthStore } from '@/store/auth.js'
import { computed, onMounted } from 'vue'
import { useTasksStore } from '@/store/tasks.js'
import { useFocusStore } from '@/store/focusSessions.js'

const auth = useAuthStore()
const tasksStore = useTasksStore()
const focusStore = useFocusStore()

const totalTasks = computed(() => tasksStore.tasks.length)

const completedTasks = computed(() =>
  tasksStore.tasks.filter(task => task.completed).length
)

const overdueTasks = computed(() => {
  const now = new Date()

  return tasksStore.tasks.filter(task => {
    return (
      !task.completed &&
      task.deadline &&
      new Date(task.deadline) < now
    )
  }).length
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

async function openAllTasks() {
  await router.push({
    name: 'todo',
    query: {
      status: 'all'
    }
  })
}

async function openCompletedTasks() {
  await router.push({
    name: 'todo',
    query: {
      status: 'completed'
    }
  })
}

async function openOverdueTasks() {
  await router.push({
    name: 'todo',
    query: {
      status: 'overdue'
    }
  })
}

async function openTimer() {
  await router.push({
    name: 'timer'
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

onMounted(async () => {
  await focusStore.loadSessions()
})
</script>

<template>
  <div class="dashboard">

    <div class="welcome">
      <h1>Good morning, {{ auth.user?.user_metadata?.username || auth.user?.email?.split('@')[0] }}
        <svg class="welcome-icon" width="42px" height="42px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.7838 21.9999C7.0986 21.2478 5.70665 20.0758 4.79175 18.5068" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M14.8252 2.18595C16.5021 1.70882 18.2333 2.16305 19.4417 3.39724" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M4.0106 8.36655L3.63846 7.71539L4.0106 8.36655ZM6.50218 8.86743L7.15007 8.48962L6.50218 8.86743ZM3.2028 10.7531L2.55491 11.1309H2.55491L3.2028 10.7531ZM7.69685 3.37253L8.34474 2.99472V2.99472L7.69685 3.37253ZM8.53873 4.81624L7.89085 5.19405L8.53873 4.81624ZM10.4165 9.52517C10.6252 9.88299 11.0844 10.0039 11.4422 9.79524C11.8 9.58659 11.9209 9.12736 11.7123 8.76955L10.4165 9.52517ZM7.53806 12.1327C7.74672 12.4905 8.20594 12.6114 8.56376 12.4027C8.92158 12.1941 9.0425 11.7349 8.83384 11.377L7.53806 12.1327ZM4.39747 5.25817L3.74958 5.63598L4.39747 5.25817ZM11.8381 2.9306L12.486 2.55279V2.55279L11.8381 2.9306ZM14.3638 7.26172L15.0117 6.88391L14.3638 7.26172ZM16.0475 10.1491L16.4197 10.8003C16.5934 10.701 16.7202 10.5365 16.772 10.3433C16.8238 10.15 16.7962 9.94413 16.6954 9.77132L16.0475 10.1491ZM17.0153 5.75389C17.2239 6.11171 17.6831 6.23263 18.041 6.02397C18.3988 5.81531 18.5197 5.35609 18.311 4.99827L17.0153 5.75389ZM20.1888 9.7072L20.8367 9.32939V9.32939L20.1888 9.7072ZM6.99128 17.2497L7.63917 16.8719L6.99128 17.2497ZM16.9576 19.2533L16.5854 18.6021L16.9576 19.2533ZM13.784 15.3C13.9927 15.6578 14.4519 15.7787 14.8097 15.5701C15.1676 15.3614 15.2885 14.9022 15.0798 14.5444L13.784 15.3ZM20.347 8.48962C20.1383 8.1318 19.6791 8.01089 19.3213 8.21954C18.9635 8.4282 18.8426 8.88742 19.0512 9.24524L20.347 8.48962ZM8.98692 20.1803C9.35042 20.3789 9.80609 20.2452 10.0047 19.8817C10.2033 19.5182 10.0697 19.0626 9.70616 18.864L8.98692 20.1803ZM13.8888 19.5453C13.4792 19.6067 13.1969 19.9886 13.2583 20.3982C13.3197 20.8079 13.7015 21.0902 14.1112 21.0288L13.8888 19.5453ZM4.38275 9.0177C5.01642 8.65555 5.64023 8.87817 5.85429 9.24524L7.15007 8.48962C6.4342 7.26202 4.82698 7.03613 3.63846 7.71539L4.38275 9.0177ZM3.63846 7.71539C2.44761 8.39597 1.83532 9.8969 2.55491 11.1309L3.85068 10.3753C3.64035 10.0146 3.75139 9.37853 4.38275 9.0177L3.63846 7.71539ZM7.04896 3.75034L7.89085 5.19405L9.18662 4.43843L8.34474 2.99472L7.04896 3.75034ZM7.89085 5.19405L10.4165 9.52517L11.7123 8.76955L9.18662 4.43843L7.89085 5.19405ZM8.83384 11.377L7.15007 8.48962L5.85429 9.24524L7.53806 12.1327L8.83384 11.377ZM7.15007 8.48962L5.04535 4.88036L3.74958 5.63598L5.85429 9.24524L7.15007 8.48962ZM5.57742 3.5228C6.21109 3.16065 6.8349 3.38327 7.04896 3.75034L8.34474 2.99472C7.62887 1.76712 6.02165 1.54123 4.83313 2.22048L5.57742 3.5228ZM4.83313 2.22048C3.64228 2.90107 3.02999 4.40199 3.74958 5.63598L5.04535 4.88036C4.83502 4.51967 4.94606 3.88363 5.57742 3.5228L4.83313 2.22048ZM11.1902 3.30841L13.7159 7.63953L15.0117 6.88391L12.486 2.55279L11.1902 3.30841ZM13.7159 7.63953L15.3997 10.5269L16.6954 9.77132L15.0117 6.88391L13.7159 7.63953ZM9.71869 3.08087C10.3524 2.71872 10.9762 2.94134 11.1902 3.30841L12.486 2.55279C11.7701 1.32519 10.1629 1.0993 8.9744 1.77855L9.71869 3.08087ZM8.9744 1.77855C7.78355 2.45914 7.17126 3.96006 7.89085 5.19405L9.18662 4.43843C8.97629 4.07774 9.08733 3.4417 9.71869 3.08087L8.9744 1.77855ZM15.5437 5.52635C16.1774 5.1642 16.8012 5.38682 17.0153 5.75389L18.311 4.99827C17.5952 3.77068 15.988 3.54478 14.7994 4.22404L15.5437 5.52635ZM14.7994 4.22404C13.6086 4.90462 12.9963 6.40555 13.7159 7.63953L15.0117 6.88391C14.8013 6.52322 14.9124 5.88718 15.5437 5.52635L14.7994 4.22404ZM2.55491 11.1309L6.34339 17.6276L7.63917 16.8719L3.85068 10.3753L2.55491 11.1309ZM19.5409 10.085C21.1461 12.8377 19.9501 16.6792 16.5854 18.6021L17.3297 19.9045C21.2539 17.6618 22.9512 12.9554 20.8367 9.32939L19.5409 10.085ZM15.0798 14.5444C14.4045 13.3863 14.8772 11.6818 16.4197 10.8003L15.6754 9.49797C13.5735 10.6993 12.5995 13.2687 13.784 15.3L15.0798 14.5444ZM19.0512 9.24524L19.5409 10.085L20.8367 9.32939L20.347 8.48962L19.0512 9.24524ZM9.70616 18.864C8.85353 18.3981 8.13826 17.7278 7.63917 16.8719L6.34339 17.6276C6.98843 18.7337 7.90969 19.5917 8.98692 20.1803L9.70616 18.864ZM16.5854 18.6021C15.7158 19.0991 14.7983 19.409 13.8888 19.5453L14.1112 21.0288C15.2038 20.865 16.2984 20.4939 17.3297 19.9045L16.5854 18.6021Z" fill="#1C274C"/>
        </svg></h1>
      <p>Here's what's happening today.</p>
    </div>

    <!-- STATS -->
    <section class="stats-grid">

      <div class="stat-card clickable"
           @click="openAllTasks">
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

      <div class="stat-card clickable"
           @click="openCompletedTasks">
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

      <div class="stat-card clickable"
           @click="openTimer">
        <div class="stat-icon yellow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="1.5"/>
            <path d="M12 6V12L16 14" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="stat-card-block">

          <div class="stat-value">
            {{ focusStore.weeklyFocusTime  }}
          </div>

          <div class="stat-label">
            Focus Hours
          </div>

          <div class="stat-subtitle">
            This week
          </div>
        </div>
      </div>

      <div class="stat-card clickable"
           @click="openOverdueTasks">
        <div class="stat-icon red">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 8V13"
              stroke="#EF4444"
              stroke-width="2"
              stroke-linecap="round"/>
            <circle
              cx="12"
              cy="17"
              r="1"
              fill="#EF4444"/>
            <path
              d="M10.29 3.86L1.82 18C1.64 18.31 1.55 18.66 1.55 19C1.55 20.1 2.45 21 3.55 21H20.45C21.55 21 22.45 20.1 22.45 19C22.45 18.66 22.36 18.31 22.18 18L13.71 3.86C13.32 3.22 12.68 3 12 3C11.32 3 10.68 3.22 10.29 3.86Z"
              stroke="#EF4444"
              stroke-width="1.7"
              stroke-linejoin="round"/>
          </svg>
        </div>

          <div>
            <div class="stat-value">
              {{ overdueTasks }}
            </div>

            <div class="stat-label">
              Overdue
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

.welcome-icon {
  display: inline;
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

.red {
  background: #fef2f2;
}

.stat-label {
  color: #6b7280;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1.1fr;
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

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
}

.clickable:active {
  transform: translateY(-1px);
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
