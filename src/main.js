import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router.js'
import './style.css'
import {Toaster} from 'vue-sonner'
import 'vue-sonner/style.css'
import '@/assets/themes.css'
import { supabase } from '@/services/supabase.js'
import {useAuthStore} from '@/store/auth.js'

const savedTheme = localStorage.getItem('theme')

if (savedTheme) {
  document.documentElement.setAttribute(
    'data-theme',
    savedTheme
  )
}
const app = createApp(App)
const pinia = createPinia()

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'USER_UPDATED' && session?.user) {
    const authStore = useAuthStore()

    authStore.setUser(session.user)

    authStore.fetchProfile().catch()
  }

  if (event === 'SIGNED_OUT') {
    const authStore = useAuthStore()

    authStore.user = null
    authStore.profile = null
  }
})

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState !== 'visible') {
    return
  }

  const authStore = useAuthStore()

  if (!authStore.user) {
    return
  }

  try {
    await authStore.refreshUser()
  } catch (error) {
    throw e
  }
})

app.use(pinia)
  .component('Toaster', Toaster)
  .use(router)
  .mount('#app')



