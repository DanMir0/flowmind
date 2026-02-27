<script setup>
import { ref, computed, onUnmounted } from 'vue'

/* ====== Settings ====== */
const WORK_DURATION = 25 * 60

/* ====== State ====== */
const timeLeft = ref(WORK_DURATION)
const isRunning = ref(false)
let interval = null

/* ====== Circle config ====== */
const size = 420
const stroke = 22
const center = size / 2
const radius = center - stroke
const circumference = 2 * Math.PI * radius

/* ====== Computed ====== */
const progress = computed(() => timeLeft.value / WORK_DURATION)

const dashOffset = computed(() =>
  circumference * (1 - progress.value)
)

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
})

/* ====== Methods ====== */
const start = () => {
  if (interval) return
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
  timeLeft.value = WORK_DURATION
}

onUnmounted(stop)
</script>

<template>
  <div class="timer-page">
    <div class="circle-wrapper">

      <svg :width="size" :height="size" class="progress-ring">
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#c9b6ff" />
            <stop offset="100%" stop-color="#7a3cff" />
          </linearGradient>
        </defs>

        <!-- Background ring -->
        <circle
          class="progress-bg"
          :r="radius"
          :cx="center"
          :cy="center"
          :stroke-width="stroke"
          fill="transparent"
        />

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
          :stroke-dashoffset="dashOffset"
        />
      </svg>

      <div class="content">
        <div class="time">
          {{ formattedTime }}
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
.timer-page {
  min-height: 100vh;
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
  color: #5a3dff;
  letter-spacing: 2px;
  margin-bottom: 28px;
}

/* ===== Buttons ===== */

.actions {
  display: flex;
  background: #ffffff;
  border-radius: 999px;
  padding: 6px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
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
  transform: translateY(-2px);
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
