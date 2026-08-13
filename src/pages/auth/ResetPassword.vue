<script setup>
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { useRouter } from 'vue-router'

const password = ref('')
const show = ref(false)
const router = useRouter()

async function submit() {
  await supabase.auth.updateUser({ password: password.value })
  router.push('/dashboard')
}
</script>
<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>New password</h2>

      <form @submit.prevent="submit">
        <input
          :type="show ? 'text' : 'password'"
          v-model="password"
          placeholder="New password"
          required
        />

        <button class="btn">
          Set password
        </button>
      </form>
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
    padding-right: 40px;
  }

  .eye {
    font-size: 16px;
    right: 12px;
  }

  .btn {
    padding: 12px;
    font-size: 14px;
    border-radius: 24px;
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
}

</style>
