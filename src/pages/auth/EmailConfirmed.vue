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
    console.error('[EmailConfirmed]', err)

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
  <main class="email-confirmed-page">
    <section class="email-confirmed-card">
      <div
        v-if="loading"
        class="confirmation-content">
        <div class="status-icon loading-icon">
          <span class="loader"></span>
        </div>
        <h1>Confirming your email</h1>
        <p class="description">
          Please wait while we verify your
          email address.
        </p>
      </div>

      <div
        v-else-if="confirmed"
        class="confirmation-content">

        <div class="status-icon success-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true">

            <path
              d="M5 12.5L9.5 17L19 7"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>

        <div class="badge">
          <span class="badge-dot"></span>
          Email verified
        </div>

        <h1>
          Email confirmed!
        </h1>

        <p class="description">
          Your email address has been
          successfully verified.
        </p>

        <p class="sub-description">
          Your FlowMind account is ready.
          You can now sign in and start
          managing your tasks.
        </p>

        <button
          class="continue-button"
          type="button"
          @click="goToLogin">
          Continue to Login
          <svg
            class="button-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true">
            <path
              d="M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round" />
            <path
              d="M13 6L19 12L13 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div
        v-else
        class="confirmation-content">

        <div class="status-icon error-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true">
            <path
              d="M12 8V13"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round" />
            <circle
              cx="12"
              cy="17"
              r="1"
              fill="currentColor" />
          </svg>
        </div>

        <div class="badge error-badge">
          <span class="badge-dot"></span>
          Verification failed
        </div>

        <h1>
          Confirmation failed
        </h1>

        <p class="description">
          {{ error }}
        </p>

        <p class="sub-description">
          Please try confirming your email
          again or return to the login page.
        </p>

        <button
          class="continue-button"
          type="button"
          @click="goToLogin">
          Back to Login
          <svg
            class="button-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true">

            <path
              d="M5 12H19"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round" />

            <path
              d="M13 6L19 12L13 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

    </section>

  </main>
</template>

<style scoped>
.email-confirmed-page {
  width: 100%;
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: var(--bg-page);
  box-sizing: border-box;
}

.email-confirmed-card {
  width: min(100%, 520px);
  background: var(--bg);
  border: 1px solid var(--border-card);
  border-radius: 24px;
  padding: 52px 48px;
  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.07),
    0 4px 12px rgba(15, 23, 42, 0.03);
  box-sizing: border-box;
  text-align: center;
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-icon {
  width: 82px;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-radius: 50%;
}

.status-icon svg {
  width: 42px;
  height: 42px;
}

.success-icon {
  color: #16a34a;
  background: #dcfce7;
  box-shadow:
    0 0 0 10px rgba(220, 252, 231, 0.55);
}

.error-icon {
  color: #dc2626;
  background: #fee2e2;
  box-shadow:
    0 0 0 10px rgba(254, 226, 226, 0.55);
}

.loading-icon {
  background: #f3e8ff;
  box-shadow:
    0 0 0 10px rgba(243, 232, 255, 0.55);
}

.loader {
  width: 30px;
  height: 30px;
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

.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  margin-bottom: 14px;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.error-badge {
  background: #fef2f2;
  color: #b91c1c;
}

.error-badge .badge-dot {
  background: #ef4444;
}

.email-confirmed-card h1 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text);
}

.description {
  max-width: 390px;
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: #767676;
}

.sub-description {
  max-width: 390px;
  margin: 7px 0 0;
  color: var(--text-grey);
  font-size: 14px;
  line-height: 1.6;
}

.continue-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 205px;
  margin-top: 30px;
  padding: 13px 20px;
  border: none;
  border-radius: 12px;
  background: #7c3aed;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 5px 12px rgba(124, 58, 237, 0.22);
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.continue-button:hover {
  background: #6d28d9;
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(124, 58, 237, 0.28);
}

.continue-button:active {
  transform: translateY(0);
  box-shadow:
    0 4px 10px rgba(124, 58, 237, 0.2);
}

.continue-button:focus-visible {
  outline: 3px solid rgba(124, 58, 237, 0.2);
  outline-offset: 3px;
}

.button-icon {
  width: 17px;
  height: 17px;

  transition: transform 0.2s ease;
}

.continue-button:hover .button-icon {
  transform: translateX(3px);
}

@media (max-width: 1024px) {
  .email-confirmed-page {
    padding: 32px 24px;
    min-height: calc(100vh - 64px);
  }

  .email-confirmed-card {
    padding: 44px 40px;
    border-radius: 20px;
    max-width: 480px;
  }

  .status-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 20px;
  }

  .status-icon svg {
    width: 36px;
    height: 36px;
  }

  .email-confirmed-card h1 {
    font-size: 26px;
  }

  .description {
    font-size: 15px;
  }

  .sub-description {
    font-size: 13px;
  }

  .continue-button {
    min-width: 180px;
    padding: 12px 18px;
    font-size: 13px;
  }

  .button-icon {
    width: 16px;
    height: 16px;
  }

  .loader {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 767px) {
  .email-confirmed-page {
    padding: 20px 16px;
    min-height: calc(100vh - 56px);
  }

  .email-confirmed-card {
    padding: 32px 24px;
    border-radius: 16px;
    border: none;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
  }

  .status-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 16px;
  }

  .status-icon svg {
    width: 28px;
    height: 28px;
  }

  .success-icon {
    box-shadow: 0 0 0 8px rgba(220, 252, 231, 0.55);
  }

  .error-icon {
    box-shadow: 0 0 0 8px rgba(254, 226, 226, 0.55);
  }

  .loading-icon {
    box-shadow: 0 0 0 8px rgba(243, 232, 255, 0.55);
  }

  .loader {
    width: 22px;
    height: 22px;
    border-width: 2.5px;
  }

  .badge {
    font-size: 11px;
    padding: 5px 10px;
    gap: 5px;
    margin-bottom: 10px;
  }

  .badge-dot {
    width: 5px;
    height: 5px;
  }

  .email-confirmed-card h1 {
    font-size: 22px;
  }

  .description {
    font-size: 14px;
    margin-top: 10px;
    max-width: 100%;
  }

  .sub-description {
    font-size: 13px;
    max-width: 100%;
    margin-top: 4px;
  }

  .continue-button {
    min-width: 100%;
    width: 100%;
    margin-top: 24px;
    padding: 14px 20px;
    font-size: 14px;
    border-radius: 10px;
  }

  .button-icon {
    width: 16px;
    height: 16px;
  }

  .continue-button:hover {
    transform: translateY(-1px);
  }

  .continue-button:active {
    transform: scale(0.98);
  }
}

@media (max-width: 380px) {
  .email-confirmed-page {
    padding: 12px 8px;
  }

  .email-confirmed-card {
    padding: 24px 16px;
    border-radius: 14px;
  }

  .status-icon {
    width: 52px;
    height: 52px;
    margin-bottom: 14px;
  }

  .status-icon svg {
    width: 24px;
    height: 24px;
  }

  .loader {
    width: 18px;
    height: 18px;
  }

  .email-confirmed-card h1 {
    font-size: 20px;
  }

  .description {
    font-size: 13px;
    margin-top: 8px;
  }

  .sub-description {
    font-size: 12px;
  }

  .continue-button {
    padding: 12px 16px;
    font-size: 13px;
    margin-top: 20px;
    border-radius: 8px;
  }

  .button-icon {
    width: 14px;
    height: 14px;
  }

  .badge {
    font-size: 10px;
    padding: 4px 8px;
  }
}
</style>
