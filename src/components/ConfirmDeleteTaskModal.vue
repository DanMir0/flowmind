<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-wrapper">
    <div class="modal-backdrop">
      <div class="modal">
        <h3>Delete task</h3>
        <p>
          Are you sure you want to delete
          <strong>"{{ title }}"</strong>?
        </p>

        <div class="actions">
          <button class="btn cancel" @click="$emit('cancel')">
            Cancel
          </button>
          <button class="btn danger" @click="$emit('confirm')">
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
  margin-top: 25px;
}

.btn {
  padding: 10px 18px;
  border-radius: 20px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn.cancel {
  background: #9e9e9e;
}

.btn.danger {
  background: #e53935;
  color: white;
}

.btn.danger:hover {
  background: #c62828;
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
