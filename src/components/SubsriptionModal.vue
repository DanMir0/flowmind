<script setup>
import { ref } from 'vue'
import { useSubscriptionStore } from '@/store/subscription.js'
import { showSuccess, showError } from '@/utils/toast.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const subscriptionStore = useSubscriptionStore()

const selectedPlan = ref('6_months')

const plans = [
  {
    id: '1_month',
    name: '1 Month',
    price: '4.99',
    monthly: '4.99',
    billing: '$4.99 billed monthly'
  },
  {
    id: '3_months',
    name: '3 Months',
    price: '12.99',
    monthly: '4.33',
    billing: '$12.99 billed every 3 months',
    discount: 'Save 13%'
  },
  {
    id: '6_months',
    name: '6 Months',
    price: '21.99',
    monthly: '3.67',
    billing: '$21.99 billed every 6 months',
    discount: 'Save 26%',
    popular: true
  },
  {
    id: '1_year',
    name: '12 Months',
    price: '39.99',
    monthly: '3.33',
    billing: '$39.99 billed yearly',
    discount: 'Save 33%',
    bestValue: true
  }
]

const premiumFeatures = [
  'Unlimited quotes',
  'Pin your favorite quotes',
  'Advanced search',
  'Access anywhere',
  'And more...'
]

function closeModal() {
  if (!subscriptionStore.loading) {
    emit('close')
  }
}

async function startTrial() {
  try {
    await subscriptionStore.startTrial()

    showSuccess('Your 7-day free trial has started!')

    emit('close')

  } catch (error) {
    showError(error.message)
  }
}
</script>

<template>
  <Teleport to="body">

    <Transition name="subscription-modal">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="closeModal">

        <div class="subscription-modal">

          <!-- CLOSE -->

          <button
            class="close-btn"
            type="button"
            @click="closeModal">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none">
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- HEADER -->

          <div class="modal-header">

            <div class="crown-icon">

              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none">
                <path
                  d="M3 7L7 10L12 3L17 10L21 7L19 19H5L3 7Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linejoin="round"
                />
                <path
                  d="M5 19H19"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>

            </div>

            <h2>
              Choose Your Premium Plan
            </h2>

            <p>
              Unlock all premium features and boost your productivity.
            </p>

          </div>

          <!-- TRIAL -->

          <div class="trial-banner">

            <div class="trial-icon">
              ✦
            </div>

            <div>
              <strong>
                7-day free trial on all plans
              </strong>

              <span>
                Cancel anytime. No commitment.
              </span>
            </div>

          </div>

          <!-- PLANS -->

          <div class="plans-grid">

            <div
              v-for="plan in plans"
              :key="plan.id"
              class="plan-card"
              :class="{
                selected: selectedPlan === plan.id,
                popular: plan.popular || plan.bestValue
              }"
              @click="selectedPlan = plan.id">

              <!-- BADGE -->

              <div
                v-if="plan.popular"
                class="plan-badge">
                Most Popular
              </div>

              <div
                v-if="plan.bestValue"
                class="plan-badge">
                Best Value
              </div>

              <h3>
                {{ plan.name }}
              </h3>

              <div class="price">
                <span>$</span>{{ plan.price }}
              </div>

              <div class="price-period">
                / month
              </div>

              <div
                v-if="plan.discount"
                class="discount">
                {{ plan.discount }}
              </div>

              <div class="plan-divider"></div>

              <p class="billing">
                {{ plan.billing }}
              </p>

              <div class="radio">

                <div
                  v-if="selectedPlan === plan.id"
                  class="radio-dot">
                </div>

              </div>

            </div>

          </div>

          <!-- FEATURES -->

          <div class="features">

            <h3>
              Premium includes:
            </h3>

            <div class="features-list">

              <div
                v-for="feature in premiumFeatures"
                :key="feature"
                class="feature">

                <div class="feature-check">
                  ✓
                </div>

                <span>
                  {{ feature }}
                </span>

              </div>

            </div>

          </div>

          <!-- ACTION -->

          <button
            class="trial-btn"
            type="button"
            :disabled="subscriptionStore.loading"
            @click="startTrial">

            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none">
              <path
                d="M3 7L7 10L12 3L17 10L21 7L19 19H5L3 7Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>

            <span>
              {{
                subscriptionStore.loading
                  ? 'Starting trial...'
                  : 'Start 7-Day Free Trial'
              }}
            </span>

          </button>

          <!-- FOOTER -->

          <div class="secure-note">

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none">
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
                stroke="currentColor"
                stroke-width="1.7"
              />

              <path
                d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />

            </svg>
            Secure payment. Cancel anytime.
          </div>

        </div>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: rgba(15, 23, 42, .58);
  backdrop-filter: blur(4px);
}

.subscription-modal {
  position: relative;
  width: min(990px, 100%);
  max-height: 100vh;
  overflow-y: auto;
  background: var(--bg);
  border-radius: 24px;
  padding: 40px 48px 32px;
  box-shadow:
    0 30px 80px rgba(15, 23, 42, .25),
    0 10px 30px rgba(15, 23, 42, .12);
}

/* CLOSE */

.close-btn {
  position: absolute;
  top: 24px;
  right: 26px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-grey);
  cursor: pointer;
  border-radius: 10px;
  transition: .2s;
}

.close-btn:hover {
  background: var(--quick-input-bg);
  color: var(--text);
}

/* HEADER */

.modal-header {
  text-align: center;
}

.crown-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F3E8FF;
  color: var(--premium-bg);
}

.modal-header h2 {
  margin: 0;
  color: var(--text);
  font-size: 28px;
  font-weight: 700;
}

.modal-header p {
  margin: 10px 0 0;
  color: var(--text-grey);
  font-size: 15px;
}

/* TRIAL */

.trial-banner {
  width: 430px;
  max-width: 100%;
  margin: 28px auto 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  border: 1px solid #E9D5FF;
  border-radius: 14px;
  background: #FAF5FF;
}

.trial-icon {
  color: var(--premium-bg);
  font-size: 21px;
}

.trial-banner strong {
  display: block;
  color: var(--premium-bg);
  font-size: 14px;
}

.trial-banner span {
  display: block;
  margin-top: 4px;
  color: #6B7280;
  font-size: 13px;
}

/* PLANS */

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.plan-card {
  position: relative;
  min-height: 288px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 18px;
  border: 1.5px solid var(--border-card);
  border-radius: 17px;
  background: var(--bg);
  cursor: pointer;
  transition: .2s;
}

.plan-card:hover {
  transform: translateY(-2px);
  border-color: #C4B5FD;
  box-shadow:
    0 8px 22px rgba(124, 58, 237, .08);
}

.plan-card.selected {
  border-color: var(--premium-bg);
  box-shadow:
    0 0 0 1px var(--premium-bg),
    0 10px 26px rgba(124, 58, 237, .10);
}

.plan-card h3 {
  margin: 4px 0 22px;
  color: var(--text);
  font-size: 17px;
  font-weight: 700;
}

.plan-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--premium-bg);
  color: white;
  font-size: 11px;
  font-weight: 700;
}

.price {
  color: var(--text);
  font-size: 29px;
  font-weight: 700;
}

.price span {
  font-size: 20px;
}

.price-period {
  margin-top: 4px;
  color: var(--text-grey);
  font-size: 13px;
}

.discount {
  margin-top: 14px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #F3E8FF;
  color: var(--premium-bg);
  font-size: 12px;
  font-weight: 700;
}

.plan-divider {
  width: 100%;
  margin-top: 16px;
  border-top: 1px solid var(--border-card);
}

.billing {
  margin: 14px 0 13px;
  min-height: 36px;
  text-align: center;
  color: var(--text-grey);
  font-size: 12px;
  line-height: 1.5;
}

.radio {
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #CBD5E1;
  border-radius: 50%;
  margin-top: auto;
}

.plan-card.selected .radio {
  border-color: var(--premium-bg);
  background: var(--premium-bg);
}

.radio-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
}

/* FEATURES */

.features {
  margin-top: 26px;
  padding: 18px 20px;
  border: 1px solid var(--border-card);
  border-radius: 15px;
  background: var(--quick-input-bg);
}

.features h3 {
  margin: 0 0 14px;
  color: var(--text);
  font-size: 14px;
}

.features-list {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-grey);
  font-size: 12px;
  white-space: nowrap;
}

.feature-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #EDE9FE;
  color: var(--premium-bg);
  font-size: 12px;
  font-weight: 700;
}

/* BUTTON */

.trial-btn {
  width: 430px;
  max-width: 100%;
  height: 52px;
  margin: 24px auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: none;
  border-radius: 12px;
  background: var(--premium-bg);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.trial-btn:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow:
    0 8px 20px rgba(124, 58, 237, .25);
}

.trial-btn:disabled {
  opacity: .7;
  cursor: not-allowed;
}

/* FOOTER */

.secure-note {
  margin-top: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-grey);
  font-size: 12px;
}

/* TRANSITION */

.subscription-modal-enter-active,
.subscription-modal-leave-active {
  transition: opacity .2s ease;
}

.subscription-modal-enter-active .subscription-modal,
.subscription-modal-leave-active .subscription-modal {
  transition: transform .2s ease, opacity .2s ease;
}

.subscription-modal-enter-from,
.subscription-modal-leave-to {
  opacity: 0;
}

.subscription-modal-enter-from .subscription-modal,
.subscription-modal-leave-to .subscription-modal {
  transform: scale(.97) translateY(10px);
}

/* RESPONSIVE */

@media (max-width: 900px) {

  .subscription-modal {
    padding: 34px 28px 28px;
  }

  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .features-list {
    flex-wrap: wrap;
  }

}

@media (max-width: 600px) {

  .modal-overlay {
    padding: 12px;
  }

  .subscription-modal {
    max-height: calc(100vh - 24px);
    padding: 30px 18px 24px;
    border-radius: 20px;
  }

  .modal-header h2 {
    font-size: 23px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-card {
    min-height: 210px;
  }

  .features-list {
    flex-direction: column;
  }

}

</style>
