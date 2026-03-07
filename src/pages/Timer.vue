<script setup>
import { ref, computed, onUnmounted, nextTick, onMounted } from 'vue'
import { useQuotes } from '@/composable/useQuotes.js'
import { useSubscriptionStore } from '@/store/subscription'
import QuoteActionsSheet from '@/components/QuoteActionsSheet.vue'

const subscriptionStore = useSubscriptionStore()

const showQuoteMenu = ref(false)

const toggleQuoteMenu = () => {
  showQuoteMenu.value = !showQuoteMenu.value
}
const showQuoteActions = ref(false)

const {
  displayedQuote,
  loading,
  loadQuote
} = useQuotes()

/* ====== Settings ====== */
const workDuration = ref(30 * 60) // 30 минут по умолчанию

const timeLeft = ref(workDuration.value)
const isRunning = ref(false)
const isEditing = ref(false)
const editValue = ref('')
const timeInput = ref(null)

let endTime = null
let rafId = null

/* ====== Circle config ====== */
const size = 420
const stroke = 30
const center = size / 2
const radius = center - stroke
const circumference = 2 * Math.PI * radius
const dashOffset = ref(0)

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const limitInput = () => {
  // Убираем всё кроме цифр
  editValue.value = editValue.value.replace(/\D/g, '')

  // Жёстко обрезаем до 4 символов
  if (editValue.value.length > 5) {
    editValue.value = editValue.value.slice(0, 5)
  }
}

const enableEdit = async () => {
  if (isRunning.value) return
  editValue.value = ''

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

  const digits = editValue.value

  let minutes = parseInt(digits.slice(0, -2) || 0)
  let seconds = parseInt(digits.slice(-2) || 0)

  if (seconds > 59) seconds = 59

  let total = minutes * 60 + seconds

  if (total < 1) total = 1
  if (total > 4 * 60 * 60) total = 4 * 60 * 60

  workDuration.value = total
  timeLeft.value = total

  isEditing.value = false
}

/* ====== Timer Logic ====== */
const tick = () => {
  const now = Date.now()
  const remainingMs = endTime - now

  if (remainingMs <= 0) {
    timeLeft.value = 0
    dashOffset.value = circumference
    stop()
    return
  }

  const remainingSeconds = Math.ceil(remainingMs / 1000)
  timeLeft.value = remainingSeconds

  const progressRatio = remainingMs / (workDuration.value * 1000)
  dashOffset.value = circumference * (1 - progressRatio)

  rafId = requestAnimationFrame(tick)
}
const start = () => {
  if (isRunning.value || isEditing.value) return

  isRunning.value = true

  endTime = Date.now() + timeLeft.value * 1000

  tick()
}

const stop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  isRunning.value = false
}

const toggle = () => {
  isRunning.value ? stop() : start()
}

const reset = () => {
  stop()
  dashOffset.value = 0
  rafId = null
  endTime = null
  timeLeft.value = workDuration.value
}

/* ====== Edit Mode ====== */
const cancelEdit = () => {
  isEditing.value = false
}

console.log('quote loaded', displayedQuote.value)

onMounted(async () => {
  subscriptionStore.setPro(true) // после теста удалить
  await loadQuote()
})
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
            placeholder="MM:SS"
            pattern="[0-9]*"
            maxlength="5"
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
<!--    <div class="quote-card" v-if="loading || displayedQuote">-->

<!--      <template v-if="loading">-->
<!--        <div class="quote-skeleton-text"></div>-->
<!--        <div class="quote-skeleton-author"></div>-->
<!--      </template>-->

<!--      <template v-else>-->
<!--        <div class="quote-block">-->
<!--          <p class="quote-text">"{{ displayedQuote.text }}" — <span class="quote-author">{{ displayedQuote.author || 'Unknown' }}</span> </p>-->
<!--        </div>-->

<!--        <button class="quote-settings">-->
<!--          <img src="../assets/settings-quotes.svg">-->
<!--        </button>-->
<!--      </template>-->

<!--    </div>-->

    <div class="quote-card" v-if="loading || displayedQuote">

      <template v-if="loading">
        <div class="quote-skeleton-text"></div>
        <div class="quote-skeleton-author"></div>
      </template>

      <template v-else>

        <div class="quote-text">
          "{{ displayedQuote.text }}" <span class="quote-author"> — {{ displayedQuote.author || 'Unknown' }}</span>
        </div>

        <button
          class="quote-settings"
          @click="showQuoteActions = true">
          ⚙️
        </button>

        <div
          v-if="showQuoteMenu"
          class="quote-menu">

          <template v-if="subscriptionStore.isPro">

            <button class="quote-menu-item">
              Add quote
            </button>

            <button class="quote-menu-item">
              My quotes
            </button>

            <button class="quote-menu-item">
              Pin this quote
            </button>

          </template>

          <template v-else>

            <button class="quote-menu-item pro">
              🔒 Unlock custom quotes
            </button>

          </template>

        </div>

      </template>

    </div>

    <QuoteActionsSheet
    :open="showQuoteActions"
    @close="showQuoteActions = false"/>
  </div>
</template>

<style scoped>
.quote-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 40px;
  max-width: 520px;
  gap: 20px;
  padding: 22px 28px;
  margin-left: auto;
  margin-right: auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.06);
}

.quote-menu {
  position: absolute;
  right: 10px;
  bottom: 40px;

  background: white;
  border-radius: 12px;

  box-shadow: 0 8px 20px rgba(0,0,0,0.08);

  padding: 8px;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quote-menu-item {
  border: none;
  background: transparent;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
}

.quote-menu-item:hover {
  background: #f4f4f9;
}

.quote-menu-item.pro {
  color: #7b5cff;
  font-weight: 500;
}

.quote-text {
  font-size: 16px;
  color: #5f5f6a;
  line-height: 1.6;
}

.quote-author {
  color: #8a8a98;
}

.quote-settings {
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #7b5cff;
  transition: transform 0.2s ease;
  padding: 0;
}

.quote-settings:hover {
  transform: rotate(20deg);
}

/* Skeleton */

.quote-skeleton-text {
  height: 18px;
  width: 100%;
  background: linear-gradient(
    90deg,
    #ececf3 25%,
    #f5f5fa 50%,
    #ececf3 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.4s infinite;
  border-radius: 6px;
  margin-bottom: 12px;
}

.quote-skeleton-author {
  height: 16px;
  width: 120px;
  margin: auto;
  background: #ececf3;
  border-radius: 6px;
}

@keyframes skeleton {
  0% { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}



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

.time-input::placeholder {
  color: #b8b8c8;
  opacity: 0.6;
  font-weight: 500;
  font-size: 72px;
}

.timer-page {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
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
