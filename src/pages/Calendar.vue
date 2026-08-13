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
const calendarView = ref('month')
const calendarViews = [
  'Month',
  'Week',
  'Day'
]

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
  return currentDate.value.toLocaleString('en-Us', {
    day: "numeric",
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

function goToToday() {
  const today = new Date()

  currentDate.value = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )

  selectedDate.value = today
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
    currentDate.value.getMonth() - 1,
    1
  )

  selectedDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )

  selectedDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    1
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
          <button class="today-btn"
                  @click="goToToday">
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
              v-for="(task,index) in getVisibleTasks(day)"
              :key="task.id"
              class="task">
              <span class="task-title">
                  {{ task.title }}
              </span>

              <span
                v-if="index === TASK_LIMIT_CALENDAR - 1 && hasOverflowTasks(day)"
                class="task-more">
                  +{{ hiddenTasksCount(day) }}
              </span>
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
  background: var(--bg-page);
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
  background: var(--bg-task);
  border-radius: 14px;
  padding: 14px;
  border: 1px solid var(--border-card);
}

.empty {
  opacity: 0.5;
  font-size: 13px;
}

.calendar {
  background: var(--bg);
  border: 1px solid var(--border-pink);
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

.task-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.task-more {
  flex-shrink: 0;
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
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
  color: var(--text);
}

.today-btn,
.view-btn,
.nav-btn {
  color: var(--text);
  height: 44px;
  border: 1px solid var(--border-grey);
  background: var(--bg);
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
  background: var(--quick-input-bg);
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
  color: var(--text);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--text-grey);
}

.task {
  background: var(--bg-pink);
  color: var(--dark-purple);
  height: 24px;
  display: flex;
  font-weight: 600;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  border-radius: 8px;
}

.day {
  padding: 6px;
  border: 1px solid var(--border-calen);
  border-right: 1px solid var(--border-calen-r);
  border-bottom: 1px solid var(--border-calen-r);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day:hover {
  background: var(--day-hover);
}

.day.selected:hover {
  background: var(--premium-bg);
  color: #000000;
}


.day-panel {
  background: var(--bg);
  border: 1px solid var(--border-pink);
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(124,58,237,.05);
}

.day-panel h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.selected-date {
  margin-top: 6px;
  margin-bottom: 20px;
  color: var(--premium-bg);
  font-weight: 600;
}

.day-task {
  padding: 12px;
  margin-bottom: 10px;
  background: var(--bg-task);
  border: 1px solid var(--border-card);
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
  background: var(--premium-bg);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.add-task-btn:hover {
  background: var(--dark-purple);
}

/* выбранный день (главный фокус) */
.selected {
  background: linear-gradient(135deg, var(--premium-bg), var(--dark-purple));
}

.today .date,
.selected .date {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--bg);
}

.today {
  background: var(--bg-today);
  border: 1px solid var(--border-today);
}

.today .date {
  background: var(--premium-bg);
  color: var(--bg);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(124,58,237,.25);
}

.today.selected {
  background: linear-gradient(135deg, #8B5CF6, var(--dark-purple));
}

.today.selected .date {
  background: var(--bg);
  color: var(--premium-bg);
}

.selected .task {
  background: var(--bg);
  color: var(--dark-purple);
}

/* чужой месяц */
.other-month {
  background: var(--bg-other-month);
  color: var(--text-other-month);
}

.card {
  background: var(--bg);
  border: 1px solid var(--border-pink);
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(124, 58, 237, .05);
}

.card h4 {
  color: var(--premium-bg);
  font-size: 16px;
  margin-bottom: 20px;
}

.big {
  color: var(--text);
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
  color: var(--premium-bg);
}

.selected .more-tasks {
  background: var(--bg);
}

.upcoming-due {
  color: var(--text);
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
  background: linear-gradient(to bottom, transparent, var(--bg));
  pointer-events: none;
}

/* кнопка */
.show-more {
  margin-top: 8px;
  font-size: 13px;
  color: var(--premium-bg);
  cursor: pointer;
  font-weight: 500;
}

.show-more:hover {
  text-decoration: underline;
}


/* ========================================
   МОБИЛЬНАЯ И ПЛАНШЕТНАЯ ВЕРСТКА
   ======================================== */

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .calendar-layout {
    grid-template-columns: 260px 1fr;
    gap: 16px;
    padding: 16px;
  }

  .sidebar {
    gap: 12px;
    grid-row: 2;
  }

  .calendar {
    height: auto;
    min-height: 600px;
    padding: 16px;
  }

  .grid {
    height: auto;
    min-height: 400px;
    flex: 1;
  }

  .day {
    min-height: 50px;
    padding: 4px 3px;
  }

  .date {
    font-size: 16px;
  }

  .task {
    height: 20px;
    font-size: 10px;
    padding: 0 6px;
  }

  .month-title {
    font-size: 22px;
  }

  .card,
  .day-panel {
    padding: 18px;
  }

  .big {
    font-size: 28px;
  }

  .today-btn,
  .nav-btn {
    height: 38px;
  }

  .today-btn {
    padding: 0 16px;
    font-size: 13px;
  }

  .nav-btn {
    width: 38px;
    font-size: 16px;
  }

  .sidebar-task {
    padding: 10px 12px;
  }

  .day-task {
    padding: 10px;
    font-size: 13px;
  }

  .add-task-btn {
    height: 40px;
    font-size: 14px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .calendar-layout {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
    min-height: calc(100vh - 64px);
  }

  .calendar {
    height: auto;
    min-height: 500px;
    padding: 12px;
    border-radius: 14px;
  }

  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-bottom: 10px;
  }

  .calendar-actions {
    justify-content: space-between;
    gap: 8px;
  }

  .today-btn {
    flex: 1;
    text-align: center;
    padding: 0 12px;
    height: 36px;
    font-size: 13px;
    border-radius: 10px;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 10px;
  }

  .month-title {
    font-size: 20px;
    text-align: center;
    margin: 0;
  }

  .weekdays {
    font-size: 10px;
    margin-bottom: 2px;
  }

  .weekdays div {
    padding: 4px 0;
  }

  .grid {
    min-height: 360px;
    flex: 1;
  }

  .day {
    min-height: 44px;
    padding: 3px 2px;
    gap: 1px;
    border-width: 0.5px;
  }

  .date {
    font-size: 13px;
    font-weight: 600;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .task {
    height: 16px;
    font-size: 8px;
    padding: 0 4px;
    border-radius: 4px;
    line-height: 16px;
  }

  .task-more {
    font-size: 8px;
    margin-left: 3px;
  }

  .today .date {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }

  .selected .date {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }

  .today.selected .date {
    width: 24px;
    height: 24px;
    font-size: 13px;
  }

  /* Мобильная панель для выбранного дня (внизу) */
  .mobile-day-panel {
    display: block;
    margin-top: 12px;
    padding: 16px;
    background: var(--bg, #ffffff);
    border: 1px solid var(--border-pink, #e2e8f0);
    border-radius: 14px;
  }

  .mobile-day-panel h4 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--text, #0f172a);
  }

  .mobile-day-panel .selected-date-mobile {
    font-size: 13px;
    color: var(--premium-bg, #7c3aed);
    font-weight: 500;
    margin-bottom: 12px;
  }

  .mobile-day-panel .day-task-mobile {
    padding: 10px 12px;
    margin-bottom: 8px;
    background: var(--bg-task, #f8fafc);
    border: 1px solid var(--border-card, #e2e8f0);
    border-radius: 10px;
    font-size: 13px;
  }

  .mobile-day-panel .empty-day-mobile {
    padding: 16px 0;
    color: #9CA3AF;
    text-align: center;
    font-size: 13px;
  }

  .mobile-day-panel .add-task-btn-mobile {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 10px;
    background: var(--premium-bg, #7c3aed);
    color: var(--bg, #ffffff);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: .2s;
  }

  .mobile-day-panel .add-task-btn-mobile:hover {
    background: var(--dark-purple, #6d28d9);
  }
}

/* ===== ПЛАНШЕТЫ В ПОРТРЕТНОЙ ОРИЕНТАЦИИ ===== */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .calendar-layout {
    grid-template-columns: 220px 1fr;
    gap: 14px;
    padding: 14px;
  }

  .calendar {
    min-height: 500px;
  }

  .grid {
    min-height: 340px;
  }

  .day {
    min-height: 44px;
    padding: 3px 2px;
  }

  .date {
    font-size: 14px;
  }

  .task {
    height: 18px;
    font-size: 9px;
    padding: 0 4px;
  }

  .month-title {
    font-size: 20px;
  }
}

/* ===== ПЛАНШЕТЫ В АЛЬБОМНОЙ ОРИЕНТАЦИИ ===== */
@media (min-width: 1025px) and (max-width: 1366px) {
  .calendar-layout {
    grid-template-columns: 280px 1fr;
    padding: 20px;
  }

  .calendar {
    height: 700px;
  }

  .grid {
    height: 580px;
  }
}


/* ===== МОБИЛЬНАЯ ПАНЕЛЬ (добавляем в шаблон) ===== */
@media (max-width: 767px) {
  .mobile-day-panel {
    display: block !important;
  }
}

@media (min-width: 768px) {
  .mobile-day-panel {
    display: none !important;
  }
}
</style>
