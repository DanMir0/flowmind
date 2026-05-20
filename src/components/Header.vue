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
      <router-link class="menu-item" to="/dashboard">Home</router-link>
      <router-link class="menu-item" to="/to-do-list">To-Do List</router-link>
      <router-link class="menu-item" to="/calendar">Calendar</router-link>
      <router-link class="menu-item" to="/timer">Timer</router-link>
      <router-link class="menu-item" to="/settings">Settings</router-link>
      <router-link class="menu-item" to="/archive">Arhive</router-link>
      <button class="menu-item" v-if="auth.user" @click="logout">Log out</button>

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

/* NAV */
.nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ITEM */
.menu-item {
  position: relative;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 12px 16px;
  border-radius: 14px;

  text-decoration: none;

  color: #6B7280;
  font-weight: 600;
  font-size: 14px;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* HOVER */
.menu-item:hover {
  background: #F5F3FF;
  color: #7C3AED;

  transform: translateY(-1px);
}

/* ACTIVE */
.menu-item.router-link-active {
  background: #F3E8FF;
  color: #7C3AED;

  box-shadow:
    inset 0 0 0 1px #E9D5FF,
    0 4px 12px rgba(124, 58, 237, 0.12);
}
</style>
