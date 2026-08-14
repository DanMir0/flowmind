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
import Arhive from '@/pages/Arhive.vue'
import MyQuotes from '@/pages/MyQuotes.vue'
import Settings from '@/pages/Settings.vue'
import NotFound from '@/pages/NotFound.vue'
import AuthCallback from '@/pages/auth/AuthCallback.vue'
import PrivacyPolicy from '@/components/PrivacyPolicy.vue'
import TermsOfService from '@/components/TermsOfService.vue'
import EmailConfirmed from '@/pages/auth/EmailConfirmed.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard', },
    { path: '/dashboard',  name: 'dashboard', component: Dashboard, },
    { path: '/auth/login', name: 'login', component: Login, },
    { path: '/auth/register', name: 'register', component: Register, },
    { path: '/to-do-list', name: 'todo', component: ToDoList, meta: {requiresAuth: true} },
    { path: '/timer', name: 'timer', component: Timer, meta: {requiresAuth: true}},
    { path: '/calendar', name: 'calendar', component: Calendar, meta: {requiresAuth: true}},
    { path: '/auth/forgot-password', name: 'forgotPassword', component: ForgotPassword },
    { path: '/auth/reset-password', name: 'resetPassword', component: ResetPassword },
    { path: '/auth/check-email', name: 'checkEmail', component: CheckEmail },
    // { path: '/archive', name: 'archive', component: Arhive, meta: {requiresAuth: true}},
    { path: '/my-quotes', name: 'myQuotes', component: MyQuotes, meta: {requiresAuth: true}},
    { path: '/settings', name: 'settings', component: Settings, meta: {requiresAuth: true}},
    { path: '/auth/callback', name: 'callback', component: AuthCallback, },
    { path: '/:pathMatch(.*)', name: 'NotFound', component: NotFound, },
    { path: '/privacy-policy', name: 'privacyPolicy', component: PrivacyPolicy, },
    { path: '/terms-of-service', name: 'termsOfService', component: TermsOfService, },
    { path: '/auth/email-confirmed', name: 'emailConfirmed', component: EmailConfirmed, },
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

  if (to.meta.guestOnly && auth.user) {
    return { name: 'dashboard' }
  }
})

export default router
