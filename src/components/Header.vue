<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import router from '@/router/router'
import { useTasksStore } from '@/store/tasks.js'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/store/settings.js'
import NotificationsDropdown from '@/components/NotificationsDropdown.vue'

const auth = useAuthStore()
const settingsStore = useSettingsStore()
const tasksStore = useTasksStore()
const route = useRoute()

const isMobileSearchOpen = ref(false)
const isOpen = ref(false)

const username = computed(() => {
  return auth.profile?.username || 'User'
})

const email = computed(() => {
  return auth.user?.email || ''
})

const searchInput = ref('')

const mobileSearchInput = ref(null)

let timeout = null

const initials = computed(() => {
  return username.value
    .slice(0, 2)
    .toUpperCase()
})

const isDarkMode = computed({
  get: () => settingsStore.theme === 'dark',
  set: async (value) => {
    await settingsStore.changeTheme(value ? 'dark' : 'light')
  }
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

async function logout() {
  await auth.signOut()
  isOpen.value = false
  router.push({ name: 'login' })
}

function handleClickOutside(event) {
  const dropdown = document.querySelector('.profile-dropdown-wrapper')

  if (dropdown && !dropdown.contains(event.target)) {
    isOpen.value = false
  }
}

async function openMobileSearch() {
  isMobileSearchOpen.value = true

  await nextTick()

  mobileSearchInput.value?.focus()
}

function closeMobileSearch() {
  isMobileSearchOpen.value = false
}

function clearSearch() {
  searchInput.value = ''
}

function toggleMobileMenu() {
  window.dispatchEvent(
    new CustomEvent('toggle-mobile-sidebar')
  )
}

function openAddTask() {
  window.dispatchEvent(
    new CustomEvent('open-add-task')
  )
}

watch(searchInput, (value) => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    tasksStore.searchQuery = value.trim()
  }, 300)
})

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)

  clearTimeout(timeout)
})
</script>

<template>
  <header class="header">

    <div class="mobile-header-left">

      <button
        class="mobile-menu-btn"
        type="button"
        aria-label="Open menu"
        @click="toggleMobileMenu">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none">
          <path
            d="M4 6H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round" />

          <path
            d="M4 12H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round" />

          <path
            d="M4 18H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round" />
        </svg>
      </button>

      <span class="mobile-page-title">
        My Tasks
      </span>

    </div>

    <div class="header-left">

      <div class="logo">

        <svg
          width="34"
          height="34"
          viewBox="0 0 34 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect
            x="2"
            y="2"
            width="30"
            height="30"
            rx="8"
            stroke="#7C3AED"
            stroke-width="2.5"
            fill="none" />

          <path
            d="M10 17L15 23L25 11"
            stroke="#7C3AED"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none" />
        </svg>

        <span class="logo-text">
          FlowMind
        </span>

      </div>

    </div>

    <div
      v-if="route.name === 'todo'"
      class="search-container">

      <div class="search-wrapper desktop-search">

        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          fill="none">
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            stroke-width="2" />

          <path
            d="M20 20L17 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round" />
        </svg>

        <input
          v-model="searchInput"
          type="text"
          placeholder="Search tasks..."
          class="search-input" />

        <button
          v-if="searchInput"
          class="search-clear"
          type="button"
          aria-label="Clear search"
          @click="clearSearch">
          ×
        </button>
      </div>
    </div>

    <div
      v-if="route.name === 'todo'"
      class="mobile-header-actions">

      <!-- MOBILE SEARCH BUTTON -->

      <button
        class="mobile-search-btn"
        type="button"
        aria-label="Search tasks"
        @click="openMobileSearch">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none">
          <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            stroke-width="2" />

          <path
            d="M20 20L17 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <!-- ADD TASK -->
      <button
        class="mobile-add-btn"
        type="button"
        aria-label="Add task"
        @click="openAddTask">
        +
      </button>
    </div>

    <Transition name="mobile-search">
      <div
        v-if="isMobileSearchOpen && route.name === 'todo'"
        class="mobile-search-overlay">

        <div class="mobile-search-wrapper">

          <svg
            class="mobile-search-icon"
            viewBox="0 0 24 24"
            fill="none">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              stroke-width="2" />

            <path
              d="M20 20L17 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round" />
          </svg>

          <input
            ref="mobileSearchInput"
            v-model="searchInput"
            type="text"
            placeholder="Search tasks..."
            class="mobile-search-input" />

          <button
            v-if="searchInput"
            class="mobile-search-clear"
            type="button"
            aria-label="Clear search"
            @click="clearSearch">
            ×
          </button>

          <button
            class="mobile-search-close"
            type="button"
            aria-label="Close search"
            @click="closeMobileSearch">
            ×
          </button>

        </div>

      </div>

    </Transition>

    <div class="header-right">

      <!-- AUTHORIZED -->
      <template v-if="auth.user">

        <NotificationsDropdown />

        <div class="profile-dropdown-wrapper">

          <!-- PROFILE BUTTON -->
          <button
            class="profile-trigger"
            :class="{ active: isOpen }"
            type="button"
            @click.stop="toggleDropdown">

            <div class="avatar">
              {{ initials }}
            </div>

            <div class="profile-info">
              <div class="username">
                {{ username }}
              </div>
            </div>
            <svg
              class="arrow"
              :class="{ open: isOpen }"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

          </button>

          <!-- DROPDOWN -->
          <Transition name="dropdown">

            <div
              v-if="isOpen"
              class="dropdown-menu">

              <!-- USER -->
              <div class="dropdown-user">

                <div class="avatar large">
                  {{ initials }}
                </div>

                <div class="dropdown-user-info">

                  <div class="dropdown-name">
                    {{ username }}
                  </div>

                  <div class="dropdown-email">
                    {{ email }}
                  </div>
                </div>
              </div>
              <div class="dropdown-divider"></div>

              <!-- SETTINGS -->
              <router-link
                :to="{ name: 'settings' }"
                class="dropdown-item"
                @click="isOpen = false">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 16C14.7091 16 16.5 14.2091 16.5 12C16.5 9.79086 14.7091 8 12.5 8C10.2909 8 8.5 9.79086 8.5 12C8.5 14.2091 10.2909 16 12.5 16Z"
                    fill="white"
                    stroke="#000000"
                    stroke-width="0.8"
                  />
                </svg>

                <span>
                  Settings
                </span>

              </router-link>

              <!-- APPEARANCE -->
              <button
                class="dropdown-item appearance-item"
                type="button">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88299 19.5345 5.67423 18.3258C4.46548 17.117 3.62592 15.589 3.2539 13.9205C2.88188 12.252 2.99268 10.512 3.57346 8.9043C4.15424 7.29651 5.18082 5.88733 6.53323 4.84171C7.88563 3.79609 9.50779 3.15732 11.21 3C10.2134 4.34827 9.73384 6.00945 9.85853 7.68141C9.98323 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>

                <span class="menu-label">
                  {{ isDarkMode ? 'Dark mode' : 'Light mode' }}
                </span>

                <label class="switch">
                  <input
                    v-model="isDarkMode"
                    type="checkbox">
                  <span class="slider"></span>
                </label>

              </button>

              <div class="dropdown-divider"></div>

              <!-- LOGOUT -->
              <button
                class="dropdown-item logout"
                type="button"
                @click="logout">

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="#DC2626"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round">
                  <polyline points="14 7 14 2 2 2 2 22 14 22 14 17"></polyline>
                  <line
                    x1="10"
                    y1="12"
                    x2="22"
                    y2="12"
                  ></line>
                  <polyline points="18 8 22 12 18 16"></polyline>
                </svg>

                <span>
                  Log out
                </span>
              </button>
            </div>
          </Transition>
        </div>
      </template>

      <!-- GUEST -->
      <template v-else>

        <router-link
          :to="{ name: 'login' }"
          class="auth-btn secondary">
          Sign in
        </router-link>

        <router-link
          :to="{ name: 'register' }"
          class="auth-btn primary">
          Sign up
        </router-link>

      </template>

    </div>

  </header>
</template>

<style scoped>

.header {
  width: 100%;
  height: 72px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.mobile-header-left,
.mobile-header-actions,
.mobile-search-overlay {
  display: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.search-container {
  display: flex;
  align-items: center;
}

.search-wrapper {
  width: 420px;
  height: 44px;
  background: var(--quick-input-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 14px 0 16px;
  gap: 10px;
  transition: border-color 0.2s ease,
  box-shadow 0.2s ease;
}

.search-wrapper:focus-within {
  border-color: var(--premium-bg);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25),
  0 0 20px rgba(124, 58, 237, 0.1);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #9CA3AF;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
  min-width: 0;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-clear {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-grey);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.search-clear:hover {
  color: var(--text);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.profile-dropdown-wrapper {
  position: relative;
}

.profile-trigger {
  height: 52px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s ease,
  transform 0.15s ease;
}

.profile-trigger:hover {
  background: var(--menu-hover);
}

.profile-trigger.active {
  background: var(--bg-purple-light);
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
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar.large {
  width: 52px;
  height: 52px;
  font-size: 18px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.15;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.arrow {
  color: var(--text-grey);
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08),
  0 2px 6px rgba(0, 0, 0, 0.04);
  padding: 8px;
  z-index: 500;
}

.dropdown-menu::before {
  content: '';
  position: absolute;
  top: -7px;
  right: 20px;
  width: 14px;
  height: 14px;
  background: var(--bg);
  border-left: 1px solid var(--border);
  border-top: 1px solid var(--border);
  transform: rotate(45deg);
  z-index: -1;
}

.dropdown-user {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
}

.dropdown-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dropdown-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.dropdown-email {
  font-size: 13px;
  color: var(--text-grey);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: var(--quick-input-focus-bg);
  margin: 10px 0;
}

.dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  text-decoration: none;
  color: var(--menu-item-color);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s ease,
  color 0.2s ease;
  box-sizing: border-box;
}

.dropdown-item:hover {
  background: var(--menu-hover);
  color: var(--menu-item-color);
}

.appearance-item {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 12px 14px;
  cursor: pointer;
  font-size: 14px;
  color: var(--menu-item-color);
}

.appearance-item:hover {
  background: var(--menu-hover);
}

.menu-label {
  flex: 1;
  text-align: left;
}

.switch {
  position: relative;
  width: 52px;
  height: 24px;
  flex-shrink: 0;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  inset: 0;
  background: #e5e5ea;
  border-radius: 999px;
  transition: 0.25s;
}

.slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  top: 2px;
  background: var(--bg);
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: 0.25s;
}

.switch input:checked + .slider {
  background: var(--premium-bg);
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}

.logout {
  color: var(--text-red);
}

.logout:hover {
  background: var(--menu-hover);
  color: var(--text-red);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease,
  transform 0.18s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.auth-btn {
  text-decoration: none;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  transition: 0.2s;
}

.auth-btn.secondary {
  color: var(--text-grey);
}

.auth-btn.secondary:hover {
  background: var(--quick-input-focus-bg);
}

.auth-btn.primary {
  background: var(--premium-bg);
  color: var(--bg);
}

.auth-btn.primary:hover {
  background: var(--dark-purple);
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {

  .header {
    height: 56px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
  }


  /* HIDE DESKTOP */
  .header-left {
    display: none;
  }

  .search-container {
    display: none;
  }

  .mobile-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .mobile-menu-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .mobile-menu-btn:active {
    background: var(--quick-input-focus-bg);
  }

  .mobile-page-title {
    font-size: 17px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mobile-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .mobile-search-btn {
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .mobile-search-btn:active {
    background: var(--quick-input-focus-bg);
  }

  .mobile-add-btn {
    width: 34px;
    height: 34px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--premium-bg);
    color: white;
    font-size: 25px;
    font-weight: 300;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(124, 58, 237, 0.25);
  }

  .mobile-add-btn:active {
    transform: scale(0.94);
  }

  .mobile-search-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    z-index: 1000;
  }

  .mobile-search-wrapper {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px 0 12px;
    background: var(--quick-input-bg);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-sizing: border-box;
  }

  .mobile-search-wrapper:focus-within {
    border-color: var(--premium-bg);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }

  .mobile-search-icon {
    width: 18px;
    height: 18px;
    color: #9CA3AF;
    flex-shrink: 0;
  }

  .mobile-search-input {
    flex: 1;
    width: 100%;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text);
    font-size: 14px;
  }

  .mobile-search-input::placeholder {
    color: #9CA3AF;
  }

  .mobile-search-clear,
  .mobile-search-close {
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .mobile-search-clear {
    color: var(--text-grey);
    font-size: 20px;
  }

  .mobile-search-close {
    color: var(--text);
    font-size: 22px;
  }

  .mobile-search-clear:hover,
  .mobile-search-close:hover {
    color: var(--premium-bg);
  }

  .mobile-search-enter-active,
  .mobile-search-leave-active {
    transition: opacity 0.18s ease,
    transform 0.18s ease;
  }

  .mobile-search-enter-from,
  .mobile-search-leave-to {
    opacity: 0;
    transform: translateY(-8px);
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .profile-trigger {
    gap: 8px;
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (min-width: 768px) and (max-width: 1024px) {

  .header {
    padding: 0 20px;
    height: 64px;
  }

  .logo-text {
    font-size: 18px;
  }

  .search-wrapper {
    width: 280px;
    height: 40px;
  }

  .profile-trigger {
    height: 44px;

    padding: 4px 10px;

    gap: 8px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .username {
    font-size: 13px;
  }

  .dropdown-menu {
    width: 260px;
  }

}
</style>
