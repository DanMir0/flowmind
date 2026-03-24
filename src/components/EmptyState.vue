<script setup>
import filteredTaskImg from '@/assets/filteredTaskImg.png'
import allCompletedTaskImg from '@/assets/allCompletedTaskImg.png'
import noTaskImg from '@/assets/noTaskImg.png'
import { computed, ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    // 'no-tasks' | 'all-completed' | 'filtered'
  },
})
defineEmits(['add', 'showCompleted', 'resetFilters'])

const imageLoaded = ref(false)

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
        @load="imageLoaded = true"
        :alt="content.title"
        :class="{ loaded: imageLoaded }"/>
    </div>

    <h3 class="title">{{ content.title }}</h3>

    <p class="subtitle">{{ content.subtitle }}</p>

    <button
      v-if="content.action"
      class="empty-state-btn"
      @click="$emit(content.action)">
      <span class="btn-text">{{ content.actionLabel }}</span>
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
  justify-content: center;
  margin-bottom: 24px;
}

.illustration img {
  width: 180px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.illustration img.loaded {
  opacity: 1;
  transform: translateY(0);
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1f2937;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 28px;
  line-height: 1.5;
}

/* Button styles matching TaskCard */
.empty-state-btn {
  background: linear-gradient(145deg, #f5f3ff, #ede9fe);
  color: #6d4fa8;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  padding: 12px 28px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.empty-state-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(139, 92, 246, 0.3);
}

.empty-state-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.btn-text {
  display: inline-block;
  transition: transform 0.2s;
}

.empty-state-btn:hover .btn-text {
  transform: scale(1.02);
}

/* Ripple effect */
.empty-state-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(139, 92, 246, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.empty-state-btn:focus:not(:active)::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40);
  }
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

/* Responsive */
@media (max-width: 480px) {
  .empty-state {
    margin: 40px auto;
    padding: 0 20px;
  }

  .illustration img {
    width: 140px;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 14px;
  }

  .empty-state-btn {
    padding: 10px 24px;
    font-size: 13px;
  }
}
</style>
