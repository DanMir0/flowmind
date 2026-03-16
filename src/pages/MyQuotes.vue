<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/store/auth'
import { useSubscriptionStore } from '@/store/subscription'
import { deleteUserQuote, pinUserQuote } from '@/services/userQuotes.js'
import QuoteItem from '@/components/quotes/QuoteItem.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'

const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const quotes = ref([])
const loading = ref(true)

const showDeleteModal = ref(false)
const quoteToDelete = ref(null)
const deleteQuote = async (quoteId) => {
  quoteToDelete.value = quotes.value.find(q => q.id == quoteId)
  showDeleteModal.value = true
}
const loadQuotes = async () => {

  if (!authStore.user) return

  loading.value = true

  const { data, error } = await supabase
    .from('user_quotes')
    .select('*')
    .eq('user_id', authStore.user.id)
    .order('created_at', { ascending:false })

  if (!error) {
    quotes.value = data
  }

  loading.value = false
}

const confirmDelete = async () => {

  if (!quoteToDelete.value) return

  try {

    await deleteUserQuote(quoteToDelete.value.id)

    quotes.value = quotes.value.filter(
      q => q.id !== quoteToDelete.value.id
    )

  } catch (err) {

    console.error(err)
    alert('Failed to delete quote')

  }

  showDeleteModal.value = false
  quoteToDelete.value = null

}

const pinQuote = async (quoteId) => {

  try {

    await pinUserQuote(authStore.user.id, quoteId)

    // обновляем UI
    quotes.value = quotes.value.map(q => ({
      ...q,
      is_pinned: q.id === quoteId
    }))

  } catch (err) {

    console.error(err)
    alert('Failed to pin quote')

  }
}
onMounted(() => {
  if (subscriptionStore.isPro) {
    loadQuotes()
  }
})

watch(
  () => subscriptionStore.isPro,
  (isPro) => {
    if (isPro) {
      loadQuotes()
    }
  }
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
