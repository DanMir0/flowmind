<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const repeatPassword = ref('')

const showPassword = ref(false)
const showRepeat = ref(false)

const loading = ref(false)
const formError = ref('')

const errors = ref({
  password: false,
  repeatPassword: false
})

/* Password strength */
const passwordScore = computed(() => {
  let score = 0
  const p = password.value

  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[a-z]/.test(p)) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  return score
})

const passwordStrength = computed(() => {
  if (passwordScore.value <= 1) return 1
  if (passwordScore.value <= 3) return 2
  if (passwordScore.value <= 4) return 3
  return 4
})

const strengthLabel = computed(() => {
  return {
    1: 'Very weak',
    2: 'Weak',
    3: 'Good',
    4: 'Strong'
  }[passwordStrength.value]
})

async function submit() {
  formError.value = ''
  errors.value.password = false
  errors.value.repeatPassword = false

  if (passwordScore.value < 4) {
    errors.value.password = true
    formError.value = 'Password is too weak'
    return
  }

  if (password.value.length < 6) {
    errors.value.password = true
    formError.value = 'Password must be at least 6 characters'
    return
  }

  if (password.value !== repeatPassword.value) {
    errors.value.repeatPassword = true
    formError.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    await auth.signUp(email.value, password.value, username.value)
    localStorage.setItem('pending_email', email.value)
    router.push({name: 'checkEmail'})
  } catch (e) {
    formError.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Register</h2>

      <form @submit.prevent="submit">
        <!-- Username -->
        <input
          v-model="username"
          type="text"
          placeholder="Username"
          required
        />

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
            :class="{ invalid: errors.password }"
            placeholder="Password"
            required
          />
          <span class="eye" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </span>
        </div>

        <!-- Strength meter -->
        <div class="strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="'level-' + passwordStrength"
            ></div>
          </div>
          <span class="strength-label">{{ strengthLabel }}</span>
        </div>

        <!-- Repeat password -->
        <div class="password-field">
          <input
            :type="showRepeat ? 'text' : 'password'"
            v-model="repeatPassword"
            :class="{ invalid: errors.repeatPassword }"
            placeholder="Repeat password"
            required
          />
          <span class="eye" @click="showRepeat = !showRepeat">
            {{ showRepeat ? '🙈' : '👁️' }}
          </span>
        </div>

        <!-- Error message -->
        <p v-if="formError" class="error">
          {{ formError }}
        </p>

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="switch">
        Already have an account?
        <router-link :to="{name: 'login'}">Login</router-link>
      </p>
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
  font-size: 15px;
  background: var(--quick-input-bg);
  color: var(--text);
}

input:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124,58,237,.12);
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

.invalid {
  border-color: #e53935;
  background: #fff5f5;
}

.strength {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.strength-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  width: 0;
  transition: all 0.3s ease;
}

.level-1 {
  width: 25%;
  background: #d32f2f;
}

.level-2 {
  width: 50%;
  background: #f57c00;
}

.level-3 {
  width: 75%;
  background: #fbc02d;
}

.level-4 {
  width: 100%;
  background: #388e3c;
}

.strength-label {
  min-width: 80px;
  text-align: right;
  font-weight: 500;
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

.switch {
  margin-top: 15px;
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

  .eye {
    font-size: 16px;
    right: 12px;
  }

  .strength {
    font-size: 12px;
    gap: 8px;
  }

  .strength-label {
    min-width: 60px;
    font-size: 12px;
  }

  .strength-bar {
    height: 6px;
  }

  .error {
    font-size: 13px;
  }

  .switch {
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

  .strength {
    font-size: 11px;
  }

  .strength-label {
    min-width: 50px;
    font-size: 11px;
  }

  .switch {
    font-size: 12px;
  }
}
</style>
