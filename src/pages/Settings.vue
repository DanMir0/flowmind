<script setup>
import { computed, ref } from 'vue'
import {useAuthStore} from '@/store/auth.js'
import {showSuccess, showError} from '@/utils/toast.js'
import BaseSelect from '@/components/BaseSelect.vue'
import ChangeEmailModal from '@/components/ChangeEmailModal.vue'
import { useSettingsStore} from '@/store/settings.js'
import router from '@/router/router.js'

const auth = useAuthStore()
const settingsStore = useSettingsStore()
const showPassword = ref(false)
const showModalEmail = ref(false)

const subscription = ref({
  plan: 'Premium Plan',
  status: 'Active',
  daysLeft: 23,
  renewDate: 'June 13, 2026'
})

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Русский', value: 'ru' }
]

const language = computed({
  get: () => settingsStore.locale,
  set: async (value) => {
    await settingsStore.changeLocale(value)
  }
})
const theme = computed({
  get: () => settingsStore.theme,
  set: async (value) => {
    await settingsStore.changeTheme(value)
  }
})
const email = computed(() => auth.user?.email || '')
const password = computed(() => showPassword.value ? 'Password is hidden' : '••••••••••••••')

function togglePassword() {
  showPassword.value = !showPassword.value
}

function changeEmail() {
  showModalEmail.value = true
}

function changePassword() {
  router.push({name: 'forgotPassword'})
}

function manageSubscription() {
  console.log('Subscription')
}

function deleteAccount() {
  console.log('Delete account')
}

async function saveNewEmail(newEmail) {
  try {
    await auth.updateEmail(newEmail)
    showSuccess(
      'Confirmation email has been sent to your new address.'
    )
    showModalEmail.value = false
  } catch (err) {
    showError(err.message)
  }
}
</script>

<template>

  <div class="settings-page">

    <div class="page-header">

      <h1>Settings</h1>

      <p>
        Manage your account, preferences and subscription.
      </p>

    </div>

    <div class="settings-grid">

      <!-- ACCOUNT -->

      <section class="card">

        <div class="card-header">

          <div class="icon purple">

            <svg width="18px" height="18px" viewBox="0 0 20 20" version="1.1"
                 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <defs>

              </defs>
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Dribbble-Light-Preview" transform="translate(-180.000000, -2159.000000)"
                   fill="var(--premium-bg)">
                  <g id="icons" transform="translate(56.000000, 160.000000)">
                    <path
                      d="M134,2008.99998 C131.783496,2008.99998 129.980955,2007.20598 129.980955,2004.99998 C129.980955,2002.79398 131.783496,2000.99998 134,2000.99998 C136.216504,2000.99998 138.019045,2002.79398 138.019045,2004.99998 C138.019045,2007.20598 136.216504,2008.99998 134,2008.99998 M137.775893,2009.67298 C139.370449,2008.39598 140.299854,2006.33098 139.958235,2004.06998 C139.561354,2001.44698 137.368965,1999.34798 134.722423,1999.04198 C131.070116,1998.61898 127.971432,2001.44898 127.971432,2004.99998 C127.971432,2006.88998 128.851603,2008.57398 130.224107,2009.67298 C126.852128,2010.93398 124.390463,2013.89498 124.004634,2017.89098 C123.948368,2018.48198 124.411563,2018.99998 125.008391,2018.99998 C125.519814,2018.99998 125.955881,2018.61598 126.001095,2018.10898 C126.404004,2013.64598 129.837274,2010.99998 134,2010.99998 C138.162726,2010.99998 141.595996,2013.64598 141.998905,2018.10898 C142.044119,2018.61598 142.480186,2018.99998 142.991609,2018.99998 C143.588437,2018.99998 144.051632,2018.48198 143.995366,2017.89098 C143.609537,2013.89498 141.147872,2010.93398 137.775893,2009.67298"
                      id="profile-[#1341]">

                    </path>
                  </g>
                </g>
              </g>
            </svg>

          </div>

          <div>

            <h2>Account</h2>

            <span>
              Update your account information.
            </span>

          </div>

        </div>

        <div class="field">

          <label>Email address</label>

          <div class="input-row">

            <input
              v-model="email"
              readonly>

            <button
              class="outline-btn"
              @click="changeEmail">
              Change
            </button>

          </div>

        </div>

        <div class="field">

          <label>Password</label>

          <div class="input-row">

            <div class="password-input">

              <input
                :type="showPassword ? 'text' : 'password'"
                :value="password"
                readonly>
              <span
                class="eye"
                @click="togglePassword">
               {{ showPassword ? '🙈' : '👁' }}
              </span>

            </div>

            <button
              class="outline-btn"
              @click="changePassword">
              Change
            </button>

          </div>

        </div>

      </section>

      <!-- SUBSCRIPTION -->

      <section class="card">

        <div class="card-header">

          <div class="icon purple">

            <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12.0001 3C12.3334 3 12.6449 3.16613 12.8306 3.443L16.6106 9.07917L21.2523 3.85213C21.5515 3.51525 22.039 3.42002 22.4429 3.61953C22.8469 3.81904 23.0675 4.26404 22.9818 4.70634L20.2956 18.5706C20.0223 19.9812 18.7872 21 17.3504 21H6.64977C5.21293 21 3.97784 19.9812 3.70454 18.5706L1.01833 4.70634C0.932635 4.26404 1.15329 3.81904 1.55723 3.61953C1.96117 3.42002 2.44865 3.51525 2.74781 3.85213L7.38953 9.07917L11.1696 3.443C11.3553 3.16613 11.6667 3 12.0001 3ZM12.0001 5.79533L8.33059 11.2667C8.1582 11.5237 7.8765 11.6865 7.56772 11.7074C7.25893 11.7283 6.95785 11.6051 6.75234 11.3737L3.67615 7.90958L5.66802 18.1902C5.75913 18.6604 6.17082 19 6.64977 19H17.3504C17.8293 19 18.241 18.6604 18.3321 18.1902L20.324 7.90958L17.2478 11.3737C17.0423 11.6051 16.7412 11.7283 16.4324 11.7074C16.1236 11.6865 15.842 11.5237 15.6696 11.2667L12.0001 5.79533Z"
                    fill="var(--premium-bg)" />
            </svg>

          </div>

          <div>
            <h2>Subscription</h2>
            <span>
             Manage your premium subscription.
            </span>
          </div>

        </div>

        <div class="subscription">

          <div class="subscription-top">

            <span class="badge">

            {{ subscription.plan }}

            </span>

            <span class="status">
            {{ subscription.status }}
          </span>

          </div>
          <div class="subscription-body">
            <div class="calendar-icon">
              <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#16A34A" stroke-width="1.5"
                      fill="none" />
                <path d="M8 2V6M16 2V6" stroke="#16A34A" stroke-width="1.5"
                      stroke-linecap="round" />
                <path d="M3 10H21" stroke="#16A34A" stroke-width="1.5" stroke-linecap="round" />
                <circle cx="12" cy="15" r="1" fill="#16A34A" />
                <circle cx="16" cy="15" r="1" fill="#16A34A" />
                <circle cx="8" cy="15" r="1" fill="#16A34A" />
                <circle cx="12" cy="19" r="1" fill="#16A34A" />
                <circle cx="8" cy="19" r="1" fill="#16A34A" />
                <circle cx="16" cy="19" r="1" fill="#16A34A" />
              </svg>
            </div>
            <div>
              <h3 class="subscription-title">
                Your subscription is active
              </h3>
              <p>
                You have
                <strong>
                  {{ subscription.daysLeft }}
                  days left
                </strong>
              </p>

              <span>
                Renews on {{ subscription.renewDate }}
              </span>

            </div>

          </div>

          <button
            class="manage-btn"
            @click="manageSubscription">
            Manage Subscription
            <span>
            ›
            </span>
          </button>

        </div>

      </section>
      <!-- QUOTES -->

      <section class="card">

        <div class="card-header">

          <div class="icon purple">
            <svg width="20" height="20" viewBox="0 0 351.128 351.128" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path d="M72.326,147.33c4.284-26.928,37.944-55.692,64.26-56.304c1.836,0,3.672-0.612,4.896-1.836
    c1.224-0.612,2.448-1.224,3.06-3.06c9.18-17.136,4.284-30.6-11.016-41.616c-17.748-12.852-45.9,0-59.976,11.628
    C38.054,85.518,1.946,136.313,3.782,184.662c-6.12,32.437-4.896,67.32,4.284,96.084c6.12,18.36,23.868,27.54,42.228,28.764
    c18.36,1.225,56.304,6.732,72.828-4.283c16.524-11.017,17.748-32.437,19.584-50.796c1.836-20.196,7.344-58.141-9.792-74.053
    C115.778,165.078,66.818,181.602,72.326,147.33z" fill="var(--premium-bg)" />
              <path d="M274.286,147.33c4.284-26.928,37.943-55.692,64.26-56.304c1.836,0,3.672-0.612,4.896-1.836
    c1.225-0.612,2.448-1.224,3.061-3.06c9.18-17.136,4.284-30.6-11.016-41.616c-17.748-12.852-45.9,0-59.977,11.628
    c-35.496,29.376-71.604,80.172-69.768,128.52c-6.12,32.437-4.896,67.32,4.283,96.084c6.12,18.36,23.868,27.54,42.229,28.764
    c18.36,1.225,56.304,6.732,72.828-4.283c16.523-11.017,17.748-32.437,19.584-50.796c1.836-20.196,7.344-58.141-9.792-74.053
    C317.738,165.078,268.166,181.602,274.286,147.33z" fill="var(--premium-bg)" />
            </svg>
          </div>

          <div>
            <h2>Quotes Preferences</h2>
            <span>
              Choose your preferred language for quotes.
            </span>
          </div>

        </div>

        <div class="field">

          <label>Quote language</label>
          <BaseSelect
            v-model="language"
            :options="languages"
            labelKey="label"
            valueKey="value"
            class="select">
            <template #icon>
              <svg class="language-icon" xmlns="http://www.w3.org/2000/svg" fill="#000000"
                   width="18px" height="18px" viewBox="0 0 24 24">
                <path
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
              </svg>
            </template>
          </BaseSelect>

          <small>
            Quotes will be displayed in the selected language.
          </small>

        </div>

      </section>

      <!-- APPEARANCE -->

      <section class="card">

        <div class="card-header">

          <div class="icon purple">
            <svg width="18px" height="18px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path fill="var(--premium-bg)"
                    d="M8,0 C12.4183,0 16,3.58172 16,8 C16,8.15958 15.9953,8.31807 15.9861,8.47533 C15.9328,9.38596 15.1095,10.0039 14.1974,10.0039 L11.0106,10.0039 C9.22875,10.0039 8.33642,12.1582 9.59635,13.4181 C10.4823,14.304 10.198,15.7959 8.95388,15.9437 C8.6411,15.9809 8.32278,16 8,16 C3.58172,16 0,12.4183 0,8 C0,3.58172 3.58172,0 8,0 Z M8,2 C4.68629,2 2,4.68629 2,8 C2,11.1538 4.4333,13.7393 7.52492,13.9815 C6.059,11.4506 7.82321,8.00391 11.0106,8.00391 L14,8.00391 C14,4.68629 11.3137,2 8,2 Z M5,8 C5.55228,8 6,8.44771 6,9 C6,9.55228 5.55228,10 5,10 C4.44772,10 4,9.55228 4,9 C4,8.44771 4.44772,8 5,8 Z M6,5 C6.55228,5 7,5.44772 7,6 C7,6.55228 6.55228,7 6,7 C5.44772,7 5,6.55228 5,6 C5,5.44772 5.44772,5 6,5 Z M9,4 C9.55228,4 10,4.44772 10,5 C10,5.55228 9.55228,6 9,6 C8.44771,6 8,5.55228 8,5 C8,4.44772 8.44771,4 9,4 Z" />
            </svg>
          </div>

          <div>

            <h2>Appearance</h2>

            <span>
              Customize the look and feel of the app.
            </span>

          </div>

        </div>

        <label class="theme-title">
          Theme
        </label>

        <div class="theme-grid">

          <div
            class="theme-card"
            :class="{ active: theme === 'light' }"
            @click="theme='light'">

            <div class="theme-check">
              ✓
            </div>

            <div>
              <svg class="theme-icon theme-light-icon" width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM3.66865 3.71609C3.94815 3.41039 4.42255 3.38915 4.72825 3.66865L6.95026 5.70024C7.25596 5.97974 7.2772 6.45413 6.9977 6.75983C6.7182 7.06553 6.2438 7.08677 5.9381 6.80727L3.71609 4.77569C3.41039 4.49619 3.38915 4.02179 3.66865 3.71609ZM20.3314 3.71609C20.6109 4.02179 20.5896 4.49619 20.2839 4.77569L18.0619 6.80727C17.7562 7.08677 17.2818 7.06553 17.0023 6.75983C16.7228 6.45413 16.744 5.97974 17.0497 5.70024L19.2718 3.66865C19.5775 3.38915 20.0518 3.41039 20.3314 3.71609ZM12 7.75C9.65279 7.75 7.75 9.65279 7.75 12C7.75 14.3472 9.65279 16.25 12 16.25C14.3472 16.25 16.25 14.3472 16.25 12C16.25 9.65279 14.3472 7.75 12 7.75ZM6.25 12C6.25 8.82436 8.82436 6.25 12 6.25C15.1756 6.25 17.75 8.82436 17.75 12C17.75 15.1756 15.1756 17.75 12 17.75C8.82436 17.75 6.25 15.1756 6.25 12ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM17.0255 17.0252C17.3184 16.7323 17.7933 16.7323 18.0862 17.0252L20.3082 19.2475C20.6011 19.5404 20.601 20.0153 20.3081 20.3082C20.0152 20.6011 19.5403 20.601 19.2475 20.3081L17.0255 18.0858C16.7326 17.7929 16.7326 17.3181 17.0255 17.0252ZM6.97467 17.0253C7.26756 17.3182 7.26756 17.7931 6.97467 18.086L4.75244 20.3082C4.45955 20.6011 3.98468 20.6011 3.69178 20.3082C3.39889 20.0153 3.39889 19.5404 3.69178 19.2476L5.91401 17.0253C6.2069 16.7324 6.68177 16.7324 6.97467 17.0253ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z" fill="#fff"/>
              </svg>
            </div>
            <span>
              Light
            </span>

          </div>

          <div
            class="theme-card"
            :class="{ active: theme === 'dark' }"
            @click="theme='dark'">

            <div class="theme-check">
              ✓
            </div>

            <div>
              <svg class="theme-icon" width="60px" height="60px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88299 19.5345 5.67423 18.3258C4.46548 17.117 3.62592 15.589 3.2539 13.9205C2.88188 12.252 2.99268 10.5121 3.57346 8.9043C4.15424 7.29651 5.18082 5.88733 6.53323 4.84171C7.88563 3.79609 9.50779 3.15732 11.21 3C10.2134 4.34827 9.73384 6.00945 9.85853 7.68141C9.98323 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>

            <span>
              Dark
            </span>

          </div>

        </div>

        <small>
          Choose your preferred theme for the application.
        </small>

      </section>

      <!-- DANGER -->

      <section class="card danger-card">

        <div class="danger-left">

          <div class="icon red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M19 6L18 19C17.9 20.1 17 21 15.9 21H8.1C7 21 6.1 20.1 6 19L5 6" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 10V17" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 10V17" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>

          <div>

            <h2>
              Danger Zone
            </h2>

            <span>
              Permanently delete your account and all your data.
            </span>

          </div>

        </div>

        <button
          class="danger-btn"
          @click="deleteAccount">
          Delete Account
        </button>

      </section>

    </div>

  </div>
  <ChangeEmailModal
    :open="showModalEmail"
    :currentEmail="email"
    @close="showModalEmail = false"
    @save="saveNewEmail"/>
</template>
<style scoped>
.select input {
  padding: 12px 40px 12px 30px !important;
}

.language-icon {
  position: absolute;
  top: 15px;
  left: 10px;
  fill: var(--color-icon);
}

.settings-page {
  background: var(--bg-page);
  width: 100%;
  padding: 34px 28px 48px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.page-header p {
  color: #6B7280;
  font-size: 15px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(420px, 1fr));
  gap: 24px;
}

.card {
  background: var(--bg);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid var(--border-card);
  box-shadow: 0 8px 24px rgba(15, 23, 42, .05),
  0 2px 6px rgba(15, 23, 42, .04);
  transition: .25s;
}

.card small {
  color: #9CA3AF;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, .08),
  0 4px 12px rgba(15, 23, 42, .06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}

.card-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.card-header span {
  display: block;
  margin-top: 4px;
  color: #6B7280;
  font-size: 14px;
}

.icon {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.icon.purple {
  background: #F3E8FF;
  color: var(--premium-bg);
}

.icon.red {
  background: #FEE2E2;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  font-size: 14px;
  font-weight: 600;
  color: var(--menu-item-color);
}

.field small {
  color: #9CA3AF;
  font-size: 13px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

input,
select {
  width: 100%;
  height: 52px;
  border-radius: 14px;
  border: 1px solid var(--border-card);
  padding: 0 16px;
  font-size: 14px;
  background: var(--quick-input-bg);
  color: var(--text);
  outline: none;
  transition: .2s;
}

textarea {
  width: 100%;
}

input:focus,
select:focus {
  border-color: var(--premium-bg);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, .08);
}

.password-input {
  flex: 1;
  position: relative;
}

.password-input span {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  cursor: pointer;
}

.outline-btn {
  height: 52px;
  padding: 0 24px;
  border-radius: 14px;
  border: 2px solid var(--premium-bg);
  background: var(--bg);
  color: var(--premium-bg);
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
  flex-shrink: 0;
}

.outline-btn:hover {
  background: var(--premium-bg);
  color: white;
}

.subscription {
  border: 1px solid var(--border-card);
  border-radius: 18px;
  overflow: hidden;
}

.subscription-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-card);
}

.subscription-title {
  color: var(--text);
}

.badge {
  background: #F3E8FF;
  color: var(--premium-bg);
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status {
  background: #DCFCE7;
  color: #16A34A;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.subscription-body {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 24px;
}

.calendar-icon {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #DCFCE7;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}

.subscription-body h3 {
  margin: 0 0 6px;
  font-size: 20px;
}

.subscription-body p {
  margin: 0;
  color: var(--menu-item-color);
}

.subscription-body span {
  display: block;
  margin-top: 6px;
  color: #9CA3AF;
  font-size: 14px;
}

.manage-btn {
  width: 100%;
  height: 62px;
  border: none;
  border-top: 1px solid var(--border-card);
  color: var(--text);
  background: var(--bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.manage-btn:hover {
  background: var(--quick-input-bg);
}

.manage-btn span {
  font-size: 28px;
  color: var(--text-grey);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 10px;
  margin-bottom: 18px;
}

.theme-title {
  color: var(--text);
}

.theme-card {
  position: relative;
  height: 170px;
  border: 2px solid var(--border-card);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: .25s;
  overflow: hidden;
  background: var(--bg);
}

.theme-card:hover {
  transform: translateY(-2px);
  border-color: #C4B5FD;
  box-shadow: 0 10px 28px rgba(124, 58, 237, .10);
}

.theme-card.active {
  border-color: var(--premium-bg);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, .08);
}

.theme-check {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--premium-bg);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  opacity: 0;
  transform: scale(.7);
  transition: .2s;
}

.theme-card.active .theme-check {
  opacity: 1;
  transform: scale(1);
}

.theme-icon path {
  stroke: var(--color-icon);
}

.theme-light-icon path {
  fill: var(--color-icon);
}

.theme-card span {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.danger-card {
  grid-column: span 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.danger-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.danger-left h2 {
  margin: 0;
  color: var(--text-danger);
  font-size: 22px;
}

.danger-left span {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-grey);
}

.danger-btn {
  height: 54px;
  padding: 0 28px;
  border: 1px solid var(--text-red);
  border-radius: 14px;
  color: var(--text-red);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .25s;
  flex-shrink: 0;
}

.danger-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(220, 38, 38, .25);
}

.eye{
  cursor:pointer;
  user-select:none;
  font-size:18px;
  color:#6B7280;
  transition:.2s;
}

.eye:hover{
  color:var(--premium-bg);
}

@media (max-width: 1200px) {

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .danger-card {
    grid-column: span 1;
  }

}

@media (max-width: 768px) {

  .settings-page {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 30px;
  }

  .card {
    padding: 22px;
  }

  .input-row {
    flex-direction: column;
    align-items: stretch;
  }

  .outline-btn {
    width: 100%;
  }

  .theme-grid {
    grid-template-columns: 1fr;
  }

  .danger-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;
  }

  .danger-btn {
    width: 100%;
  }

}

</style>
