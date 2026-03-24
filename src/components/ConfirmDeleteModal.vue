<script setup>

defineProps({
  title: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    default: 'item'
  }
})

const emit = defineEmits(['confirm','cancel'])

</script>

<template>

  <div class="modal-wrapper">

    <div class="modal-backdrop">

      <div class="modal">

        <h3>Delete {{ entity }}</h3>

        <p>
          Are you sure you want to delete
          <strong>"{{ title }}"</strong>?
        </p>

        <div class="actions">

          <button class="btn cancel" @click="emit('cancel')">
            Cancel
          </button>

          <button class="btn danger" @click="emit('confirm')">
            Delete
          </button>

        </div>

      </div>

    </div>

  </div>

</template>
<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 360px;
  text-align: center;
}

.modal h3 {
  font-size: 22px;
  margin-bottom: 12px;
}

.modal p {
  font-size: 15px;
  color: #444;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
}

.btn {
  flex: 1;
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
}

/* Cancel Button Styles */
.btn.cancel {
  background: linear-gradient(145deg, #f5f3ff, #ede9fe);
  color: #6d4fa8;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.btn.cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(139, 92, 246, 0.3);
}

.btn.cancel:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
}

/* Danger Button Styles */
.btn.danger {
  background: linear-gradient(145deg, #fff5f5, #ffe5e5);
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.2);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.1);
}

.btn.danger:hover {
  background: linear-gradient(145deg, #e53e3e, #c53030);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(229, 62, 62, 0.25);
  border-color: transparent;
}

.btn.danger:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.15);
}

/* Button text animation */
.btn-text {
  display: inline-block;
  transition: transform 0.2s;
}

.btn:hover .btn-text {
  transform: scale(1.02);
}

/* Ripple effect */
.btn::after {
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

.btn:focus:not(:active)::after {
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

/* Responsive */
@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }

  .modal {
    padding: 24px;
    width: 90%;
  }
}
</style>
<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Панель */
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
  opacity 0.25s ease;
}

.modal-enter-from .modal {
  transform: translateY(60px) scale(0.9);
  opacity: 0;
}

.modal-leave-to .modal {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}
</style>
