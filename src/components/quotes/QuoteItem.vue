<script setup>

defineProps({
  quote: Object
})

const emit = defineEmits([
  'pin',
  'delete'
])

</script>

<template>

  <div class="quote-card">

    <div class="text">
      "{{ quote.text }}"
    </div>

    <div class="author">
      — {{ quote.author || 'Unknown' }}
    </div>

    <div class="actions">

      <button
        class="pin"
        @click="emit('pin', quote.id)">
        {{ quote.is_pinned ? '📌 Pinned' : '📌 Pin' }}
      </button>

      <button
        class="delete"
        @click="emit('delete', quote.id)">
        🗑 Delete
      </button>

    </div>

  </div>

</template>

<style scoped>

.quote-card{
  background:white;
  border-radius:16px;
  padding:20px;
  box-shadow:0 10px 25px rgba(0,0,0,0.05);
  margin-bottom:16px;
}

.text{
  font-size:16px;
  color:#5f5f6a;
}

.author{
  margin-top:6px;
  color:#8a8a98;
}

.actions{
  margin-top:12px;
  display:flex;
  gap:10px;
}

button{
  border:none;
  padding:8px 12px;
  border-radius:8px;
  cursor:pointer;
}

.pin{
  background:#f3f3ff;
}

.delete{
  background:#ffecec;
}

</style>
