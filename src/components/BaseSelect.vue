<script>
import { ref } from 'vue'

export const activeSelect = ref(null)
</script>
<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'

const id = Symbol()
const props = defineProps({
  modelValue: [String, Number, Object],

  options: {
    type: Array,
    default: () => []
  },

  labelKey: {
    type: String,
    default: null // если объект
  },

  valueKey: {
    type: String,
    default: null
  },

  placeholder: {
    type: String,
    default: 'Select...'
  },

  searchable: {
    type: Boolean,
    default: true
  }
})

const isTyping = ref(false)
const emit = defineEmits(['update:modelValue'])

const open = computed(() => activeSelect.value === id)
const refEl = ref(null)

const search = ref('')
const debounced = ref('')

const hasValue = computed(() => {
  return (
    (props.modelValue !== null && props.modelValue !== '')
    ||
      search.value.length > 0
  )
})

function clear() {
  emit('update:modelValue', null)
  search.value = ''
  closeSelect()
}

/* ===== helpers ===== */

function openSelect() {
  activeSelect.value = id

  isTyping.value = false
}

function toggleSelect() {
  activeSelect.value =
    activeSelect.value === id ? null : id
}

function closeSelect() {
  if (activeSelect.value === id) {
    activeSelect.value = null
  }
}

function getLabel(option) {
  if (props.labelKey) return option[props.labelKey]
  return option
}

function getValue(option) {
  if (props.valueKey) return option[props.valueKey]
  return option
}

/* sync снаружи */
watch(() => props.modelValue, (val) => {
  if (!val) {
    search.value = ''
    return
  }

  if (props.labelKey) {
    const found = props.options.find(o => getValue(o) === val)
    search.value = found ? getLabel(found) : ''
  } else {
    search.value = val
  }
}, { immediate: true })

/* debounce */
let timer
watch(search, (val) => {
  isTyping.value = true

  clearTimeout(timer)
  timer = setTimeout(() => {
    debounced.value = val
  }, 250)
})

/* filter */
const filtered = computed(() => {
  if (!props.searchable) return props.options

  // 👉 если НЕ печатает — показываем всё
  if (!isTyping.value) return props.options

  if (!debounced.value) return props.options

  return props.options.filter(o =>
    getLabel(o).toLowerCase().includes(debounced.value.toLowerCase())
  )
})

function select(option) {
  emit('update:modelValue', getValue(option))
  search.value = getLabel(option)
  closeSelect()
}

/* click outside */
function onClickOutside(e) {
  if (!refEl.value?.contains(e.target)) {
    closeSelect()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div class="select" ref="refEl">
    <div class="select-trigger">
      <input
        :value="search"
        @input="e => search = e.target.value"
        :placeholder="placeholder"
        @focus="openSelect"
        :readonly="!searchable"
      />

      <span v-show="hasValue" class="clear" @click.stop="clear">✕</span>
      <span class="arrow" @click="toggleSelect" :class="{ open }">
        ▾
      </span>
    </div>

    <div v-if="open" class="select-menu">
      <div
        v-for="item in filtered"
        :key="getValue(item)"
        class="select-item"
        @click="select(item)"
      >
        {{ getLabel(item) }}
      </div>

      <div v-if="!filtered.length" class="empty">
        No results
      </div>
    </div>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  width: 100%;
}

.select-trigger {
  position: relative;
}

.select-trigger input {
  width: 100%;
  padding: 12px 40px 12px 14px;
  border-radius: 12px;
  border: 1px solid #ddd;
  outline: none;
}

.arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: 0.2s;
  cursor: pointer;
}

.arrow.open {
  transform: translateY(-50%) rotate(180deg);
}

.select-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;

  background: white;
  border: 1px solid #eee;
  border-radius: 12px;

  box-shadow: 0 10px 25px rgba(0,0,0,0.08);

  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
}

.select-item {
  padding: 10px 14px;
  cursor: pointer;
}

.select-item:hover {
  background: #f5f3ff;
}

.empty {
  padding: 14px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
}

.clear {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 14px;
  color: #9ca3af;
}

.clear:hover {
  color: #111827;
}
</style>
