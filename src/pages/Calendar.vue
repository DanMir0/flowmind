<script setup>
import { ref, computed } from 'vue'
import { useTasksStore } from '@/store/tasks.js'
import AddCalendarTaskModal from '@/components/AddCalendarTaskModal.vue'

const showAllTasks = ref(false)
const TASK_LIMIT_CALENDAR = 2
const TASK_LIMIT_UPCOMING = 3
const tasksStore = useTasksStore()
const currentDate = ref(new Date())
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const selectedDate = ref(new Date())
const now = new Date()
const showAddTaskModal = ref(false)

const upcomingTasks = computed(() => {
  return tasksStore.tasks
    .filter(task => {
      if (!task.deadline) return false

      const d = new Date(task.deadline)

      return (
        d >= startOfDay(now) &&
        d.getMonth() === currentDate.value.getMonth() &&
        d.getFullYear() === currentDate.value.getFullYear()
      )
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
})

const visibleUpcomingTasks = computed(() => {
  if (showAllTasks.value) return upcomingTasks.value
  return upcomingTasks.value.slice(0, TASK_LIMIT_UPCOMING)
})

const hiddenTaskCount = computed(() => {
  return upcomingTasks.value.length - TASK_LIMIT_UPCOMING
})

const hasMoreTasks = computed(() => {
  return upcomingTasks.value.length > TASK_LIMIT_UPCOMING
})

const days = computed(() => getCalendarDays(currentDate.value))

const monthLabel = computed(() => {
  return currentDate.value.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  })
})

const tasksByDate = computed(() => {
  const map = {}

  tasksStore.tasks.forEach(task => {
    if (!task.deadline) return

    const key = formatDateLocal(new Date(task.deadline))

    if (!map[key]) map[key] = []
    map[key].push(task)

  })

  return map
})

const monthTasksCount = computed(() => {
  return tasksStore.tasks.filter(task => {
    if (!task.deadline) return false

    const d = new Date(task.deadline)

    return (
      d.getMonth() === currentDate.value.getMonth() &&
      d.getFullYear() === currentDate.value.getFullYear()
    )
  }).length
})

const selectedDayTasks = computed(() => {
  const key = formatDateLocal(selectedDate.value)
  return tasksByDate.value[key] || []
})

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getVisibleTasks(day) {
  return getTasks(day).slice(0, TASK_LIMIT_CALENDAR)
}

function isToday(date) {
  return formatDateLocal(date) === formatDateLocal(new Date())
}

function isSelected(date) {
  if (!selectedDate.value) return false
  return formatDateLocal(date) === formatDateLocal(selectedDate.value)
}

function hiddenTasksCount(day) {
  return Math.max(0, getTasks(day).length - TASK_LIMIT_CALENDAR)
}

function selectDay(day) {
  selectedDate.value = day.date
}

function formatDateLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTasks(day) {
  const key = formatDateLocal(day.date)
  return tasksByDate.value[key] || []
}

function getCalendarDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  const startDay = firstDayOfMonth.getDay() // 0 = Sunday

  const days = []

  // 🔙 предыдущий месяц
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({
      date: d,
      currentMonth: false
    })
  }

  // 🟣 текущий месяц
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const d = new Date(year, month, i)
    days.push({
      date: d,
      currentMonth: true
    })
  }

  // 🔜 следующий месяц (добиваем до 42)
  while (days.length < 42) {
    const last = days[days.length - 1].date
    const d = new Date(last)
    d.setDate(last.getDate() + 1)

    days.push({
      date: d,
      currentMonth: false
    })
  }

  return days
}

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
}

function formatTaskDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric'
  }).format(date)
}

function hasOverflowTasks(day) {
  return getTasks(day).length > TASK_LIMIT_CALENDAR
}
</script>

<template>
  <div class="calendar-layout">

    <!-- Левая панель -->
    <div class="sidebar">

      <section class="card">
        <h4>Monthly Summary</h4>
        <div class="big">{{ monthTasksCount }} Tasks</div>
        <p class="upcoming-due">Upcoming Due</p>
        <template v-if="upcomingTasks.length">

          <div
            class="tasks-list"
            :class="{ expanded: showAllTasks }">
            <div
              v-for="task in visibleUpcomingTasks"
              :key="task.id"
              class="sidebar-task">
              <p><b>{{ task.title }}</b></p>
              <p class="task-time">
                {{ formatTaskDate(task.deadline) }}
              </p>
            </div>
          </div>

          <div
            v-if="hasMoreTasks"
            class="show-more"
            @click="showAllTasks = !showAllTasks">
            {{ showAllTasks ? 'Show less' : `Show ${hiddenTaskCount} more` }}
          </div>

        </template>
        <div v-else class="empty">
          No tasks
        </div>
      </section>

      <section>

        <div class="day-panel">

          <h3>Selected Day</h3>

          <div class="selected-date">
            {{ formatTaskDate(selectedDate) }}
          </div>

          <template v-if="selectedDayTasks.length">

            <div
              v-for="task in selectedDayTasks"
              :key="task.id"
              class="day-task">

              {{ task.title }}

            </div>

          </template>

          <div
            v-else
            class="empty-day">
            No tasks for this day
          </div>

          <button class="add-task-btn" @click="showAddTaskModal = true">
            + Add task
          </button>

        </div>

      </section>

    </div>

    <!-- 🔵 Календарь -->
    <div class="calendar">

      <!-- header -->
      <div class="calendar-header">

        <div class="calendar-actions">
          <button class="today-btn">
            Today
          </button>

          <button
            class="nav-btn"
            @click="prevMonth">
            ←
          </button>

          <button
            class="nav-btn"
            @click="nextMonth">
            →
          </button>
        </div>

        <h2 class="month-title">
          {{ monthLabel }}
        </h2>

        <button class="view-btn">
          Month
        </button>

      </div>

      <!-- дни недели -->
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day">
          {{ day }}
        </div>
      </div>

      <!-- сетка -->
      <div class="grid">
        <div
          v-for="day in days"
          :key="day.date.toISOString()"
          class="day"
          :class="{
            'other-month': !day.currentMonth,
            'today': isToday(day.date),
            'selected': isSelected(day.date)
          }"
          @click="selectDay(day)">
          <!-- дата -->
          <div class="date">
            {{ day.date.getDate() }}
          </div>

          <!-- задачи -->
          <div class="tasks">
            <div
              v-for="task in getVisibleTasks(day)"
              :key="task.id"
              class="task">
              {{ task.title }}
            </div>

            <div
              v-if="hasOverflowTasks(day)"
              class="more-tasks">
              +{{ hiddenTasksCount(day) }} more
            </div>
          </div>
        </div>
      </div>

    </div>
    <AddCalendarTaskModal
      :open="showAddTaskModal"
      :selected-date="selectedDate"
      @close="showAddTaskModal = false"
    />
  </div>
</template>

<style scoped>
.calendar-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  padding: 24px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-task {
  background: #F8FAFC;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #EEF2F7;
}

.empty {
  opacity: 0.5;
  font-size: 13px;
}

.calendar {
  background: #fff;
  border: 1px solid #E9D5FF;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(124, 58, 237, .08);
  height: 760px;
  overflow: hidden;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calendar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.month-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.today-btn,
.view-btn,
.nav-btn {
  height: 44px;
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 14px;
  cursor: pointer;
  transition: .2s;
}

.today-btn {
  padding: 0 22px;
}

.view-btn {
  padding: 0 20px;
}

.nav-btn {
  width: 44px;
}

.today-btn:hover,
.view-btn:hover,
.nav-btn:hover {
  background: #F9FAFB;
}

.grid {
  display: grid;
  grid-template-columns:repeat(7, 1fr);
  grid-template-rows:repeat(6, 1fr);
  height: 640px;
  border-top: 1px solid #EEF1F7;
}

.date {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.task {
  background: #F3E8FF;
  color: #6d28d9;
  height: 24px;
  display: flex;
  font-weight: 600;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  border-radius: 8px;
}

.day {
  padding: 10px;
  border: 1px solid #EEF1F7;
  border-right: 1px solid #EEF2F7;
  border-bottom: 1px solid #EEF2F7;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day:hover {
  background: #F8F5FF;
}

.day.selected:hover {
  background: #7C3AED;
  color: #000000;
}

.day.today:hover .date {
  background: #7C3AED;
  color: #fff;
}

.today .date {
  background: #7c3aed;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.day-panel {
  background: white;
  border: 1px solid #E9D5FF;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(124,58,237,.05);
}

.day-panel h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.selected-date {
  margin-top: 6px;
  margin-bottom: 20px;
  color: #7C3AED;
  font-weight: 600;
}

.day-task {
  padding: 12px;
  margin-bottom: 10px;
  background: #F8FAFC;
  border: 1px solid #EEF2F7;
  border-radius: 12px;
  font-size: 14px;
}

.empty-day {
  padding: 20px 0;
  color: #9CA3AF;
  text-align: center;
}

.add-task-btn {
  width: 100%;
  margin-top: 16px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #7C3AED;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.add-task-btn:hover {
  background: #6D28D9;
}

/* выбранный день (главный фокус) */
.selected {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

.selected .date {
  color: white;
}

.selected .task {
  background: white;
  color: #6d28d9;
}

/* чужой месяц */
.other-month {
  opacity: 0.35;
  background: #e5deff;
}

.card {
  background: white;
  border: 1px solid #E9D5FF;
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(124, 58, 237, .05);
}

.card h4 {
  color: #7C3AED;
  font-size: 16px;
  margin-bottom: 20px;
}

.big {
  font-size: 36px;
  font-weight: 700;
}

.task-time {
  color: #9539ff;
  font-size: 14px;
  font-weight: 500;
}

.more-tasks {
  font-size: 9px;
  font-weight: 600;
  color: #7C3AED;
}

.selected .more-tasks {
  color: white;
}

.tasks-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow: hidden;
  transition: all 0.25s ease;
  padding-bottom: 10px;
}

/* при раскрытии */
.tasks-list.expanded {
  overflow-y: auto;
}

.tasks-list:not(.expanded)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
}

/* кнопка */
.show-more {
  margin-top: 8px;
  font-size: 13px;
  color: #7c3aed;
  cursor: pointer;
  font-weight: 500;
}

.show-more:hover {
  text-decoration: underline;
}

</style>
