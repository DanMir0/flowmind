<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import router from '@/router/router.js'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const googleLoading = ref(false)
const showMfa = ref(false)
const mfaCode = ref('')

async function submit() {
  try {
    loading.value = true
    error.value = ''

    const result = await auth.signIn(email.value, password.value)

    if (result.mfaRequired) {
      showMfa.value = true
      auth.mfaFactorId = result.factorId || auth.mfaFactorId
      loading.value = false
      return
    }

    await router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Invalid email or password'
  } finally {
    if (!showMfa.value) {
      loading.value = false
    }
  }
}

async function loginWithGoogle() {
  try {
    googleLoading.value = true

    await auth.signInWithGoogle()
  } catch (err) {
    error.value = err.message
  } finally {
    googleLoading.value = false
  }
}

async function verifyMfa() {
  try {
    loading.value = true
    error.value = ''

    await auth.verifyMFA(
      auth.mfaFactorId,
      mfaCode.value
    )

    showMfa.value = false
    mfaCode.value = ''

    await auth.fetchProfile()

    await router.push({ name: 'dashboard' })
  } catch (error) {
    error.value = 'Invalid authentication code.'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Login</h2>

      <div v-if="!showMfa">
        <form @submit.prevent="submit">
          <!-- Email -->
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
          />

          <!-- Password -->
          <div class="password-field">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Password"
              required
            />
            <span class="eye" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </span>
          </div>

          <!-- Error -->
          <p v-if="error" class="error">
            {{ error }}
          </p>

          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        <div class="actions">
          <router-link class="link" :to="{name: 'forgotPassword'}">
            Forgot password?
          </router-link>
        </div>

        <p class="switch">
          Don't have an account?
          <router-link :to="{name: 'register'}">Register</router-link>
        </p>

        <div class="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          class="btn google-btn"
          @click="loginWithGoogle">
          <svg width="18px" height="18px" viewBox="-0.5 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

            <title>Google-color</title>
            <desc>Created with Sketch.</desc>
            <defs>

            </defs>
            <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="Color-" transform="translate(-401.000000, -860.000000)">
                <g id="Google" transform="translate(401.000000, 860.000000)">
                  <path d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24" id="Fill-1" fill="#FBBC05">

                  </path>
                  <path d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333" id="Fill-2" fill="#EB4335">

                  </path>
                  <path d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667" id="Fill-3" fill="#34A853">

                  </path>
                  <path d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24" id="Fill-4" fill="#4285F4">

                  </path>
                </g>
              </g>
            </g>
          </svg>
          {{ googleLoading ? 'Connecting...' : 'Continue with Google' }}
        </button>
      </div>

      <!-- MFA -->

      <div v-else class="mfa-login">

        <h2>Two-factor authentication</h2>

        <p>
          Open your authenticator app and enter
          the 6-digit verification code.
        </p>

        <form @submit.prevent="verifyMfa">

          <input
            v-model="mfaCode"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="000000"
            autofocus />

          <p v-if="error" class="error">
            {{ error }}
          </p>

          <button
            class="btn"
            type="submit"
            :disabled="loading">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.auth-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-page);
}

.auth-card {
  width: 380px;
  background: var(--bg);
  padding: 35px;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.08);
  text-align: center;
  color: var(--text);
}

.auth-card h2 {
  margin-bottom: 25px;
  font-size: 26px;
  font-weight: bold;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--quick-input-bg);
  color: var(--text);
  font-size: 15px;
}

input:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.password-field {
  position: relative;
}

.eye {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 18px;
  opacity: 0.7;
}

.eye:hover {
  opacity: 1;
}

.error {
  color: #e53935;
  font-size: 14px;
  text-align: left;
}

.btn {
  margin-top: 10px;
  padding: 12px;
  border: none;
  border-radius: 30px;
  background: #7a3cff;
  color: var(--bg);
  font-weight: bold;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  background: #5e2fd1;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.link {
  background: none;
  border: none;
  padding: 0;
  color: #7a3cff;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}

.link:hover {
  color: #5e2fd1;
}

.switch {
  margin-top: 20px;
}

.switch a {
  color: #7a3cff;
  font-weight: 600;
  text-decoration: none;
}

.switch a:hover {
  color: #5e2fd1;
}

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .auth-card {
    max-width: 380px;
    padding: 30px 32px 36px;
    border-radius: 18px;
  }

  .auth-card h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  input {
    padding: 12px 14px;
    font-size: 14px;
  }

  .btn {
    padding: 11px;
    font-size: 14px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .auth-page {
    padding: 16px;
    min-height: 100dvh;
  }

  .auth-card {
    max-width: 100%;
    padding: 24px 20px 28px;
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .auth-card h2 {
    font-size: 22px;
    margin-bottom: 18px;
  }

  form {
    gap: 14px;
  }

  input {
    padding: 12px 14px;
    font-size: 14px;
    border-radius: 10px;
  }

  .btn {
    padding: 12px;
    font-size: 14px;
    border-radius: 24px;
  }

  .google-btn {
    font-size: 14px;
  }

  .google-btn svg {
    width: 16px;
    height: 16px;
  }

  .eye {
    font-size: 16px;
    right: 12px;
  }

  .switch {
    font-size: 13px;
  }

  .divider {
    margin: 20px 0;
    font-size: 12px;
  }

  .divider span {
    padding: 0 12px;
  }

  .error {
    font-size: 13px;
  }

  .actions {
    margin-top: 8px;
  }

  .link {
    font-size: 12px;
  }

  .mfa-login h2 {
    font-size: 20px;
  }

  .mfa-login p {
    font-size: 13px;
  }
}

/* ===== ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px) ===== */
@media (max-width: 380px) {
  .auth-page {
    padding: 12px;
  }

  .auth-card {
    padding: 20px 16px 24px;
    border-radius: 14px;
  }

  .auth-card h2 {
    font-size: 20px;
    margin-bottom: 14px;
  }

  input {
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 8px;
  }

  .btn {
    padding: 10px;
    font-size: 13px;
    border-radius: 20px;
  }

  .google-btn {
    font-size: 13px;
  }

  .google-btn svg {
    width: 14px;
    height: 14px;
  }

  .switch {
    font-size: 12px;
  }

  .divider {
    margin: 16px 0;
  }
}

</style>
