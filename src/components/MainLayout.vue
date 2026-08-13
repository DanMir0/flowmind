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
  background: var(--bg-page);
}

.body {
  display: flex;
}

.content {
  background: var(--bg-page);
  flex: 1;
}
</style>
