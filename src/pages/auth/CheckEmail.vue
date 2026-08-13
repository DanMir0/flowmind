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
  margin-bottom: 15px;
  font-size: 26px;
  font-weight: bold;
}

.text {
  font-size: 15px;
  color: var(--text-grey);
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

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .auth-card {
    max-width: 380px;
    padding: 32px 32px 36px;
    border-radius: 18px;
  }

  .icon-wrapper {
    width: 68px;
    height: 68px;
  }

  .icon-wrapper svg {
    width: 34px;
    height: 34px;
  }

  .auth-card h2 {
    font-size: 24px;
  }

  .text {
    font-size: 14px;
  }

  .btn {
    font-size: 14px;
    padding: 11px;
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
    padding: 28px 20px 28px;
    border-radius: 16px;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .icon-wrapper {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
  }

  .icon-wrapper svg {
    width: 30px;
    height: 30px;
  }

  .auth-card h2 {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .text {
    font-size: 14px;
    margin-bottom: 22px;
  }

  .text br {
    display: none;
  }

  .btn {
    font-size: 14px;
    padding: 12px;
    border-radius: 24px;
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

  .icon-wrapper {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }

  .icon-wrapper svg {
    width: 24px;
    height: 24px;
  }

  .auth-card h2 {
    font-size: 20px;
  }

  .text {
    font-size: 13px;
    margin-bottom: 18px;
  }

  .btn {
    font-size: 13px;
    padding: 10px;
    border-radius: 20px;
  }

  .switch {
    font-size: 12px;
  }
}
</style>
