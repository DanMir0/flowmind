<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue'

import { useNotificationsStore }
  from '@/store/notifications.js'

const notificationsStore =
  useNotificationsStore()

const isOpen = ref(false)
const notificationsRef = ref(null)

const notifications = computed(
  () => notificationsStore.notifications
)

const unreadCount = computed(
  () => notificationsStore.unreadCount
)

const loading = computed(
  () => notificationsStore.loading
)

async function toggleNotifications() {
  isOpen.value = !isOpen.value

  if (isOpen.value) {
    await notificationsStore.loadNotifications()
  }
}

async function markAsRead(id) {
  try {
    await notificationsStore.markAsRead(id)
  } catch (error) {
    console.error(
      'Failed to mark notification as read:',
      error
    )
  }
}

async function markAllAsRead() {
  try {
    await notificationsStore.markAllAsRead()
  } catch (error) {
    console.error(
      'Failed to mark all notifications as read:',
      error
    )
  }
}

function getIcon(type) {
  const icons = {
    task_reminder: '📋',
    morning_motivation: '🌅',
    subscription_expiry: '⚠️',
  }

  return icons[type] || '🔔'
}

function formatTime(date) {
  const diff =
    Date.now() -
    new Date(date).getTime()

  const minutes =
    Math.floor(diff / 60000)

  const hours =
    Math.floor(diff / 3600000)

  const days =
    Math.floor(diff / 86400000)

  if (minutes < 1) {
    return 'Только что'
  }

  if (minutes < 60) {
    return `${minutes} м назад`
  }

  if (hours < 24) {
    return `${hours} ч назад`
  }

  if (days < 7) {
    return `${days} д назад`
  }

  return new Date(date)
    .toLocaleDateString('ru-RU')
}

function handleClickOutside(event) {
  if (
    notificationsRef.value &&
    !notificationsRef.value.contains(
      event.target
    )
  ) {
    isOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener(
    'click',
    handleClickOutside
  )

  await notificationsStore.loadNotifications()

  notificationsStore.subscribeToRealtime()
})

onUnmounted(() => {
  document.removeEventListener(
    'click',
    handleClickOutside
  )

  notificationsStore.unsubscribeFromRealtime()
})
</script>
<template>
  <div class="notifications-wrapper" ref="notificationsRef">
    <!-- Кнопка уведомлений -->
    <button
      class="notification-btn"
      @click="toggleNotifications"
      :class="{ active: isOpen }"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
        <path
          d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
          stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" />
      </svg>

      <!-- Бейдж с количеством -->
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Выпадающее меню -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="notifications-dropdown">
        <div class="dropdown-header">
          <h3>Уведомления</h3>
          <button
            v-if="unreadCount > 0"
            class="mark-all-read"
            @click="markAllAsRead"
          >
            Отметить все
          </button>
        </div>

        <div class="dropdown-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Загрузка...</p>
          </div>

          <div v-else-if="notifications.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="#94a3b8" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                stroke="#94a3b8" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <p>У вас нет уведомлений</p>
            <span>Все будет хорошо 😊</span>
          </div>

          <div v-else class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-icon">
                {{ getIcon(notification.type) }}
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
              </div>
              <div v-if="!notification.read" class="unread-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notifications-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.notification-btn.active {
  background: #f1f5f9;
  color: #0f172a;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 2;
}

/* Dropdown */
.notifications-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.mark-all-read {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.mark-all-read:hover {
  background: #eef2ff;
}

.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-state svg {
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: #64748b;
}

.empty-state span {
  font-size: 14px;
}

.notifications-list {
  padding: 4px 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item.unread {
  background: #f8fafc;
}

.notification-item.unread:hover {
  background: #f1f5f9;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.notification-message {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  word-wrap: break-word;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #4f46e5;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

/* Анимация */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

/* Scrollbar */
.dropdown-body::-webkit-scrollbar {
  width: 4px;
}

.dropdown-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.dropdown-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

@media (max-width: 640px) {
  .notifications-dropdown {
    width: calc(100vw - 32px);
    right: -8px;
  }
}

/* Темная тема */
[data-theme="dark"] .notifications-dropdown {
  background: #1e293b;
  border-color: #334155;
}

[data-theme="dark"] .dropdown-header {
  background: #0f172a;
  border-color: #334155;
}

[data-theme="dark"] .dropdown-header h3 {
  color: #f1f5f9;
}

[data-theme="dark"] .notification-item:hover {
  background: #1e293b;
}

[data-theme="dark"] .notification-item.unread {
  background: #1e293b;
}

[data-theme="dark"] .notification-item.unread:hover {
  background: #0f172a;
}

[data-theme="dark"] .notification-title {
  color: #f1f5f9;
}

[data-theme="dark"] .notification-message {
  color: #cbd5e1;
}

[data-theme="dark"] .badge {
  background: #ef4444;
}







.dev-tools {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  z-index: 9999;
  background: rgba(0,0,0,0.8);
  padding: 12px;
  border-radius: 12px;
}

.dev-tools button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.dev-tools button:hover {
  background: #4338ca;
}
</style>
