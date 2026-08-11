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
    console.error('MFA enrollment error:', error)

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
    console.error('MFA verification error:', error)

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
            🔐
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity .2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .modal {
    padding: 24px;
  }

  .actions {
    flex-direction: column;
  }
}
</style>
