<script setup>
import { ref, computed, onUnmounted, nextTick, onMounted } from 'vue'
import { useQuotes } from '@/composable/useQuotes.js'
import { useSubscriptionStore } from '@/store/subscription'
import QuoteMenu from '@/components/quotes/QuoteMenu.vue'
import AddQuoteModal from '@/components/quotes/AddQuoteModal.vue'
import { useRouter } from 'vue-router'

const subscriptionStore = useSubscriptionStore()

const router = useRouter()
const showQuoteMenu = ref(false)
const showAddQuote = ref(false)

const openMyQuotes = () => {
  showQuoteMenu.value = false
  router.push({name: 'myQuotes'})
}
const openAddQuote = () => {
  showQuoteMenu.value = false
  showAddQuote.value = true
}

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
          @click="showQuoteMenu = true">
          <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 16C14.7091 16 16.5 14.2091 16.5 12C16.5 9.79086 14.7091 8 12.5 8C10.2909 8 8.5 9.79086 8.5 12C8.5 14.2091 10.2909 16 12.5 16Z" fill="#8262bf"/>
          </svg>
        </button>

      </template>

    </div>

    <QuoteMenu
      :open="showQuoteMenu"
      @close="showQuoteMenu = false"
      @add-quote="openAddQuote"
      @my-quotes="openMyQuotes"/>

    <AddQuoteModal
      :open="showAddQuote"
      @close="showAddQuote = false"/>
  </div>
</template>

<style scoped>
.quote-card {
  position: relative;
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
