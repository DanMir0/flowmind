<script setup>

defineProps({
  title: {
    type: String,
    required: true,
    default: ''
  },
  entity: {
    type: String,
    default: 'item'
  },
  isOpen: {
    type: Boolean,
  }
})

const emit = defineEmits(['confirm','cancel'])

</script>

<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="isOpen" class="modal-wrapper">

        <div class="modal-backdrop">

          <div class="modal">

            <h3>Delete {{ entity }}</h3>

            <p>
              Are you sure you want to delete
              <strong>"{{ title }}"</strong>?
            </p>

            <div class="actions">

              <button class="btn btn-cancel" @click="emit('cancel')">
                Cancel
              </button>

              <button class="btn btn-primary" @click="emit('confirm')">
                Delete
              </button>

            </div>

          </div>

        </div>

      </div>
    </Transition>
  </Teleport>


</template>
<style scoped>
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg, #ffffff);
  padding: 30px;
  border-radius: 20px;
  width: 360px;
  max-width: 100%;
  text-align: center;
  color: var(--text, #0f172a);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25), 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--border, #e2e8f0);
  position: relative;
}

.modal h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--text, #0f172a);
}

.modal p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-grey, #475569);
  margin: 0;
}

.modal p strong {
  color: var(--text, #0f172a);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 25px;
}

.btn {
  flex: 1;
  max-width: 120px;
  padding: 10px 18px;
  border-radius: 22px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: #7a3cff;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(122, 60, 255, 0.25);
}

.btn-primary:hover {
  background: #6633d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.35);
}

.btn-primary:disabled {
  background: #c4b0f0;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-cancel {
  background: var(--bg-btn-cancel, #f1f5f9);
  border: 1px solid var(--border, #e2e8f0);
  color: var(--text, #475569);
}

.btn-cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-2px);
}

/* Ripple effect */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
  pointer-events: none;
}

.btn:focus:not(:active)::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0) translate(-50%, -50%);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25) translate(-50%, -50%);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40) translate(-50%, -50%);
  }
}





/* ========================================
   МОБИЛЬНАЯ И ПЛАНШЕТНАЯ ВЕРСТКА
   ======================================== */

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .modal {
    width: 420px;
    padding: 28px;
    border-radius: 20px;
  }

  .modal h3 {
    font-size: 20px;
  }

  .modal p {
    font-size: 14px;
  }

  .btn {
    max-width: 130px;
    padding: 10px 16px;
    font-size: 13px;
    height: 42px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .modal-wrapper {
    align-items: flex-end;
    padding: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .modal {
    width: 100%;
    max-width: 100%;
    padding: 24px 20px 28px;
    border-radius: 24px 24px 0 0;
    text-align: center;
    animation: slideUp 0.3s ease;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
    border-bottom: none;
    border-left: none;
    border-right: none;
  }

  /* Полоска сверху для закрытия */
  .modal::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--border, #e2e8f0);
    border-radius: 2px;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal h3 {
    font-size: 18px;
    margin: 0 0 8px;
  }

  .modal p {
    font-size: 14px;
    line-height: 1.5;
  }

  .actions {
    flex-direction: row;
    gap: 10px;
    margin-top: 24px;
  }

  .btn {
    flex: 1;
    max-width: none;
    height: 48px;
    font-size: 15px;
    border-radius: 14px;
    padding: 0 16px;
  }

  /* Скрываем ripple на мобильных для производительности */
  .btn::after {
    display: none;
  }
}

/* ===== ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px) ===== */
@media (max-width: 380px) {
  .modal-wrapper {
    padding: 0;
  }

  .modal {
    padding: 20px 16px 24px;
    border-radius: 20px 20px 0 0;
  }

  .modal::before {
    width: 32px;
    height: 3px;
    top: 8px;
  }

  .modal h3 {
    font-size: 16px;
  }

  .modal p {
    font-size: 13px;
  }

  .btn {
    height: 44px;
    font-size: 14px;
    border-radius: 12px;
  }

  .actions {
    gap: 8px;
    margin-top: 20px;
  }
}

/* ===== ПЛАНШЕТЫ В ПОРТРЕТНОЙ ОРИЕНТАЦИИ ===== */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .modal {
    width: 380px;
    padding: 26px;
  }
}

/* ===== ПЛАНШЕТЫ В АЛЬБОМНОЙ ОРИЕНТАЦИИ ===== */
@media (min-width: 1025px) and (max-width: 1366px) {
  .modal {
    width: 400px;
  }
}

/* ===== ТЕМНАЯ ТЕМА ===== */
@media (prefers-color-scheme: dark) {
  .modal::before {
    background: #334155;
  }
}

[data-theme="dark"] .modal::before {
  background: #334155;
}

[data-theme="dark"] .modal {
  background: #1e293b;
  border-color: #334155;
}

[data-theme="dark"] .modal h3 {
  color: #f1f5f9;
}

[data-theme="dark"] .modal p {
  color: #cbd5e1;
}

[data-theme="dark"] .modal p strong {
  color: #f1f5f9;
}

[data-theme="dark"] .btn-cancel {
  background: #2d3748;
  border-color: #4a5568;
  color: #cbd5e1;
}

[data-theme="dark"] .btn-cancel:hover {
  background: #3a4458;
}
</style>
<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity .25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal,
.modal-leave-active .modal {
  transition:
    transform .35s cubic-bezier(.16,1,.3,1),
    opacity .25s ease;
}
.modal-enter-from .modal {
  transform: translateY(45px) scale(.95);
  opacity: 0;
}
.modal-leave-to .modal {
  transform: translateY(20px) scale(.98);
  opacity: 0;
}

/* Для мобильных - анимация снизу */
@media (max-width: 767px) {
  .modal-enter-from .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-leave-to .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-enter-from {
    opacity: 0;
  }

  .modal-leave-to {
    opacity: 0;
  }
}
</style>
