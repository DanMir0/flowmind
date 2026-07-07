<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useSubscriptionStore } from '@/store/subscription'
import { useUserQuotes } from '@/composable/useUserQuotes.js'
import QuoteItem from '@/components/quotes/QuoteItem.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import AddQuoteModal from '@/components/quotes/AddQuoteModal.vue'
import QuoteEditModal from '@/components/quotes/QuoteEditModal.vue'
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const {
  quotes,
  loading,
  errorMessage,
  loadQuotes,
  removeQuote,
  pinQuote,
  editQuote: saveQuote,
} = useUserQuotes()

/* DELETE MODAL */
const showDeleteModal = ref(false)
const quoteToDelete = ref(null)
const search = ref('')
const filter = ref('all')
const showAddQuote = ref(false)
const showEditQuote = ref(false)
const editingQuote = ref(null)

const editQuote = (quoteId) => {
  editingQuote.value = quotes.value.find(q => q.id === quoteId)
  showEditQuote.value = true
}

const filteredQuotes = computed(() => {

  let list = [...quotes.value]

  if (filter.value === 'pinned') {
    list = list.filter(q => q.is_pinned)
  }

  if (search.value.trim()) {

    const value = search.value.toLowerCase()

    list = list.filter(q =>
      q.text.toLowerCase().includes(value) ||
      (q.author || '').toLowerCase().includes(value)
    )
  }

  return list
})

const deleteTitle = computed(() => {
  if (!quoteToDelete.value) return ''

  const text = quoteToDelete.value.text

  return text.length > 30
    ? text.slice(0, 30) + '...'
    : text
})

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

const updateQuote = async (payload) => {

  await saveQuote(payload)

  showEditQuote.value = false
  editingQuote.value = null
}

/* LOAD */

onMounted(() => {
  if (subscriptionStore.isPro) {
    loadQuotes(authStore.user.id)
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

    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">My Quotes</h1>

        <div class="search-wrapper">
          <svg
            class="search-icon"
            viewBox="0 0 24 24"
            fill="none">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              stroke-width="2" />
            <path
              d="M20 20L17 17"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            placeholder="Search quotes..."
          />
        </div>

        <div class="tabs">
          <button
            :class="{active: filter==='all'}"
            @click="filter='all'">
            All Quotes
          </button>

          <button
            :class="{active: filter==='pinned'}"
            @click="filter='pinned'">
            Pinned
          </button>

        </div>
      </div>

      <button class="add-btn" @click="showAddQuote = true">
        + Add Quote
      </button>
    </div>

    <div class="quotes-divider"></div>
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

      <div v-if="errorMessage && !loading" class="error-wrapper">
        <div class="error-card">
          <h2 class="error-title">Connection error!</h2>

          <div class="error-illustration"></div>

          <p class="error-text">
            {{ errorMessage }}
          </p>

          <p class="error-subtext">
            Please try again.
          </p>

          <button
            class="error-btn"
            @click="loadQuotes(authStore.user.id)">
            Retry
          </button>

        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-else-if="loading">

        <div
          v-for="n in 3"
          :key="n"
          class="quote-skeleton"/>

      </div>

      <!-- Quotes list -->
      <div v-else class="quotes-list">

        <QuoteItem
          v-for="quote in filteredQuotes"
          :key="quote.id"
          :quote="quote"
          @pin="pinQuote"
          @delete="deleteQuote"
          @edit="editQuote"/>

        <div
          v-if="!quotes.length"
          class="empty">
          You haven't added any quotes yet.
        </div>
      </div>
    </div>

    <ConfirmDeleteModal
      :isOpen="showDeleteModal"
      entity="quote"
      :title="deleteTitle"
      @confirm="confirmDelete"
      @cancel="showDeleteModal=false"
    />

    <AddQuoteModal
      :open="showAddQuote"
      @close="showAddQuote = false" />

    <QuoteEditModal
      :open="showEditQuote"
      :quote="editingQuote"
      @close="showEditQuote = false"
      @save="updateQuote"
    />
  </div>

</template>

<style scoped>
.page{
  width:100%;
  max-width:1280px;
  margin:0 auto;
  padding:36px 52px 60px;
}

.page-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:15px;
}

.header-left{
  display:flex;
  flex-direction:column;
  gap:22px;
}

.page-title{
  margin:0;
  font-size:38px;
  font-weight:700;
  line-height:1;
  letter-spacing:-1.5px;
  color:#111827;
}

.search-wrapper {
  width:420px;
  height:52px;
  display:flex;
  align-items:center;
  gap:12px;
  padding:0 18px;
  background:#fff;
  border:1px solid #ECEEF3;
  border-radius:28px;
  transition:.25s;
}
.search-wrapper:hover{
  border-color:#D8DCE6;
}

.search-wrapper:focus-within {
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.search-wrapper input{
  width:100%;
  border:none;
  outline:none;
  background:none;
  font-size:15px;
  font-weight:500;
  color:#111827;
}

.search-wrapper input::placeholder{
  color:#9CA3AF;
}

.tabs{
  display:flex;
  gap:12px;
}

.tabs button{
  height:40px;
  padding:0 24px;
  border-radius:999px;
  border:1px solid #ECEEF3;
  background:#fff;
  color:#6B7280;
  font-size:15px;
  font-weight:600;
  cursor:pointer;
  transition:.25s;
}

.tabs button:hover{
  border-color:#DDD6FE;
  color:#7C3AED;
}

.tabs button.active{
  background:#7a3cff;
  color:white;
  border-color:#7a3cff;
  box-shadow:
    0 8px 18px rgba(124,58,237,.22);
}

.add-btn{
  height:52px;
  padding:0 28px;
  display:flex;
  align-items:center;
  gap:10px;
  border:none;
  border-radius:999px;
  background:#7a3cff;
  color:white;
  font-size:15px;
  font-weight:600;
  cursor:pointer;
  transition:.25s;
}

.add-btn:hover{
  background:#5e2fd1;
}

.add-btn:active{
  transform:translateY(0);
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

.quotes-divider{
  width:100%;
  height:1px;
  background:#ECEEF3;
  margin-bottom:15px;
}

/* EMPTY */
.empty{
  text-align:center;
  margin-top:40px;
  color:#888;
}

.error-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60px;
}

/* карточка */
.error-card {
  width: 100%;
  max-width: 720px;
  padding: 40px 30px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  box-shadow:
    0 10px 30px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.6);
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.4s ease;
}

/* фоновая иллюстрация */
.error-illustration {
  width: 100%;
  height: 255px;
  background-image: url("@/assets/errorFatch.png");
  background-size: cover;
  background-position: bottom;
  opacity: 0.9;
}

/* заголовок */
.error-title {
  font-size: 22px;
  font-weight: 700;
  color: #5b4dff;
  margin-bottom: 12px;
}

/* основной текст */
.error-text {
  font-size: 15px;
  color: #444;
  margin-bottom: 6px;
}

/* вторичный текст */
.error-subtext {
  font-size: 14px;
  color: #888;
  margin-bottom: 18px;
}

/* кнопка */
.error-btn {
  padding: 12px 26px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #7b5cff, #5b4dff);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 6px 18px rgba(91,77,255,0.35);
}

.error-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 24px rgba(91,77,255,0.45);
}

.error-btn:active {
  transform: scale(0.97);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #9CA3AF;
}

/* анимация появления */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
