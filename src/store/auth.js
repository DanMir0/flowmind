import { defineStore } from 'pinia'
import { useTasksStore } from '@/store/tasks.js'
import { supabase } from '@/services/supabase.js'
import { useSubscriptionStore } from '@/store/subscription.js'
import { useSettingsStore } from '@/store/settings.js'
import { useNotificationsStore } from '@/store/notifications.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
    initialized: false,

    // MFA
    mfaRequired: false,
    mfaFactorId: null,
  }),

  actions: {
    setUser(user) {
      this.user = user
    },

    async init() {
      const subscriptionStore = useSubscriptionStore()
      const settingsStore = useSettingsStore()

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        this.user = data.session.user

        await settingsStore.loadSettings()
        // profile НЕ блокирует init
        try {
          await this.fetchProfile()
        } catch (error) {
          throw error
        }
        await subscriptionStore.loadSubscription(this.user.id)

        // Проверяем MFA для уже существующей сессии
        await this.checkMFA()

        if (this.mfaFactorId) {
          const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
          if (aalData.currentLevel === 'aal1') {
            this.mfaRequired = true
          }
        }
      }

      this.initialized = true
    },

    async signUp(email, password, username) {
      const { data, error } = await
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        })

      if (error) throw error

      return data
    },

    async signIn(email, password) {
      const subscriptionStore = useSubscriptionStore()
      const settingsStore = useSettingsStore()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      this.setUser(data.user)

      const mfa = await this.checkMFA()

      if (mfa.required) {
        return {
          ...data,
          mfaRequired: true
        }
      }

      await settingsStore.loadSettings()
      await this.fetchProfile()
      await subscriptionStore.loadSubscription(this.user.id)

      return {
        ...data,
        mfaRequired: false
      }
    },

    async checkMFA() {
      try {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        if (error) {
          this.mfaFactorId = null
          this.mfaRequired = false
          return { required: false, factorId: null }
        }

        const required = data.currentLevel === 'aal1'

        this.mfaRequired = required

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()

        if (factorsError) {
          this.mfaFactorId = null
          return { required, factorId: null }
        }

        const verifiedTotp = factors.totp?.find(
          factor => factor.status === 'verified'
        )

        this.mfaFactorId = verifiedTotp?.id || null

        // Если есть верифицированный фактор, но currentLevel = aal1,
        // значит пользователь не прошел 2FA в этой сессии
        if (verifiedTotp && data.currentLevel === 'aal1') {
          this.mfaRequired = true
        }

        return {
          required: this.mfaRequired,
          factorId: this.mfaFactorId
        }
      } catch (error) {
        this.mfaFactorId = null
        this.mfaRequired = false
        return { required: false, factorId: null }
      }
    },

    async enrollMFA() {
      const { data, error } =
        await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'TaskMaster Authenticator'
        })

      if (error) {
        throw error
      }

      return data
    },

    /*
     * Создаём challenge и проверяем код.
     */
    // В store/auth.js

    // В store/auth.js

    async verifyMFA(factorId, code) {
      try {
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId
        })

        if (challengeError) {
          throw challengeError
        }

        const { data, error } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code: code.trim()
        })

        if (error) {
          throw error
        }

        // ★★★ КРИТИЧНО: Принудительно обновляем сессию ★★★
        // 1. Сначала получаем текущую сессию
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData?.session) {
          // 2. Обновляем сессию
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
        }

        // 3. Получаем пользователя с обновленной сессией
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (!userError && userData.user) {
          this.user = userData.user
        }

        // 4. Проверяем уровень
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

        // 5. Получаем факторы
        const { data: factors } = await supabase.auth.mfa.listFactors()

        const verifiedTotp = factors.totp?.find(f => f.status === 'verified')

        if (verifiedTotp) {
          this.mfaFactorId = verifiedTotp.id
        }

        this.mfaRequired = false

        return data

      } catch (error) {
        throw error
      }
    },

    /*
     * Получить активные MFA-факторы.
     */
    async getMFAFactors() {
      const {
        data,
        error
      } = await supabase.auth.mfa.listFactors()

      if (error) {
        throw error
      }

      return data
    },

    /*
     * Удалить TOTP-фактор.
     */
    async disableMFA(factorId) {
      const {
        error
      } = await supabase.auth.mfa.unenroll({
        factorId
      })

      if (error) {
        throw error
      }

      await supabase.auth.refreshSession()

      this.mfaRequired = false
      this.mfaFactorId = null

      return true
    },

    /*
     * Google OAuth.
     */
    async signInWithGoogle() {
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      return data
    },

    async signOut() {
      const taskStore = useTasksStore()
      const subscriptionStore = useSubscriptionStore()
      const notificationsStore = useNotificationsStore()

      const { error } = await supabase.auth.signOut()
      this.user = null
      this.profile = null
      this.mfaRequired = false
      this.mfaFactorId = null

      taskStore.reset()
      subscriptionStore.reset()
      notificationsStore.reset()

      return error
    },

    async fetchProfile() {
      if (!this.user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', this.user.id)
        .maybeSingle()

      if (error) {
        throw error
      }
      this.profile = data

      return data
    },

    async updateEmail(newEmail) {
      const { data: { user }, error: userError } =
        await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) {
        throw error
      }

      // Берём актуального пользователя из Supabase
      const {
        data: { user: updatedUser },
        error: updatedUserError
      } = await supabase.auth.getUser()

      if (updatedUserError) {
        throw updatedUserError
      }

      // Обновляем Pinia
      this.user = updatedUser

      return {
        success: true,
        user: updatedUser,
        message: 'Confirmation email has been sent'
      }
    },

    async deleteAccount() {
      const { data, error } = await supabase.functions.invoke(
        'delete-account'
      )

      if (error) {
        throw error
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete account')
      }
      await supabase.auth.signOut()
      this.user = null
      this.profile = null

      return true
    },

    async refreshUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
          throw error
        }

        if (user) {
          this.user = user

          // Обновляем MFA статус
          await this.checkMFA()

          // Если есть верифицированный фактор и уровень aal2, то 2FA пройдена
          if (this.mfaFactorId) {
            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            if (aalData.currentLevel === 'aal2') {
              this.mfaRequired = false
            }
          }
        }

        return user
      } catch (error) {
        throw error
      }
    },

    // Если пользователь не авторизирован и нажимает на любую кнопку в dashboard, то перекидыват на страницу логина
    goToLoginIfGuest(router) {
      if (!this.user) {
        router.push({ name: 'login' })
        return false
      }
      return true
    }

  }
})
