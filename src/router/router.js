import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import Dashboard from '@/pages/Dashboard.vue'
import ToDoList from '@/pages/ToDoList.vue'
import Timer from '@/pages/Timer.vue'
import Calendar from '@/pages/Calendar.vue'
import ResetPassword from '@/pages/auth/ResetPassword.vue'
import ForgotPassword from '@/pages/auth/ForgotPassword.vue'
import CheckEmail from '@/pages/auth/CheckEmail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard', },
    { path: '/dashboard',  name: 'dashboard', component: Dashboard, },
    { path: '/login', name: 'login', component: Login, },
    { path: '/register', name: 'register', component: Register, },
    { path: '/to-do-list', name: 'todo', component: ToDoList, meta: {requiresAuth: true} },
    { path: '/timer', name: 'timer', component: Timer, meta: {requiresAuth: true}},
    { path: '/calendar', name: 'calendar', component: Calendar, meta: {requiresAuth: true}},
    { path: '/forgot-password', name: 'forgotPassword', component: ForgotPassword },
    { path: '/reset-password', name: 'resetPassword', component: ResetPassword },
    { path: '/check-email', name: 'checkEmail', component: CheckEmail },

  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    await auth.init()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }
})

export default router
