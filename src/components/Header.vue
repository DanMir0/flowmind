<script setup>
import { useAuthStore } from '@/store/auth.js'
import router from '@/router/router.js'
const auth = useAuthStore()

async function logout() {
  await auth.signOut()
  await router.push('/login')
}
</script>

<template>
  <header class="header">
    <div class="logo">
      <span class="icon">☰</span>
      <h1>TaskMaster 2026</h1>
    </div>

    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/to-do-list">To-Do List</router-link>
      <router-link to="/calendar">Calendar</router-link>
      <router-link to="/timer">Timer</router-link>
      <router-link to="/settings">Settings</router-link>
      <button v-if="auth.user" @click="logout">Log out</button>

      <template v-else>
        <router-link to="/login">Sign in</router-link>
        <router-link to="/register">Sign up</router-link>
      </template>
    </nav>

  </header>

</template>

<style scoped>
/* header */
.header {
  display: flex;
  justify-content: space-between;
  padding: 20px 40px;
  background: white;
  border-bottom: 1px solid #eee;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 22px;
}

.logo h1 {
  font-size: 22px;
  font-weight: 700;
}

.nav {
  display: flex;
  align-items: center;
  gap: 25px;
}

.nav a {
  text-decoration: none;
  color: black;
  font-weight: 500;
}

.nav a:hover {
  color: #7a3cff;
}
button {
  position: relative;
  z-index: 80;
}
</style>
