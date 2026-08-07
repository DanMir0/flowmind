<script setup>

defineProps({
  open: {
    type: Boolean,
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm','cancel'])

</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-wrapper"
        @click.self="emit('cancel')"
      >
        <div class="modal">

          <div class="modal-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M19 6L18 19C17.9 20.1 17 21 15.9 21H8.1C7 21 6.1 20.1 6 19L5 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 10V17"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M14 10V17"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <h3>Delete your account?</h3>

          <p>
            This action is permanent. All your tasks, files and account data
            will be permanently deleted.
          </p>

          <div class="actions">

            <button
              type="button"
              class="btn btn-cancel"
              @click="emit('cancel')"
            >
              Cancel
            </button>

            <button
              type="button"
              class="btn btn-danger"
              :disabled="loading"
              @click="emit('confirm')"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>

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
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(5px);
}

.modal {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  text-align: center;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.25),
    0 8px 24px rgba(0, 0, 0, 0.12);
}

.modal-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
}

.modal h3 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.modal p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-grey);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  position: relative;
  min-width: 120px;
  height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

/* CANCEL */

.btn-cancel {
  background: var(--bg-btn-cancel);
  border: 1px solid var(--border-color);
  color: var(--text);
}

.btn-cancel:hover {
  background: var(--quick-input-focus-bg);
  transform: translateY(-1px);
  border-color: #c4c4c4;
}

/* DELETE */

.btn-danger {
  background: #dc2626;
  border: 1px solid #dc2626;
  color: #ffffff;
  box-shadow:
    0 3px 8px rgba(220, 38, 38, 0.22);
}

.btn-danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow:
    0 5px 14px rgba(220, 38, 38, 0.30);
}

.btn-danger:active {
  transform: translateY(0);
}

/* DISABLED */
.btn-danger:disabled {
  background: #fca5a5;
  border-color: #fca5a5;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* RIPPLE */

.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 50%;
  transform: scale(1) translate(-50%, -50%);
  transform-origin: 50% 50%;
  pointer-events: none;
}

.btn:focus:not(:active)::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0) translate(-50%, -50%);
    opacity: 0.5;
  }

  20% {
    transform: scale(25) translate(-50%, -50%);
    opacity: 0.3;
  }

  100% {
    transform: scale(40) translate(-50%, -50%);
    opacity: 0;
  }
}

/* MOBILE */

@media (max-width: 480px) {
  .modal {
    padding: 24px;
    border-radius: 18px;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
<style>
/* MODAL ANIMATION */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
