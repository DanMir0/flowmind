<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Login</h2>

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
        <router-link class="link" to="/forgot-password">
          Forgot password?
        </router-link>
      </div>

      <p class="switch">
        Don't have an account?
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase.js'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  loading.value = false

  if (signInError) {
    if (signInError.message.includes('Email not confirmed')) {
      error.value = 'Please confirm your email'
    } else {
      error.value = signInError.message
    }
    return
  }

  await auth.init()
  router.push('/dashboard')
}
</script>

<style scoped>
.auth-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

.auth-card {
  width: 380px;
  background: white;
  padding: 35px;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0,0,0,0.08);
  text-align: center;
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
  border: 1px solid #ddd;
  font-size: 15px;
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
  color: white;
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
</style>
