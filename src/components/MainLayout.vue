<script setup>
import Header from '@/components/Header.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>

<template>
  <div class="layout">

    <Header />

    <div class="body">

      <AppSidebar />

      <main class="content">
        <router-view />
      </main>

    </div>

  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: #fafafa;
}

.body {
  display: flex;
}

.content {
  flex: 1;
}
</style>
