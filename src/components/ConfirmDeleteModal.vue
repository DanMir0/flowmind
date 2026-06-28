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
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15,23,42,.35);
  display: flex;
  justify-content: center;
  align-items: center;
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
  max-width: 120px;
  padding: 10px 18px;
  border-radius: 22px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #7a3cff;
  color: #ffffff;
  border: none;
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
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #444;
}

.btn-cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-2px);
}

.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 999;
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
</style>
