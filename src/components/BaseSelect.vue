<script>
import { ref } from 'vue'

export const activeSelect = ref(null)
</script>
<script setup>
import { computed, watch, onMounted, onUnmounted, useSlots } from 'vue'

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

const slots = useSlots()

const hasIconSlot = computed(() => {
  return !!slots.icon
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
      <slot name="icon" />

      <input
        :value="search"
        @input="e => search = e.target.value"
        :placeholder="placeholder"
        @focus="openSelect"
        :readonly="!searchable"
        :style="{
            paddingLeft: hasIconSlot ? '30px' : '14px'
          }"
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

.select-trigger svg {
  flex-shrink: 0;
  position: absolute;
  top: 16px;
  left: 10px;
}

.select-trigger input {
  width: 100%;
  color: var(--text);
  padding: 12px 40px 12px 0;
  border-radius: 12px;
  border: 1px solid var(--border);
  outline: none;
  background: var(--quick-input-bg);
}

.select-trigger input:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
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
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
  color: var(--text);
}

.select-item {
  padding: 10px 14px;
  color: var(--text);
  cursor: pointer;
}

.select-item:hover {
  background: var(--menu-hover);
}

.empty {
  padding: 14px;
  font-size: 13px;
  color: var(--text-grey);
  text-align: center;
}

.clear {
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-grey);
}

.clear:hover {
  color: var(--text);
}

</style>
