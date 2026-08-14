<script setup>
import { ref, watch } from 'vue'
import { useModal } from '@/composable/useModal.js'

const props = defineProps({
  open: Boolean,
  currentEmail: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'close',
  'save'
])
const { modalRef } = useModal(() => props.open, emit)

const newEmail = ref('')

watch(
  () => props.open,
  (value) => {
    if (value) {
      newEmail.value = ''
    }
  }
)

function submit() {
  if (!newEmail.value.trim()) return

  emit('save', newEmail.value.trim())
}
</script>

<template>

  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="open"
        class="overlay"
        @click.self="emit('close')"
      >

        <div
          class="modal"
          ref="modalRef"
        >

          <h2>Change email</h2>

          <p class="subtitle">
            Enter a new email address. A confirmation email will be sent to it.
          </p>

          <div class="field">

            <label>
              Current email
            </label>

            <input
              :value="currentEmail"
              readonly
            >

          </div>

          <div class="field">

            <label>
              New email
            </label>

            <input
              v-model="newEmail"
              type="email"
              placeholder="example@mail.com"
              @keyup.enter="submit"
            >

          </div>

          <div class="buttons">

            <button
              class="cancel"
              @click="emit('close')"
            >
              Cancel
            </button>

            <button
              class="save"
              @click="submit"
            >
              Save
            </button>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>

</template>

<style scoped>

.overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.35);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:3000;
}

.modal{
  width:440px;
  background: var(--bg);
  border-radius:22px;
  padding:28px;
  box-shadow:0 24px 60px rgba(0,0,0,.15);
  color: var(--text);
}

h2{
  margin:0;
  font-size:24px;
  font-weight:700;
}

.subtitle{
  margin:10px 0 24px;
  color:#6B7280;
  font-size:14px;
  line-height:1.5;
}

.field{
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:18px;
}

label{
  font-size:13px;
  color:#6B7280;
}

input{
  height:48px;
  border:1px solid var(--border);;
  border-radius:12px;
  padding:0 14px;
  font-size:14px;
  outline:none;
  transition:.2s;
  background: var(--quick-input-bg);
  color: var(--text);
}

input:focus{
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}

input[readonly]{
  background: var(--quick-input-bg);
  color:#6B7280;
}

.buttons{
  display:flex;
  justify-content:flex-end;
  gap:12px;
  margin-top:28px;
}

.cancel{
  height:46px;
  padding:0 18px;
  border-radius:12px;
  border:1px solid #e0e0e0;
  background: var(--bg-btn-cancel);
  cursor:pointer;
  color: #444;
}

.cancel:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-2px);
}

.save{
  height:46px;
  padding:0 22px;
  border:none;
  border-radius:12px;
  background:#7a3cff;
  color:var(--bg);
  cursor:pointer;
}

.save:hover{
  background: #6633d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(122, 60, 255, 0.35);
}

/* ========================================
   ПЛАНШЕТ (768px - 1024px)
   ======================================== */
@media (max-width: 1024px) {
  .overlay {
    padding: 16px;
  }

  .modal {
    max-width: 420px;
    padding: 24px;
    border-radius: 20px;
    max-height: calc(100vh - 32px);
  }

  h2 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
    margin: 8px 0 20px;
  }

  input {
    height: 44px;
    font-size: 13px;
  }

  .cancel,
  .save {
    height: 42px;
    font-size: 13px;
    padding: 0 16px;
  }
}

/* ========================================
   МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px)
   ======================================== */
@media (max-width: 767px) {
  .overlay {
    padding: 12px;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .modal {
    max-width: 100%;
    padding: 20px 16px 24px;
    border-radius: 20px;
    max-height: calc(100vh - 24px);
    border: 1px solid var(--border, #e2e8f0);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    animation: none;
  }

  /* Убираем полоску сверху */
  .modal::before {
    display: none;
  }

  h2 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 13px;
    margin: 6px 0 16px;
  }

  .field {
    gap: 6px;
    margin-bottom: 14px;
  }

  label {
    font-size: 12px;
  }

  input {
    height: 42px;
    font-size: 14px;
    padding: 0 12px;
    border-radius: 10px;
  }

  .buttons {
    flex-direction: row;
    gap: 10px;
    margin-top: 20px;
  }

  .cancel,
  .save {
    flex: 1;
    height: 44px;
    font-size: 14px;
    border-radius: 10px;
    padding: 0 12px;
  }

  .cancel {
    order: 1;
  }

  .save {
    order: 2;
  }
}

/* ========================================
   ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px)
   ======================================== */
@media (max-width: 380px) {
  .overlay {
    padding: 8px;
  }

  .modal {
    padding: 16px 12px 20px;
    border-radius: 16px;
    max-height: calc(100vh - 16px);
  }

  h2 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 12px;
  }

  input {
    height: 38px;
    font-size: 13px;
  }

  .cancel,
  .save {
    height: 40px;
    font-size: 13px;
  }
}

</style>
<style>
.modal-enter-active,
.modal-leave-active{
  transition:opacity .25s;
}

.modal-enter-from,
.modal-leave-to{
  opacity:0;
}

.modal-enter-active .modal,
.modal-leave-active .modal{
  transition:transform .3s ease;
}

.modal-enter-from .modal{
  transform:translateY(20px) scale(.97);
}

.modal-leave-to .modal{
  transform:translateY(20px) scale(.97);
}

@media (max-width: 767px) {
  .modal-enter-from .modal {
    transform: translateY(20px) scale(0.97);
    opacity: 0;
  }

  .modal-leave-to .modal {
    transform: translateY(20px) scale(0.97);
    opacity: 0;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
}
</style>
