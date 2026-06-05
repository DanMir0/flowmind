<script setup>
import router from '@/router/router.js'
import { useAuthStore } from '@/store/auth.js'
import { computed, ref } from 'vue'
import { useTasksStore } from '@/store/tasks.js'

const defaultTasks = ref([
  { id: 0, title: 'Finish project report', deadline: 'Deadline: 25th Oct 2026' },
  { id: 1, title: 'Prepare presentation', deadline: 'Deadline: 27th Oct 2026' },
  { id: 2, title: 'Team meeting', deadline: 'Deadline: 28th Oct 2026' }
])

const auth = useAuthStore()
const tasksStore = useTasksStore()

const tasks = computed(() => tasksStore.tasks.filter(t => !t.completed))

async function goToCalendarPage() {
  if (auth.goToLoginIfGuest(router)) await router.push({ name: 'calendar' })
}

async function goToTimerPage() {
  if (auth.goToLoginIfGuest(router)) await router.push({ name: 'timer' })
}

async function goToTodoPage() {
  if (auth.goToLoginIfGuest(router)) await router.push({ name: 'todo' })
}

</script>

<template>
  <div class="dashboard">
    <main class="content">

      <!-- To Do -->
      <section class="section section-todo">
        <h2 @click="goToTodoPage">To-Do List</h2>

        <!-- Гость -->
        <div v-if="!auth.user">
          <div
            v-for="card in defaultTasks"
            :key="card.id"
            @click="goToTodoPage"
            class="card"
          >
            <h3>{{ card.title }}</h3>
            <p>{{ card.deadline }}</p>
          </div>
        </div>

        <!-- Авторизован -->
        <div v-else>
          <!-- Ждём первую загрузку -->
          <div v-if="!tasksStore.isInitialized">
            <div v-for="n in 2" :key="n" class="card placeholder"></div>
          </div>

          <!-- Есть задачи -->
          <div v-else-if="tasks.length">
            <div
              v-for="card in tasks"
              :key="card.id"
              class="card"
              @click="goToTodoPage"
            >
              <h3>{{ card.title }}</h3>
              <p>{{ card.deadline }}</p>
            </div>
          </div>

          <!-- Реально пусто -->
          <p v-else>No tasks yet</p>
        </div>
      </section>

      <!-- Calendar -->
      <section class="section section-calendar">
        <h2 @click="goToCalendarPage">Calendar</h2>

        <div class="card image-card">
          <img
            @click="goToCalendarPage"
            src="../assets/calendar.png"
            alt="calendar image"
          >
        </div>
      </section>

      <!-- Timer -->
      <section class="section section-timer">
        <h2 @click="goToTimerPage">Timer</h2>

        <div class="card timer-card">
          <p>Work Session Timer</p>

          <img
            @click="goToTimerPage"
            src="../assets/timer.png"
            alt="timer image"
          >

          <button @click="goToTimerPage" class="btn">
            Start
          </button>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <span>© 2026 TaskMaster. All rights reserved.</span>

        <span class="divider"></span>

        <a href="/privacy">Privacy Policy</a>

        <span class="divider"></span>

        <a href="/terms">Terms of Service</a>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.placeholder {
  height: 90px;
  background: transparent;
}

.dashboard {
  min-height: calc(100vh - 72px);
  font-family: Arial, sans-serif;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* content layout */
.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  padding: 40px;
}

/* sections */
.section h2 {
  margin-bottom: 20px;
  font-size: 22px;
  font-weight: 700;
}

.section-todo .card {
  width: 100%;
}

.section-timer .timer-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 35px;
  gap: 20px;
}

h2:hover {
  cursor: pointer;
}

/* cards */
.card {
  background: white;
  border-radius: 20px;
  padding: 20px 25px;
  margin-bottom: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.08);
}

.card:hover {
  cursor: pointer;
}

.image-card img {
  width: 100%;
  display: block;
  margin: 0 auto;
}

.timer-card img {
  width: 140px;
}

/* button */
.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 30px;
  background: #7a3cff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn:hover {
  background: #5e2fd1;
}

.footer {
  margin-top: auto;
  padding: 24px 0;
  background: #fff;
  border-top: 1px solid #E5E7EB;
}

.footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;

  font-size: 14px;
  color: #6B7280;
}

.footer a {
  color: #7C3AED;
  text-decoration: none;
  font-weight: 500;
  transition: color .2s ease;
}

.footer a:hover {
  color: #6D28D9;
}

.divider {
  width: 1px;
  height: 18px;
  background: #E5E7EB;
}

@media (max-width: 768px) {
  .footer-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .divider {
    display: none;
  }
}
</style>
