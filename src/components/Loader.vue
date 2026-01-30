<script setup>
defineProps({
  visible: Boolean
})
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="global-loader">
      <div class="spinner" />
    </div>
  </teleport>
</template>

<style scoped>
.global-loader {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.spinner {
  width: 46px;
  height: 46px;
  border: 4px solid rgba(0, 0, 0, 0.15);
  border-top-color: #7a3cff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
