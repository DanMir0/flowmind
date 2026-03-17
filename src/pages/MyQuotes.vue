<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useSubscriptionStore } from '@/store/subscription'
import { useUserQuotes } from '@/composable/useUserQuotes.js'
import QuoteItem from '@/components/quotes/QuoteItem.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const {
  quotes,
  loading,
  errorMessage,
  loadQuotes,
  removeQuote,
  pinQuote
} = useUserQuotes()

/* DELETE MODAL */
const showDeleteModal = ref(false)
const quoteToDelete = ref(null)

const deleteQuote = (quoteId) => {
  quoteToDelete.value = quotes.value.find(q => q.id === quoteId)
  showDeleteModal.value = true
}

const confirmDelete = async () => {

  if (!quoteToDelete.value) return

  await removeQuote(quoteToDelete.value.id)

  showDeleteModal.value = false
  quoteToDelete.value = null
}

/* LOAD */

onMounted(() => {
  if (subscriptionStore.isPro) {
    loadQuotes()
  }
})

watch(
  () => authStore.user,
  (user) => {
    if (user && subscriptionStore.isPro) {
      loadQuotes(user.id)
    }
  },
  {immediate: true}
)

</script>
<template>
  <div class="page">

    <!-- subscription loading -->
    <div v-if="subscriptionStore.loading" class="loading">
      Loading...
    </div>

    <!-- NOT PRO -->
    <div
      v-else-if="!subscriptionStore.isPro"
      class="pro-lock">

      <h2>Custom quotes are a Pro feature</h2>

      <p>
        Upgrade to Pro to create and manage your own quotes.
      </p>

      <button class="upgrade-btn">
        Upgrade to Pro
      </button>

    </div>

    <!-- PRO USER -->
    <div v-else>

      <h1>My Quotes</h1>

      <div v-if="errorMessage" class="error">
        {{ errorMessage }}
      </div>

      <!-- Skeleton loading -->
      <div v-if="loading">

        <div
          v-for="n in 3"
          :key="n"
          class="quote-skeleton"/>

      </div>

      <!-- Quotes list -->
      <div v-else>

        <QuoteItem
          v-for="quote in quotes"
          :key="quote.id"
          :quote="quote"
          @pin="pinQuote"
          @delete="deleteQuote"/>

        <div
          v-if="!quotes.length"
          class="empty">

          You haven't added any quotes yet.

        </div>

      </div>

    </div>

    <ConfirmDeleteModal
      v-if="showDeleteModal"
      entity="quote"
      :title="quoteToDelete?.text.slice(0, 30) + '...'"
      @confirm="confirmDelete"
      @cancel="showDeleteModal=false"
    />
  </div>

</template>


<style scoped>
.page{
  max-width:720px;
  margin:auto;
  padding:40px 20px;
}

/* loading */

.loading{
  text-align:center;
  padding:40px;
  color:#777;
}

/* PRO LOCK */

.pro-lock{
  text-align:center;
  padding:60px 20px;
}

.upgrade-btn{
  margin-top:20px;
  padding:12px 20px;
  border:none;
  border-radius:10px;
  background:#7b5cff;
  color:white;
  cursor:pointer;
}

/* SKELETON */

.quote-skeleton{
  height:80px;
  border-radius:16px;
  margin-top:20px;

  background:linear-gradient(
    90deg,
    #ececf3 25%,
    #f5f5fa 50%,
    #ececf3 75%
  );

  background-size:200% 100%;
  animation:skeleton 1.4s infinite;
}

@keyframes skeleton{
  0%{ background-position:200% 0 }
  100%{ background-position:-200% 0 }
}

/* EMPTY */

.empty{
  text-align:center;
  margin-top:40px;
  color:#888;
}
</style>
