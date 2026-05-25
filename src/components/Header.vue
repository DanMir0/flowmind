<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()

const initials = computed(() => {
  const name =
    auth.profile?.username ||
    auth.user?.email ||
    'U'

  return name
    .slice(0, 2)
    .toUpperCase()
})
</script>

<template>
  <header class="header">

    <!-- LEFT: Logo + JD -->
    <div class="header-left">
      <div class="logo">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Квадратная рамка фиолетового цвета -->
          <rect x="2" y="2" width="30" height="30" rx="8" stroke="#7C3AED" stroke-width="2.5" fill="none" />

          <!-- Фиолетовая галочка внутри -->
          <path d="M10 17L15 23L25 11" stroke="#7C3AED" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
        <span class="logo-text">
          TaskMaster 2026
        </span>
      </div>

    </div>

    <!-- CENTER: Search -->
    <div class="search-wrapper">
      <svg
        class="search-icon"
        viewBox="0 0 24 24"
        fill="none">
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          stroke-width="2"
        />
        <path
          d="M20 20L17 17"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>

      <input
        type="text"
        placeholder="Search tasks..."
        class="search-input"
      />
    </div>

    <!-- RIGHT: Notifications + Avatar -->
    <div class="header-right">
      <button class="notification-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="profile">
        <div class="avatar">
          {{ initials }}
        </div>
      </div>
    </div>

  </header>
</template>

<style scoped>
.header {
  height: 72px;
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* LEFT */
.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #7C3AED;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

/* JD badge — как на картинке */
.jd-badge {
  background: #F3F4F6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  letter-spacing: 0.5px;
}

/* SEARCH — упрощенный, без ⌘K */
.search-wrapper {
  width: 420px;
  height: 44px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  transition: all 0.2s ease;
}

.search-wrapper:focus-within {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #9CA3AF;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
}

.search-input::placeholder {
  color: #9CA3AF;
}

/* RIGHT */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Кнопка уведомлений как на картинке */
.notification-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: #F3F4F6;
  color: #4B5563;
}

.profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #F3E8FF;
  color: #7C3AED;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.1s ease;
}

.profile:hover .avatar {
  transform: scale(0.98);
  background: #EDE5FF;
}
</style>
