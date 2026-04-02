<script setup>
import { ref, computed } from 'vue'
import { useTasksStore } from '@/store/tasks.js'

const TASK_LIMIT = 2;
const tasksStore = useTasksStore()
const currentDate = ref(new Date())
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const selectedDate = ref(new Date())
const now = new Date();

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

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfMonth(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23, 59, 59, 999
  )
}

function getVisibleTasks(day) {
  return getTasks(day).slice(0, TASK_LIMIT)
}

function getHiddenCount(day) {
  const total = getTasks(day).length
  return total > TASK_LIMIT ? total - TASK_LIMIT : 0
}

function isToday(date) {
  return formatDateLocal(date) === formatDateLocal(new Date())
}

function isSelected(date) {
  if (!selectedDate.value) return false
  return formatDateLocal(date) === formatDateLocal(selectedDate.value)
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

</script>

<template>
  <div class="calendar-layout">

    <!-- 🟣 Левая панель -->
    <div class="sidebar">

      <section class="card">
        <h4>Monthly Summary</h4>
        <div class="big">{{monthTasksCount}} Tasks</div>

        <template v-if="upcomingTasks.length">
            <div
              v-for="task in upcomingTasks"
              :key="task.id"
              class="sidebar-task">
              <p><b>{{task.title}}</b></p>
              <p class="task-time">{{task.deadline}}</p>
            </div>
        </template>
        <div v-else class="empty">
          No tasks
        </div>
      </section>

      <section>

      </section>


    </div>

    <!-- 🔵 Календарь -->
    <div class="calendar">

      <!-- header -->
      <div class="header">
        <button @click="prevMonth">←</button>
        <span>{{ monthLabel }}</span>
        <button @click="nextMonth">→</button>
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
          @click="selectDay(day)"
        >
          <!-- дата -->
          <div class="date">
            {{ day.date.getDate() }}
          </div>

          <!-- задачи -->
          <div class="tasks">
            <div
              v-for="task in getVisibleTasks(day)"
              :key="task.id"
              class="task"
            >
              {{ task.title }}
            </div>

            <div
              v-if="getHiddenCount(day)"
              class="more"
              @click.stop="selectDay(day)"
            >
              +{{ getHiddenCount(day) }} more
            </div>
          </div>
        </div>
      </div>

    </div>
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
  padding: 10px;
  border-radius: 10px;
  background: #f8f2ff;
  margin-bottom: 8px;
  font-size: 13px;
}

.empty {
  opacity: 0.5;
  font-size: 13px;
}

.calendar {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #c5aada;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header span {
  font-size: 18px;
  font-weight: 600;
}

.header button {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.date {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 10px;
  font-size: 12px;
  color: #9ca3af;
}

.task {
  font-size: 11px;
  background: #f3e8ff;
  color: #5b21b6;
  border-radius: 999px;
  padding: 3px 8px;
}

.day {
  padding: 12px;
  min-height: 110px;
  border-radius: 16px;
  background: #f8f9fc;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s ease;
}

.day:hover {
  background: #f1f5f9;
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
/* выбранный день (главный фокус) */
.selected {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
  transform: scale(1.02);

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

.more {
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
}

.more:hover {
  text-decoration: underline;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  border: 1px solid #c5aada;
}

.card h4 {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}

.big {
  font-size: 24px;
  font-weight: 700;
}

.task-time {
  color: #9539ff;
  font-size: 14px;
  font-weight: 500;
}
</style>
