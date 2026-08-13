<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  priority: {
    type: [String, Number],
    default: 'all'
  },
  status: {
    type: String,
    default: 'all'
  }
})

const emit = defineEmits(['update:priority', 'update:status'])

const modelPriority = ref(props.priority)
const modelStatus = ref(props.status)

// Следим за изменением props извне
watch(() => props.priority, (newVal) => {
  modelPriority.value = newVal
})

watch(() => props.status, (newVal) => {
  modelStatus.value = newVal
})

// Методы обновления
function updatePriority(value) {
  modelPriority.value = value
  emit('update:priority', value)
}

function updateStatus(value) {
  modelStatus.value = value
  emit('update:status', value)
}

// Фильтры
const priorityFilters = [
  { label: 'All', value: 'all' },
  { label: 'High', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Low', value: 3 }
]

const statusFilters = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'All', value: 'all' }
]
</script>

<template>
  <div class="mobile-filters">
    <!-- Фильтры по приоритету -->
    <div class="filter-row">
      <button
        v-for="filter in priorityFilters"
        :key="filter.value"
        class="filter-chip"
        :class="{ active: modelPriority === filter.value }"
        @click="updatePriority(filter.value)">
        {{ filter.label }}
      </button>
    </div>

    <!-- Фильтры по статусу -->
    <div class="filter-row">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        class="filter-chip status"
        :class="{ active: modelStatus === filter.value }"
        @click="updateStatus(filter.value)">
        {{ filter.label }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.mobile-filters {
  display: none;
  padding: 12px 16px;
  gap: 8px;
  flex-direction: column;
  background: var(--bg, #ffffff);
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.filter-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 6px 14px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 20px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-grey, #64748b);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-chip:hover {
  background: var(--quick-input-bg, #f1f5f9);
}

.filter-chip.active {
  background: var(--bg-purple-light, #f3e8ff);
  border-color: var(--menu-link, #7c3aed);
  color: var(--menu-link, #7c3aed);
}

.filter-chip.status.active {
  background: var(--premium-bg, #7c3aed);
  border-color: var(--premium-bg, #7c3aed);
  color: white;
}

@media (max-width: 767px) {
  .mobile-filters {
    display: flex;
  }
}
</style>
