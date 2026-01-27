<script setup>
import { useAuthStore } from '@/store/auth.js'
import Header from '@/components/Header.vue'
import { onMounted } from 'vue'

const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
  await auth.fetchProfile()
})

</script>

<template>
  <Header></Header>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
</style>
