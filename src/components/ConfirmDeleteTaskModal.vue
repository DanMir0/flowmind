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
  <div class="overlay">
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
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
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
  background: #eee;
}

.btn.danger {
  background: #e53935;
  color: white;
}

.btn.danger:hover {
  background: #c62828;
}
</style>
