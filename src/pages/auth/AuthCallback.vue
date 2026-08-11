<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase.js'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  try {
    console.log('=== GOOGLE CALLBACK START ===')
    console.log('URL:', window.location.href)
    console.log('SEARCH:', window.location.search)
    console.log('HASH:', window.location.hash)

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    console.log('GET SESSION:', session)
    console.log('GET SESSION ERROR:', error)

    if (session?.user) {
      auth.user = session.user

      console.log('GOOGLE USER:', session.user)

      await auth.fetchProfile()

      await router.replace({
        name: 'dashboard'
      })

      return
    }

    console.error('GOOGLE CALLBACK: session not found')

    await router.replace({
      name: 'login'
    })

  } catch (error) {
    console.error('Google callback error:', error)

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
