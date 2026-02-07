<script setup>
import filteredTaskImg from '@/assets/filteredTaskImg.png'
import allCompletedTaskImg from '@/assets/allCompletedTaskImg.png'
import noTaskImg from '@/assets/noTaskImg.png'
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    // 'no-tasks' | 'all-completed' | 'filtered'
  },
})
defineEmits(['add', 'showCompleted', 'resetFilters'])

const contentMap = {
  'no-tasks': {
    image: noTaskImg,
    title: 'No tasks yet',
    subtitle: 'Create your first task to get started',
    action: 'add',
    actionLabel: 'Add Task',
  },
  'all-completed': {
    image: allCompletedTaskImg,
    title: 'All tasks completed!',
    subtitle: 'Great job! You’ve finished everything.',
    action: 'showCompleted',
    actionLabel: 'View completed',
  },
  filtered: {
    image: filteredTaskImg,
    title: 'No tasks found',
    subtitle: 'Try changing filters or sorting',
    action: 'resetFilters',
    actionLabel: 'Reset filters',
  },
}

const content = computed(() => contentMap[props.type])
</script>

<template>
  <div v-if="content" class="empty-state">
    <div class="illustration">
      <img
        :src="content.image"
        :alt="content.title" />
    </div>

    <h3 class="title">{{ content.title }}</h3>

    <p class="subtitle">{{ content.subtitle }}</p>

    <button
      v-if="content.action"
      class="primary-btn"
      @click="$emit(content.action)">
      {{ content.actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  margin: 80px auto;
  max-width: 420px;
  text-align: center;
  color: #555;
  animation: fadeIn 0.25s ease;
}

.illustration {
  display: flex;
  margin-bottom: 16px;
  justify-content: center;
}

.illustration img {
  width: 180px;
  max-width: 100%;
  opacity: 0.95;
}

.title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 15px;
  opacity: 0.8;
  margin-bottom: 20px;
}

.primary-btn {
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: #7a3cff;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:hover {
  background: #5e2fd1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
