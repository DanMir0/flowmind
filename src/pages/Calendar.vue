<script setup>
import { ref, computed } from 'vue'

const currentDate = ref(new Date())

const days = computed(() => getCalendarDays(currentDate.value))

const monthLabel = computed(() => {
  return currentDate.value.toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  })
})

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
  <div class="calendar">

    <div class="header">
      <button @click="prevMonth">←</button>
      <span>{{ monthLabel }}</span>
      <button @click="nextMonth">→</button>
    </div>

    <div class="grid">
      <div
        v-for="day in days"
        :key="day.date.toISOString()"
        class="day"
        :class="{'other-month': !day.currentMonth}"
      >
        {{ day.date.getDate() }}
      </div>
    </div>

  </div>
</template>

<style scoped>
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

.day {
  border: 1px solid #ccc;
  padding: 10px;
  min-height: 60px;
}

.other-month {
  opacity: 0.3;
}
</style>
