<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    // 'no-tasks' | 'all-completed' | 'filtered'
  },
})

const contentMap = {
  'no-tasks': {
    emoji: '🗂️',
    title: 'No tasks yet',
    subtitle: 'Create your first task to get started',
    action: 'add',
    actionLabel: 'Add Task',
  },
  'all-completed': {
    emoji: '🎉',
    title: 'All tasks completed!',
    subtitle: 'Great job! You’ve finished everything.',
    action: 'showCompleted',
    actionLabel: 'View completed',
  },
  filtered: {
    emoji: '🔍',
    title: 'No tasks found',
    subtitle: 'Try changing filters or sorting',
    action: 'resetFilters',
    actionLabel: 'Reset filters',
  },
}
</script>

<template>
  <div class="empty-state">
    <div class="emoji">{{ contentMap[type].emoji }}</div>

    <h3 class="title">
      {{ contentMap[type].title }}
    </h3>

    <p class="subtitle">
      {{ contentMap[type].subtitle }}
    </p>

    <button
      v-if="contentMap[type].action"
      class="primary-btn"
      @click="$emit(contentMap[type].action)"
    >
      {{ contentMap[type].actionLabel }}
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

.emoji {
  font-size: 64px;
  margin-bottom: 12px;
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
