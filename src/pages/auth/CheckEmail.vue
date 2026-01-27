<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>Check your email</h2>

      <p class="text">
        We’ve sent a confirmation link to your email.
        <br />
        Please confirm your account to continue.
      </p>

      <button class="btn" @click="resend" :disabled="loading">
        {{ loading ? 'Sending...' : 'Resend email' }}
      </button>

      <p class="switch">
        Already confirmed?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const loading = ref(false)
const message = ref('')

const email = localStorage.getItem('pending_email')

async function resend() {
  if (!email) {
    message.value = 'Email not found. Please register again.'
    return
  }

  loading.value = true

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email
  })

  if (error) {
    message.value = error.message
  } else {
    message.value = 'Confirmation email sent again'
  }

  loading.value = false
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
  margin-bottom: 15px;
  font-size: 26px;
  font-weight: bold;
}

.text {
  font-size: 15px;
  color: #555;
  margin-bottom: 25px;
  line-height: 1.5;
}

.btn {
  padding: 12px;
  width: 100%;
  border: none;
  border-radius: 30px;
  background: #7a3cff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
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
