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

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'USER_UPDATED') {
    const authStore = useAuthStore()

    authStore.user = session.user
    await authStore.fetchProfile()
  }
})

app.use(pinia)
  .component('Toaster', Toaster)
  .use(router)
  .mount('#app')



