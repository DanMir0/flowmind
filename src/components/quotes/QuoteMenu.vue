<script setup>
import { useSubscriptionStore } from '@/store/subscription'

defineProps({
  open: Boolean
})

const emit = defineEmits([
  'close',
  'addQuote',
  'myQuotes',
  'pinQuote'
])

const subscriptionStore = useSubscriptionStore()

</script>

<template>

  <div
    v-if="open"
    class="sheet-overlay"
    @click="emit('close')"
  >

    <div
      class="sheet"
      @click.stop
    >

      <template v-if="subscriptionStore.isPro">

        <button
          class="sheet-item"
          @click="emit('addQuote')"
        >
          Add quote
        </button>

        <button
          class="sheet-item"
          @click="emit('myQuotes')"
        >
          My quotes
        </button>

        <button
          class="sheet-item"
          @click="emit('pinQuote')"
        >
          Pin this quote
        </button>

      </template>

      <template v-else>

        <button class="sheet-item pro">
          🔒 Unlock custom quotes
        </button>

      </template>

      <button
        class="sheet-cancel"
        @click="emit('close')"
      >
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

  z-index:100;
}

.sheet{
  width:100%;
  max-width:520px;

  background:white;

  border-radius:20px 20px 0 0;

  padding:20px;

  animation: slideUp .25s ease;
}

.sheet-item{
  width:100%;
  padding:16px;

  border:none;
  background:none;

  font-size:16px;

  cursor:pointer;

  text-align:left;
}

.sheet-item:hover{
  background:#f5f5fa;
  border-radius:10px;
}

.sheet-item.pro{
  color:#7b5cff;
  font-weight:500;
}

.sheet-cancel{
  width:100%;
  padding:16px;

  margin-top:10px;

  border:none;
  background:#f3f3f7;

  border-radius:12px;

  cursor:pointer;
}

@keyframes slideUp{
  from{
    transform:translateY(100%);
  }
  to{
    transform:translateY(0);
  }
}

</style>
