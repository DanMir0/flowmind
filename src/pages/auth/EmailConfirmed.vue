<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/services/supabase.js'
import router from '@/router/router.js'

const loading = ref(true)
const confirmed = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession()

    if (session?.user?.email_confirmed_at) {
      confirmed.value = true
      return
    }

    const {
      data: {
        user
      },
      error: userError
    } = await supabase.auth.getUser()

    if (userError) {
      throw userError
    }

    if (user?.email_confirmed_at) {
      confirmed.value = true
      return
    }

    error.value = 'Email confirmation was not completed.'

  } catch (err) {
    console.error(
      '[EmailConfirmed]',
      err
    )

    error.value =
      'Unable to verify email confirmation.'
  } finally {
    loading.value = false
  }
})

async function goToLogin() {
  await router.push({
    name: 'login'
  })
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card email-confirmed-card">

      <!-- LOADING -->

      <div v-if="loading">

        <div class="status-icon loading-icon">
          <span></span>
        </div>

        <h2>
          Confirming your email...
        </h2>

        <p class="text">
          Please wait while we verify
          your email address.
        </p>

      </div>

      <!-- SUCCESS -->

      <div v-else-if="confirmed">

        <div class="status-icon success-icon">
          ✓
        </div>

        <h2>
          Email confirmed!
        </h2>

        <p class="text">
          Your email address has been
          successfully confirmed.
        </p>

        <p class="text">
          Your FlowMind account is ready.
          You can now sign in.
        </p>

        <button
          class="btn"
          type="button"
          @click="goToLogin">
          Continue to Login
        </button>

      </div>

      <!-- ERROR -->

      <div v-else>

        <div class="status-icon error-icon">
          !
        </div>

        <h2>
          Confirmation failed
        </h2>

        <p class="text">
          {{ error }}
        </p>

        <button
          class="btn"
          type="button"
          @click="goToLogin">
          Back to Login
        </button>

      </div>

    </div>
  </div>
</template>

<style scoped>
.email-confirmed-card {
  text-align: center;
}

.status-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  font-size: 30px;
  font-weight: 600;
}

.success-icon {
  color: #16a34a;
  background: #dcfce7;
}

.error-icon {
  color: #dc2626;
  background: #fee2e2;
}

.loading-icon {
  background: #f3e8ff;
}

.loading-icon span {
  width: 26px;
  height: 26px;

  border: 3px solid #ddd6fe;
  border-top-color: #7c3aed;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
