<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/store/auth.js'
import { showError, showSuccess } from '@/utils/toast.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'enabled'
])

const auth = useAuthStore()

const loading = ref(false)
const code = ref('')
const enrollment = ref(null)
const step = ref('setup')

watch(
  () => props.open,
  async (open) => {
    if (!open) {
      reset()
      return
    }

    await startEnrollment()
  }
)

async function startEnrollment() {
  loading.value = true

  try {
    enrollment.value = await auth.enrollMFA()
    step.value = 'setup'
  } catch (error) {
    showError(
      error?.message ||
      'Failed to start two-factor authentication.'
    )

    emit('close')
  } finally {
    loading.value = false
  }
}

async function verify() {
  const cleanCode = code.value.replace(/\D/g, '')

  if (cleanCode.length !== 6) {
    showError('Enter the 6-digit authentication code.')
    return
  }

  if (!enrollment.value?.id) {
    showError('Authentication setup has expired. Please try again.')
    return
  }

  loading.value = true

  try {
    await auth.verifyMFA(
      enrollment.value.id,
      cleanCode
    )

    showSuccess(
      'Two-factor authentication has been enabled.'
    )

    emit('enabled')
    emit('close')

  } catch (error) {
    showError(
      'Invalid authentication code. Please try again.'
    )
  } finally {
    loading.value = false
  }
}

function reset() {
  enrollment.value = null
  code.value = ''
  loading.value = false
  step.value = 'setup'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="emit('close')">

        <div class="modal">

          <button
            class="close-btn"
            type="button"
            @click="emit('close')">
            ×
          </button>

          <div class="modal-icon">
            <svg width="28px" height="28px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <polygon points="11 23.18 9 21.179 7.589 22.589 11 26 17 20 15.59 18.59 11 23.18" fill="#000000"/>
              <path d="M28,30H24V28h4V16H24V8a4.0045,4.0045,0,0,0-4-4V2a6.0067,6.0067,0,0,1,6,6v6h2a2.0021,2.0021,0,0,1,2,2V28A2.0021,2.0021,0,0,1,28,30Z" fill="#000000"/>
              <path d="M20,14H18V8A6,6,0,0,0,6,8v6H4a2,2,0,0,0-2,2V28a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V16A2,2,0,0,0,20,14ZM8,8a4,4,0,0,1,8,0v6H8ZM20,28H4V16H20Z" fill="#000000"/>
            </svg>
          </div>

          <h2>
            Set up two-factor authentication
          </h2>

          <p class="subtitle">
            Scan the QR code with your authenticator app,
            then enter the 6-digit code to verify it.
          </p>

          <div
            v-if="loading"
            class="loading">
            Preparing authentication...
          </div>

          <template v-else-if="enrollment">

            <div class="qr-wrapper">
              <img
                :src="enrollment.totp.qr_code"
                alt="Two-factor authentication QR code">
            </div>

            <p class="scan-text">
              Scan this QR code using
              Google Authenticator,
              Microsoft Authenticator,
              Authy, or another TOTP app.
            </p>

            <div
              v-if="enrollment.totp.secret"
              class="secret-wrapper">

              <span>
                Can't scan the QR code?
              </span>

              <code>
                {{ enrollment.totp.secret }}
              </code>

            </div>

            <div class="code-field">

              <label>
                Authentication code
              </label>

              <input
                v-model="code"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="000000"
                @input="code = code.replace(/\D/g, '').slice(0, 6)"
                @keyup.enter="verify">

            </div>

            <div class="actions">

              <button
                type="button"
                class="cancel-btn"
                :disabled="loading"
                @click="emit('close')">
                Cancel
              </button>

              <button
                type="button"
                class="primary-btn"
                :disabled="loading || code.length !== 6"
                @click="verify">

                {{ loading ? 'Verifying...' : 'Enable 2FA' }}

              </button>

            </div>

          </template>

        </div>

      </div>

    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, .45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: var(--bg);
  border: 1px solid var(--border-card);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, .22);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 18px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-grey);
  font-size: 28px;
  cursor: pointer;
}

.modal-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #F3E8FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  margin-bottom: 18px;
}

.modal h2 {
  margin: 0;
  color: var(--text);
  font-size: 24px;
}

.subtitle {
  margin: 10px 0 24px;
  color: var(--text-grey);
  font-size: 14px;
  line-height: 1.6;
}

.qr-wrapper {
  width: 220px;
  height: 220px;
  padding: 12px;
  margin: 0 auto 16px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-wrapper img {
  width: 100%;
  height: 100%;
}

.scan-text {
  text-align: center;
  color: var(--text-grey);
  font-size: 13px;
  line-height: 1.5;
}

.secret-wrapper {
  margin: 18px 0;
  padding: 14px;
  border-radius: 14px;
  background: var(--quick-input-bg);
  border: 1px solid var(--border-card);
  text-align: center;
}

.secret-wrapper span {
  display: block;
  margin-bottom: 8px;
  color: var(--text-grey);
  font-size: 12px;
}

.secret-wrapper code {
  display: block;
  color: var(--text);
  font-size: 12px;
  word-break: break-all;
}

.code-field {
  margin-top: 20px;
}

.code-field label {
  display: block;
  margin-bottom: 9px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
}

.code-field input {
  width: 100%;
  height: 54px;
  border: 1px solid var(--border-card);
  border-radius: 14px;
  background: var(--quick-input-bg);
  color: var(--text);
  outline: none;
  text-align: center;
  letter-spacing: 8px;
  font-size: 22px;
  font-weight: 700;
}

.code-field input:focus {
  border-color: var(--premium-bg);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, .08);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.primary-btn {
  flex: 1;
  height: 50px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  border: 1px solid var(--border-card);
  background: var(--bg);
  color: var(--text);
}

.primary-btn {
  border: none;
  background: var(--premium-bg);
  color: white;
}

.primary-btn:disabled,
.cancel-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.loading {
  padding: 40px 0;
  text-align: center;
  color: var(--text-grey);
}

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .modal-overlay {
    padding: 0;
  }

  .modal {
    max-width: 440px;
    padding: 28px;
    border-radius: 20px;
    max-height: calc(100vh - 32px);
  }

  .modal h2 {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .qr-wrapper {
    width: 200px;
    height: 200px;
  }

  .code-field input {
    height: 50px;
    font-size: 20px;
  }

  .cancel-btn,
  .primary-btn {
    height: 46px;
    font-size: 13px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal {
    max-width: 100%;
    padding: 20px 16px 24px;
    border-radius: 24px 24px 0 0;
    animation: slideUp 0.3s ease;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
    border: none;
    border-top: 1px solid var(--border-card, #e2e8f0);
    max-height: 92vh;
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
    background: var(--border-card, #e2e8f0);
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

  .close-btn {
    top: 12px;
    right: 14px;
    width: 32px;
    height: 32px;
    font-size: 24px;
  }

  .modal-icon {
    width: 48px;
    height: 48px;
    font-size: 22px;
    margin-bottom: 14px;
  }

  .modal h2 {
    font-size: 19px;
  }

  .subtitle {
    font-size: 13px;
    margin: 6px 0 16px;
  }

  .qr-wrapper {
    width: 180px;
    height: 180px;
    padding: 8px;
  }

  .scan-text {
    font-size: 12px;
  }

  .secret-wrapper {
    margin: 12px 0;
    padding: 12px;
  }

  .secret-wrapper code {
    font-size: 11px;
  }

  .code-field {
    margin-top: 14px;
  }

  .code-field label {
    font-size: 13px;
    margin-bottom: 6px;
  }

  .code-field input {
    height: 48px;
    font-size: 20px;
    letter-spacing: 6px;
    border-radius: 12px;
  }

  .actions {
    flex-direction: row;
    gap: 10px;
    margin-top: 18px;
  }

  .cancel-btn,
  .primary-btn {
    flex: 1;
    height: 46px;
    font-size: 14px;
    border-radius: 12px;
  }

  .loading {
    padding: 30px 0;
    font-size: 14px;
  }
}

/* ===== ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px) ===== */
@media (max-width: 380px) {
  .modal-overlay {
    padding: 8px;
  }

  .modal {
    padding: 16px 12px 20px;
    border-radius: 20px 20px 0 0;
    max-height: 94vh;
  }

  .modal::before {
    width: 32px;
    height: 3px;
    top: 8px;
  }

  .close-btn {
    top: 8px;
    right: 10px;
    width: 28px;
    height: 28px;
    font-size: 20px;
  }

  .modal-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-bottom: 10px;
  }

  .modal h2 {
    font-size: 17px;
  }

  .subtitle {
    font-size: 12px;
  }

  .qr-wrapper {
    width: 150px;
    height: 150px;
  }

  .code-field input {
    height: 42px;
    font-size: 18px;
    letter-spacing: 4px;
  }

  .cancel-btn,
  .primary-btn {
    height: 40px;
    font-size: 13px;
  }
}
</style>
<style>
.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .modal-enter-from .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-leave-to .modal {
    transform: translateY(100%);
    opacity: 0;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 1;
  }
}
</style>
