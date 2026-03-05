import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/router.js'
import './style.css'
import {Toaster} from 'vue-sonner'
import 'vue-sonner/style.css'
import { useSettingsStore } from '@/store/settings.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
  .component('Toaster', Toaster)
  .use(router)
  .mount('#app')


const settingStore = useSettingsStore()
settingStore.loadFromStorage()
