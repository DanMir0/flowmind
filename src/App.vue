<script setup>
import { useAuthStore } from '@/store/auth.js'
import { onMounted, watch } from 'vue'
import {useTasksStore} from '@/store/tasks.js'
import MainLayout from '@/components/MainLayout.vue'

const taskStore = useTasksStore()
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
  await auth.fetchProfile()
  await taskStore.initTasks()
  await taskStore.initRealtime()
})

watch(
  () => auth.user?.id,
  async (userId) => {
    if (!userId) {
      taskStore.reset()
      return
    }

    await taskStore.initTasks()
  },
  { immediate: true }
)
</script>

<template>
  <MainLayout/>
  <Toaster position="top-center" theme="dark" :duration="3000"/>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

.sonner-toast {
  z-index: 99999 !important;
}
</style>
