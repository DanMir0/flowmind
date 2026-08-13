<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase.js'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  try {

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()


    if (session?.user) {
      auth.user = session.user

      await auth.fetchProfile()

      await router.replace({
        name: 'dashboard'
      })

      return
    }

    await router.replace({
      name: 'login'
    })

  } catch (error) {
    await router.replace({
      name: 'login'
    })
  }
})
</script>

<template>
  <div class="auth-callback">
    <p>Signing you in...</p>
  </div>
</template>
