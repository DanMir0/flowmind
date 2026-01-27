<script setup>
import { onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    await auth.fetchUser()
    localStorage.removeItem('pending_email')
    router.replace('/dashboard')
  } else {
    router.replace('/login')
  }
})
</script>

<template>
  <div class="auth-page">
    <p>Confirming your email…</p>
  </div>
</template>
<style scoped>
.auth-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #ddd;
  font-size: 15px;
}

</style>
