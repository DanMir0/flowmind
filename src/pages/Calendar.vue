<script setup>
import { ref, computed } from 'vue'
import { useTasksStore } from '@/store/tasks.js'

const TASK_LIMIT = 2;
const tasksStore = useTasksStore()
const currentDate = ref(new Date())
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const selectedDate = ref(new Date())

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

const selectedTasks = computed(() => {
  if (!selectedDate.value) return []

  const key = formatDateLocal(selectedDate.value)
  return tasksByDate.value[key] || []
})

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
      <h3>
        {{ selectedDate ? formatDateLocal(selectedDate) : 'Select a day' }}
      </h3>

      <div v-if="selectedTasks.length">
        <div
          v-for="task in selectedTasks"
          :key="task.id"
          class="sidebar-task"
        >
          {{ task.title }}
        </div>
      </div>

      <div v-else class="empty">
        No tasks
      </div>
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
  grid-template-columns: 260px 1fr;
  gap: 16px;
}

.sidebar {
  background: #fafafa;
  border-radius: 16px;
  padding: 16px;
}

.sidebar-task {
  padding: 8px;
  border-radius: 8px;
  background: white;
  margin-bottom: 8px;
  font-size: 13px;
}

.empty {
  opacity: 0.5;
  font-size: 13px;
}

.calendar {
  max-width: 800px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.date {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.7;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
  font-weight: 600;
  opacity: 0.7;
}

.task {
  font-size: 11px;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day {
  border: 1px solid #eee;
  padding: 8px;
  min-height: 100px;
  border-radius: 14px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: 0.2s;
}

.day:hover {
  background: #f9fafb;
}

/* сегодняшний день */
.today {
  border: 2px solid #7c3aed;
}

/* выбранный день (главный фокус) */
.selected {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
}

.selected .task {
  background: rgba(255,255,255,0.2);
  color: white;
}

/* чужой месяц */
.other-month {
  opacity: 0.3;
}


</style>
