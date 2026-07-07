<script setup>

import { computed, ref } from 'vue'

const props = defineProps({
  quote: Object
})

const emit = defineEmits([
  'pin',
  'delete'
])

const expanded = ref(false)

const isLong = computed(() => props.quote.text.length > 180)
</script>

<template>
  <div class="quote-card">
    <div class="left">
      <div class="quote-icon">
        <svg width="20" height="20" viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M82.326,147.33c4.284-26.928,37.944-55.692,64.26-56.304c1.836,0,3.672-0.612,4.896-1.836
    c1.224-0.612,2.448-1.224,3.06-3.06c9.18-17.136,4.284-30.6-11.016-41.616c-17.748-12.852-45.9,0-59.976,11.628
    C38.054,85.518,1.946,136.313,3.782,184.662c-6.12,32.437-4.896,67.32,4.284,96.084c6.12,18.36,23.868,27.54,42.228,28.764
    c18.36,1.225,56.304,6.732,72.828-4.283c16.524-11.017,17.748-32.437,19.584-50.796c1.836-20.196,7.344-58.141-9.792-74.053
    C115.778,165.078,66.818,181.602,72.326,147.33z" fill="#7C3AED"/>
          <path d="M284.286,147.33c4.284-26.928,37.943-55.692,64.26-56.304c1.836,0,3.672-0.612,4.896-1.836
    c1.225-0.612,2.448-1.224,3.061-3.06c9.18-17.136,4.284-30.6-11.016-41.616c-17.748-12.852-45.9,0-59.977,11.628
    c-35.496,29.376-71.604,80.172-69.768,128.52c-6.12,32.437-4.896,67.32,4.283,96.084c6.12,18.36,23.868,27.54,42.229,28.764
    c18.36,1.225,56.304,6.732,72.828-4.283c16.523-11.017,17.748-32.437,19.584-50.796c1.836-20.196,7.344-58.141-9.792-74.053
    C317.738,165.078,268.166,181.602,274.286,147.33z" fill="#7C3AED"/>
        </svg>
      </div>
      <div>
        <div
          class="text"
          :class="{ expanded }">
          {{ quote.text }}
        </div>

        <button
          v-if="isLong"
          class="read-more"
          @click="expanded = !expanded">
          {{ expanded ? 'Show less' : 'Read more' }}
        </button>
        <div class="author">
          — {{ quote.author || 'Unknown' }}
        </div>
      </div>
    </div>

    <div class="actions">

      <button
        class="pin-btn"
        :class="{ active: quote.is_pinned }"
        @click="emit('pin', quote.id)">
        <span v-if="quote.is_pinned" class="pin-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 12L9 17L20 6" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span v-else class="pin-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="none" stroke="#8B5CF6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 4v6l-2 4v2h10v-2l-2-4V4m-3 12v5M8 4h8"/>
          </svg>
        </span>
        <span>{{ quote.is_pinned ? 'Pinned' : 'Pin' }}</span>
      </button>

      <button class="icon-btn">
       <span>
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd"
                d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z"
                fill="#080341" />
        </svg>
       </span>
      </button>

      <button
        class="icon-btn danger"
        @click="emit('delete', quote.id)">
        <span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="#EF4444"
                  stroke-width="1.5" stroke-linecap="round" />
            <path d="M19 6L18 19C17.9 20.1 17 21 15.9 21H8.1C7 21 6.1 20.1 6 19L5 6"
                  stroke="#EF4444"
                  stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 10V17" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
            <path d="M14 10V17" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </button>

    </div>

  </div>
</template>

<style scoped>
.quote-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 34px;
  margin-bottom: 22px;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(30, 30, 30, .06);
  transition: .25s;
  gap: 20px;
  min-height:160px;
}

.quote-card:hover {
  transform: translateY(-2px);
}

.left {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  flex: 1;
  min-width:0;
}

.quote-icon {
  color: #7C3AED;
  font-size: 34px;
  font-weight: bold;
  line-height: 1;
}

.text{
  font-size:18px;
  line-height:1.7;
  color:#222;
  font-weight:500;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.text.expanded{
  display:block;
}

.read-more{
  margin-top:10px;
  padding:0;
  border:none;
  background:none;
  color:#7C3AED;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  transition:.2s;
}

.read-more:hover{
  color:#6D28D9;
}

.author {
  margin-top: 10px;
  color: #8A8A99;
  font-style: italic;
  font-size:15px;
}

.actions{
  flex-shrink:0;
  display:flex;
  align-items:center;
  gap:14px;
}

.pin-btn {
  height: 48px;
  padding: 0 28px;
  border-radius: 14px;
  background: white;
  border: 1px solid #E6D9FF;
  color: #7C3AED;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px; /* Отступ между иконкой и текстом */
}

.pin-btn.active {
  background: #7C3AED;
  color: white;
}

.icon-btn {
  display: flex;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: white;
  border: 1px solid #ECECEC;
  align-items: center;
  justify-content: center;
  line-height: 0; /* Убирает лишний отступ */
}

.icon-btn.danger {
  color: #FF4545;
}
</style>
