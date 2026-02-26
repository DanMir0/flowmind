<script setup>
import router from '@/router/router.js'
import { useAuthStore } from '@/store/auth.js'
import { ref, watch } from 'vue'
import { useTasksStore } from '@/store/tasks.js'

const defaultTasks = ref([
  { id: 0, title: 'Finish project report', deadline: 'Deadline: 25th Oct 2026' },
  { id: 1, title: 'Prepare presentation', deadline: 'Deadline: 27th Oct 2026' },
  { id: 2, title: 'Team meeting', deadline: 'Deadline: 28th Oct 2026' }
])

const auth = useAuthStore()
const tasksStore = useTasksStore()

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
          <div v-else-if="tasksStore.tasks.length">
            <div
              v-for="card in tasksStore.tasks"
              :key="card.id"
              class="card"
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
      <p>
        © 2026 TaskMaster. All rights reserved. |
        <a href="#">Privacy Policy</a> |
        <a href="#">Terms of Service</a>
      </p>
    </footer>

  </div>
</template>

<style scoped>
.placeholder {
  height: 90px;
  background: transparent;
}

.dashboard {
  font-family: Arial, sans-serif;
  background: #fff;
}

/* content layout */
.content {
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

/* footer */
.footer {
  margin-top: 60px;
  text-align: center;
  padding: 30px;
  background: #f5eaff;
  color: #333;
}

.footer a {
  color: #7a3cff;
  text-decoration: none;
}
</style>
