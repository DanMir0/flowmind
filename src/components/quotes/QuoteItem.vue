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
    <div class="text">"{{ quote.text }}"</div>
    <div class="author">— {{ quote.author || 'Unknown' }}</div>

    <div class="actions">
      <button
        class="pin-btn"
        :class="{ 'pinned': quote.is_pinned }"
        @click="emit('pin', quote.id)"
      >
        <span class="btn-text">{{ quote.is_pinned ? 'Pinned' : 'Pin' }}</span>
      </button>

      <button class="delete-btn" @click="emit('delete', quote.id)">
        <span class="btn-text">Delete</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quote-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.1), 0 5px 15px -5px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.quote-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 25px 40px -12px rgba(139, 92, 246, 0.25);
}

.text {
  font-size: 16px;
  color: #1f1f2e;
  line-height: 1.6;
  font-weight: 500;
}

.author {
  margin-top: 8px;
  color: #6b6b7b;
  font-size: 14px;
  font-style: italic;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

button {
  border: none;
  padding: 10px 20px;
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  flex: 1;
  max-width: 120px;
}

/* Pin Button Styles */
.pin-btn {
  background: linear-gradient(145deg, #f5f3ff, #ede9fe);
  color: #6d4fa8;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.2);
  position: relative;
  padding-left: 36px;
}

.pin-btn::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-image: url("@/assets/pin-outline.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.25s ease;
}

.pin-btn.pinned {
  background: linear-gradient(145deg, #8B5CF6, #7C3AED);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(139, 92, 246, 0.35);
}

.pin-btn.pinned::before {
  background-image: url("@/assets/pin-fill.svg");
  filter: brightness(0) invert(1);
}

.pin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(139, 92, 246, 0.3);
}

.pin-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

.pin-btn.pinned:hover {
  background: linear-gradient(145deg, #9B6CF6, #8C4AED);
  box-shadow: 0 15px 25px rgba(139, 92, 246, 0.45);
}

/* Delete Button Styles */
.delete-btn {
  background: linear-gradient(145deg, #fff5f5, #ffe5e5);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.2);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
}

.delete-btn:hover {
  background: linear-gradient(145deg, #e53e3e, #c53030);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(229, 62, 62, 0.25);
  border-color: transparent;
}

.delete-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
}

/* Button text animation */
.btn-text {
  display: inline-block;
  transition: transform 0.2s;
}

button:hover .btn-text {
  transform: scale(1.02);
}

/* Ripple effect on click */
button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

button:focus:not(:active)::after {
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

/* Responsive design */
@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }

  button {
    max-width: 100%;
  }

  .quote-card {
    padding: 20px;
  }
}
</style>
