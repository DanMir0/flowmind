<script setup>
import { computed } from 'vue'
import { useTasksStore } from '@/store/tasks'

const tasksStore = useTasksStore()

function isToday(dateStr) {
  if (!dateStr) return false

  const today = new Date()
  const date = new Date(dateStr)

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

const focusTasks = computed(() => {
  return tasksStore.tasks.filter(task => {
    if (!task.deadline) return false

    return isToday(task.deadline) || isOverdue(task.deadline)
  })
})

function isOverdue(dateStr) {
  if (!dateStr) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const date = new Date(dateStr)
  date.setHours(0, 0, 0, 0)

  return date < today
}

const completedFocusTasks = computed(() => {
  return focusTasks.value.filter(t => t.completed).length
})

const progressPercent = computed(() => {
  if (!focusTasks.value.length) return 0

  return Math.round(
    (completedFocusTasks.value / focusTasks.value.length) * 100
  )
})
</script>

<template>
  <aside class="sidebar">

    <router-link to="/dashboard" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M15 18H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Home</span>
    </router-link>

    <router-link to="/to-do-list" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 1024 1024" class="icon" version="1.1"
           xmlns="http://www.w3.org/2000/svg">
        <path
          d="M864 512a32 32 0 0 0-32 32v96a32 32 0 0 0 64 0v-96a32 32 0 0 0-32-32zM881.92 389.44a23.68 23.68 0 0 0-5.76-2.88 19.84 19.84 0 0 0-6.08-1.92 32 32 0 0 0-28.8 8.64A32 32 0 0 0 832 416a32 32 0 1 0 64 0 33.6 33.6 0 0 0-9.28-22.72z"
          fill="#231815" />
        <path
          d="M800 128h-32a96 96 0 0 0-96-96H352a96 96 0 0 0-96 96H224a96 96 0 0 0-96 93.44v677.12A96 96 0 0 0 224 992h576a96 96 0 0 0 96-93.44V736a32 32 0 0 0-64 0v162.56a32 32 0 0 1-32 29.44H224a32 32 0 0 1-32-29.44V221.44A32 32 0 0 1 224 192h32a96 96 0 0 0 96 96h320a96 96 0 0 0 96-96h32a32 32 0 0 1 32 29.44V288a32 32 0 0 0 64 0V221.44A96 96 0 0 0 800 128z m-96 64a32 32 0 0 1-32 32H352a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32h320a32 32 0 0 1 32 32z"
          fill="#231815" />
        <path
          d="M712.32 426.56L448 721.6l-137.28-136.32A32 32 0 0 0 265.6 630.4l160 160a32 32 0 0 0 22.4 9.6 32 32 0 0 0 23.04-10.56l288-320a32 32 0 0 0-47.68-42.88z"
          fill="#231815" />
      </svg>
      <span>To-Do List</span>
    </router-link>

    <router-link to="/calendar" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"
              fill="none" />
        <path d="M8 2V6M16 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M3 10H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
        <circle cx="16" cy="15" r="1" fill="currentColor" />
        <circle cx="8" cy="15" r="1" fill="currentColor" />
        <circle cx="12" cy="19" r="1" fill="currentColor" />
        <circle cx="8" cy="19" r="1" fill="currentColor" />
        <circle cx="16" cy="19" r="1" fill="currentColor" />
      </svg>
      <span>Calendar</span>
    </router-link>

    <!-- Улучшенная иконка Timer -->
    <router-link to="/timer" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="13" r="9" stroke="currentColor" stroke-width="1.5" fill="none" />
        <path d="M12 8V13L15 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
        <path d="M8 3L16 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Timer</span>
    </router-link>

    <router-link to="/settings" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="currentColor" stroke-width="1.5" fill="none" />
        <path
          d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2552 5.47529L13.6046 4.3776L12 2L10.3954 4.3776L7.7448 5.47529L6 4L4 6L5.47529 7.7448L4.3776 10.3954L2 12L4.3776 13.6046L5.47529 16.2552L4 18L6 20L7.7448 18.5247L10.3954 19.6224L12 22L13.6046 19.6224L16.2552 18.5247L18 20L20 18L18.5247 16.2552L19.6224 13.6046L22 12L19.6224 10.3954Z"
          stroke="currentColor" stroke-width="1.5" fill="none" />
      </svg>
      <span>Settings</span>
    </router-link>

    <router-link to="/archive" class="menu-item">
      <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V7Z"
              stroke="currentColor" stroke-width="1.5" fill="none" />
        <path d="M3 4H21V7H3V4Z" stroke="currentColor" stroke-width="1.5" fill="none" />
        <path d="M10 11H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>Archive</span>
    </router-link>


    <div class="focus-card">
      <div class="focus-header">
        Today's Focus
      </div>

      <template v-if="focusTasks.length">
        <div class="progress-wrapper">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-bg"
              cx="60"
              cy="60"
              r="50"
            />

            <circle
              class="progress-value"
              cx="60"
              cy="60"
              r="50"
              :stroke-dasharray="314"
              :stroke-dashoffset="314 - (314 * progressPercent) / 100"
            />
          </svg>

          <div class="progress-text">
            <div class="big">
              {{ completedFocusTasks }}/{{ focusTasks.length }}
            </div>

            <div class="small">
              tasks done
            </div>
          </div>
        </div>

        <p class="focus-footer">
          Keep it up 💪
        </p>
      </template>

      <template v-else>
        <div class="empty-focus">
          <div class="empty-icon">
            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#7a3cff" stroke-width="1.5" fill="none"/>
              <path d="M8 12L11 15L16 9" stroke="#7a3cff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <div class="empty-title">
            All caught up
          </div>

          <div class="empty-subtitle">
            No tasks for today
          </div>
        </div>
      </template>
    </div>
</aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: calc(100vh - 73px);

  background: white;
  border-right: 1px solid #eee;

  padding: 24px 16px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  text-decoration: none;

  color: #374151;

  padding: 14px 16px;

  border-radius: 14px;

  transition: 0.2s;
  font-weight: 500;
}

.menu-item:hover {
  background: #f5f3ff;
}

.router-link-active {
  background: #ede9fe;
  color: #7a3cff;
}

.empty-focus {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 0 4px;
}

.empty-icon {
  width: 44px;
  height: 44px;

  border-radius: 50%;

  background: #F5F3FF;
  color: #7C3AED;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 20px;
  font-weight: 700;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.empty-subtitle {
  font-size: 13px;
  color: #6B7280;
  text-align: center;
}

.focus-card {
  margin-top: 24px;
  background: white;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  min-height: 238px;
}

.focus-header {
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.progress-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #ede9fe;
  stroke-width: 10;
}

.progress-value {
  fill: none;
  stroke: #7c3aed;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.progress-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.big {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.small {
  font-size: 12px;
  color: #6b7280;
}

.focus-footer {
  font-size: 14px;
  color: #4b5563;
}
</style>
