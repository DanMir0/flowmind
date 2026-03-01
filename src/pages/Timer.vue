<script setup>
import { ref, computed, onUnmounted, nextTick } from 'vue'

/* ====== Settings ====== */
const workDuration = ref(30 * 60) // 30 минут по умолчанию

const timeLeft = ref(workDuration.value)
const isRunning = ref(false)
const isEditing = ref(false)
const editValue = ref('')
const timeInput = ref(null)

let interval = null

/* ====== Circle config ====== */
const size = 420
const stroke = 30
const center = size / 2
const radius = center - stroke
const circumference = 2 * Math.PI * radius

/* ====== Computed ====== */
const progress = computed(() => timeLeft.value / workDuration.value)

const dashOffset = computed(() =>
  circumference * (1 - progress.value)
)

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `
  ${String(minutes).padStart(2, '0')}:
  ${String(seconds).padStart(2, '0')}`
})

const limitInput = () => {
  // Убираем всё кроме цифр
  editValue.value = editValue.value.replace(/\D/g, '')

  // Жёстко обрезаем до 4 символов
  if (editValue.value.length > 4) {
    editValue.value = editValue.value.slice(0, 4)
  }
}

const enableEdit = async () => {
  if (isRunning.value) return

  // Заполняем цифрами без двоеточия
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60

  editValue.value =
    String(minutes).padStart(2, '0') +
    String(seconds).padStart(2, '0')

  isEditing.value = true

  await nextTick()
  timeInput.value.focus()
  timeInput.value.select()
}

const applyEdit = () => {
  if (!editValue.value) {
    isEditing.value = false
    return
  }

  const digits = editValue.value.padStart(4, '0')

  let minutes = parseInt(digits.slice(0, 2))
  let seconds = parseInt(digits.slice(2, 4))

  if (seconds > 59) seconds = 59

  let total = minutes * 60 + seconds

  if (total < 60) total = 60
  if (total > 4 * 60 * 60) total = 4 * 60 * 60

  workDuration.value = total
  timeLeft.value = total

  isEditing.value = false
}

/* ====== Timer Logic ====== */
const start = () => {
  if (interval || isEditing.value) return

  isRunning.value = true

  interval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      stop()
    }
  }, 1000)
}

const stop = () => {
  clearInterval(interval)
  interval = null
  isRunning.value = false
}

const toggle = () => {
  isRunning.value ? stop() : start()
}

const reset = () => {
  stop()
  timeLeft.value = workDuration.value
}

/* ====== Edit Mode ====== */
const cancelEdit = () => {
  isEditing.value = false
}

onUnmounted(stop)
</script>

<template>
  <div class="timer-page">
    <div class="circle-wrapper">

      <svg :width="size" :height="size" class="progress-ring">
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3d03a1" />
            <stop offset="25%" stop-color="#756cab" />
            <stop offset="50%" stop-color="#ba9fe3" />
            <stop offset="75%" stop-color="#8c5fcf" />
          </linearGradient>
        </defs>

        <!-- Background ring -->
        <circle
          class="progress-bg"
          :r="radius"
          :cx="center"
          :cy="center"
          :stroke-width="stroke"
          fill="transparent" />

        <!-- Progress ring -->
        <circle
          class="progress-bar"
          :r="radius"
          :cx="center"
          :cy="center"
          :stroke-width="stroke"
          fill="transparent"
          stroke="url(#purpleGradient)"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset" />
      </svg>

      <div class="content">
        <div class="time">

          <!-- отображение -->
          <div
            v-if="!isEditing"
            class="time-display"
            @click="enableEdit">
            {{ formattedTime }}
          </div>

          <!-- редактирование -->
          <input
            v-else
            ref="timeInput"
            v-model="editValue"
            class="time-input"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="4"
            @input="limitInput"
            @keyup.enter="applyEdit"
            @keyup.esc="cancelEdit"
            @blur="applyEdit" />

        </div>

        <div class="actions">
          <button class="primary" @click="toggle">
            {{ isRunning ? 'Pause' : 'Start' }}
          </button>
          <button class="secondary" @click="reset">
            Reset
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.time-display {
  cursor: pointer;
}

.time-input {
  font-size: 88px;
  font-weight: 600;
  text-align: center;
  border: none;
  background: transparent;
  color: #3925a7;
  outline: none;
  width: 260px;
  letter-spacing: 2px;
}

.timer-page {
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f7;
}

/* ===== Circle ===== */
.circle-wrapper {
  position: relative;
  width: 420px;
  height: 420px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: #ebe8f5;
}

.progress-bar {
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

/* ===== Content inside circle ===== */
.content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ===== Time ===== */
.time {
  font-size: 88px;
  font-weight: 600;
  color: #3925a7;
  letter-spacing: 2px;
  margin-bottom: 28px;
}

/* ===== Buttons ===== */
.actions {
  display: flex;
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}

button {
  border: none;
  cursor: pointer;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 36px;
  transition: all 0.25s ease;
}

/* Start */
.primary {
  background: linear-gradient(135deg, #7a3cff, #9d6bff);
  color: white;
  box-shadow: 0 8px 20px rgba(122, 60, 255, 0.35);
}

.primary:hover {
  background: linear-gradient(135deg, #6045a8, #a87ff6);
}

/* Reset */
.secondary {
  background: transparent;
  color: #6b6b6b;
}

.secondary:hover {
  background: #f2f2f7;
}
</style>


