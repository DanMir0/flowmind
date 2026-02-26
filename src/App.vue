<script setup>
import { useAuthStore } from '@/store/auth.js'
import Header from '@/components/Header.vue'
import { onMounted } from 'vue'
import {useTasksStore} from '@/store/tasks.js'

const taskStore = useTasksStore()
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
  await auth.fetchProfile()
  await taskStore.initTasks()
})

</script>

<template>
  <Header></Header>
  <router-view />
  <Toaster position="top-center" theme="dark" :duration="3000"/>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
</style>
