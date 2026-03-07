<script setup>
defineProps({
  open: Boolean
})

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="open" class="sheet-overlay" @click="emit('close')">

    <div class="sheet" @click.stop>

      <button class="sheet-item">
        Add quote
      </button>

      <button class="sheet-item">
        My quotes
      </button>

      <button class="sheet-item">
        Pin this quote
      </button>

      <button class="sheet-cancel" @click="emit('close')">
        Cancel
      </button>

    </div>

  </div>
</template>

<style scoped>
.sheet-overlay{
  position: fixed;
  inset:0;
  background: rgba(0,0,0,0.25);

  display:flex;
  align-items:flex-end;
  justify-content:center;
}

.sheet{
  width:100%;
  max-width:520px;

  background:white;
  border-radius:20px 20px 0 0;

  padding:20px;
}

.sheet-item{
  width:100%;
  padding:16px;

  border:none;
  background:none;

  font-size:16px;
  cursor:pointer;
}

.sheet-cancel{
  width:100%;
  padding:16px;

  margin-top:10px;

  border:none;
  background:#f3f3f7;
  border-radius:12px;
}
</style>
