<script setup>
import { ref, watch } from 'vue'

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
        @click="emit('close')"
      >

        <div
          class="modal"
          @click.stop
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

</style>
