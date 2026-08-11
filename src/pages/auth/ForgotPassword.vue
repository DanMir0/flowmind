<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Reset password</h2>

      <form @submit.prevent="submit">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          required
        />

        <p v-if="message" class="success">{{ message }}</p>

        <button class="btn" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send reset link' }}
        </button>
      </form>

      <p v-if="!auth.user" class="switch">
        <router-link :to="{name: 'login'}">Back to login</router-link>
      </p>
      <p v-else class="switch">
        <router-link to="/settings">Back</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/auth.js'

const email = ref('')
const loading = ref(false)
const message = ref('')
const auth = useAuthStore()

async function submit() {
  loading.value = true

  await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  message.value = 'Check your email for reset link'
  loading.value = false
}
</script>
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
  border: 1px solid var(--border);;
  font-size: 15px;
  background: var(--quick-input-bg);
  color: var(--text);
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
