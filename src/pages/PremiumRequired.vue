<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  features: {
    type: Array,
    default: () => []
  },

  image: {
    type: String,
    default: ''
  },

  icon: {
    type: String,
    default: ''
  },

  buttonText: {
    type: String,
    default: 'Upgrade to Premium'
  }
})

const emit = defineEmits([
  'upgrade'
])
</script>

<template>
  <div class="premium">

    <div class="premium-card">

      <span class="star star-1">✦</span>
      <span class="star star-2">✦</span>
      <span class="star star-3">✦</span>

      <div class="premium-left">

        <img
          v-if="icon"
          :src="icon"
          class="premium-icon">

        <h1>
          {{ title }}
        </h1>

        <p class="description">
          {{ description }}
        </p>

        <ul class="feature-list">

          <li
            v-for="feature in features"
            :key="feature">
            <span class="check">
                ✓
            </span>

            {{ feature }}
          </li>

        </ul>

        <button
          class="premium-btn"
          @click="$emit('upgrade')">
          <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12.0001 3C12.3334 3 12.6449 3.16613 12.8306 3.443L16.6106 9.07917L21.2523 3.85213C21.5515 3.51525 22.039 3.42002 22.4429 3.61953C22.8469 3.81904 23.0675 4.26404 22.9818 4.70634L20.2956 18.5706C20.0223 19.9812 18.7872 21 17.3504 21H6.64977C5.21293 21 3.97784 19.9812 3.70454 18.5706L1.01833 4.70634C0.932635 4.26404 1.15329 3.81904 1.55723 3.61953C1.96117 3.42002 2.44865 3.51525 2.74781 3.85213L7.38953 9.07917L11.1696 3.443C11.3553 3.16613 11.6667 3 12.0001 3ZM12.0001 5.79533L8.33059 11.2667C8.1582 11.5237 7.8765 11.6865 7.56772 11.7074C7.25893 11.7283 6.95785 11.6051 6.75234 11.3737L3.67615 7.90958L5.66802 18.1902C5.75913 18.6604 6.17082 19 6.64977 19H17.3504C17.8293 19 18.241 18.6604 18.3321 18.1902L20.324 7.90958L17.2478 11.3737C17.0423 11.6051 16.7412 11.7283 16.4324 11.7074C16.1236 11.6865 15.842 11.5237 15.6696 11.2667L12.0001 5.79533Z" fill="#ffffff"/>
          </svg>
          <span>
            {{ buttonText }}
          </span>
        </button>

      </div>

      <div class="premium-right">

        <img
          v-if="image"
          :src="image"
          class="preview-image">

      </div>

    </div>

  </div>
</template>

<style scoped>
.premium{
  padding:32px 42px;
  background: var(--bg-page);
  height: 100vh;
}

.premium-card{
  position:relative;
  overflow:hidden;
  display:grid;
  grid-template-columns: 560px 420px;
  justify-content: center;
  column-gap: 90px;
  align-items:center;
  width:100%;
  min-height:620px;
  padding:70px 85px;
  background: var(--bg);
  border-radius:28px;
  border:1px solid var(--quick-input-focus-bg);
  box-shadow:
    0 20px 55px rgba(124,58,237,.08);
}

.premium-left{
  display:flex;
  flex-direction:column;
  justify-content:center;
  max-width:520px;
}

.premium-icon{
  width:120px;
  margin:0 auto 28px;
  display:block;
}

h1{
  text-align:center;
  margin:0;
  font-size:27px;
  font-weight:800;
  line-height:1.3;
  color: var(--text);
}

.description{
  margin-top:14px;
  text-align: center;
  font-size:17px;
  line-height:1.75;
  color:#6B7280;
  max-width:480px;
}

.feature-list{
  margin-top:34px;
  padding:0;
  list-style:none;
  display:flex;
  flex-direction:column;
  gap:18px;
}

.feature-list li{
  display:flex;
  align-items:center;
  gap:14px;
  font-size:18px;
  font-weight:500;
  color:#374151;
}

.check{
  width:24px;
  height:24px;
  border-radius:50%;
  background:#F3E8FF;
  color:#7C3AED;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  font-weight:700;
  flex:none;
}

.premium-btn{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top:42px;
  width:280px;
  height:50px;
  border:none;
  border-radius:12px;
  background:linear-gradient(
    90deg,
    #8B5CF6,
    #6D28D9
  );
  color:white;
  font-size:17px;
  font-weight:700;
  cursor:pointer;
  transition:.25s;
}

.premium-btn:hover{
  transform:translateY(-2px);
  box-shadow:
    0 16px 35px rgba(124,58,237,.32);
}

.premium-right{
  display:flex;
  justify-content:flex-end;
  align-items:center;
}

.preview-image{
  width:460px;
  max-width:none;
  object-fit:contain;
}

.premium-card::before{
  content:"✦";
  position:absolute;
  top:90px;
  left:420px;
  color:#D8B4FE;
  font-size:22px;
}

.premium-card::after{
  content:"✦";
  position:absolute;
  right:360px;
  top:210px;
  color:#E9D5FF;
  font-size:18px;
}

.star{
  position:absolute;
  color:#D8B4FE;
  user-select:none;
  pointer-events:none;
  animation:floatStar 5s ease-in-out infinite;
}

.star-1{
  top:80px;
  left:360px;
  font-size:22px;
}

.star-2{
  top:120px;
  right:430px;
  font-size:16px;
  animation-delay:1.2s;
}

.star-3{
  top:245px;
  right:250px;
  font-size:26px;
  animation-delay:2.5s;
}
@keyframes floatStar{

  0%{
    transform:translateY(0) rotate(0deg);
    opacity:.5;
  }

  50%{
    transform:translateY(-8px) rotate(10deg);
    opacity:1;
  }

  100%{
    transform:translateY(0) rotate(0deg);
    opacity:.5;
  }

}

/* ===== ПЛАНШЕТ (768px - 1024px) ===== */
@media (max-width: 1024px) {
  .premium {
    padding: 24px 28px;
  }

  .premium-card {
    grid-template-columns: 1fr;
    column-gap: 0;
    padding: 50px 40px;
    min-height: auto;
    gap: 40px;
  }

  .premium-left {
    max-width: 100%;
    order: 1;
  }

  .premium-right {
    order: 0;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    max-width: 400px;
  }

  .premium-card::before,
  .premium-card::after {
    display: none;
  }

  .star {
    display: none;
  }

  .premium-btn {
    width: 100%;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }

  .description {
    max-width: 100%;
  }

  h1 {
    font-size: 24px;
  }

  .feature-list li {
    font-size: 16px;
  }
}

/* ===== МОБИЛЬНЫЕ ТЕЛЕФОНЫ (320px - 767px) ===== */
@media (max-width: 767px) {
  .premium {
    padding: 16px 12px;
    min-height: 100dvh;
  }

  .premium-card {
    padding: 32px 20px 40px;
    border-radius: 20px;
    gap: 30px;
    min-height: auto;
    border: none;
    box-shadow: 0 20px 55px rgba(124, 58, 237, 0.06);
  }

  .premium-left {
    order: 1;
  }

  .premium-right {
    order: 0;
  }

  .premium-icon {
    width: 80px;
    margin: 0 auto 18px;
  }

  h1 {
    font-size: 20px;
  }

  .description {
    font-size: 15px;
    margin-top: 10px;
    line-height: 1.6;
  }

  .feature-list {
    margin-top: 24px;
    gap: 14px;
  }

  .feature-list li {
    font-size: 14px;
    gap: 10px;
  }

  .check {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }

  .premium-btn {
    width: 100%;
    height: 46px;
    font-size: 15px;
    margin-top: 30px;
    border-radius: 10px;
    max-width: 100%;
  }

  .premium-btn svg {
    width: 16px;
    height: 16px;
  }

  .preview-image {
    max-width: 280px;
  }

  .premium-card::before,
  .premium-card::after {
    display: none;
  }

  .star {
    display: none;
  }
}

/* ===== ОЧЕНЬ МАЛЕНЬКИЕ ТЕЛЕФОНЫ (до 380px) ===== */
@media (max-width: 380px) {
  .premium {
    padding: 12px 8px;
  }

  .premium-card {
    padding: 24px 14px 32px;
    border-radius: 16px;
    gap: 20px;
  }

  .premium-icon {
    width: 64px;
    margin: 0 auto 14px;
  }

  h1 {
    font-size: 18px;
  }

  .description {
    font-size: 14px;
  }

  .feature-list {
    margin-top: 18px;
    gap: 10px;
  }

  .feature-list li {
    font-size: 13px;
    gap: 8px;
  }

  .check {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .premium-btn {
    height: 42px;
    font-size: 14px;
    margin-top: 24px;
    gap: 8px;
  }

  .premium-btn svg {
    width: 14px;
    height: 14px;
  }

  .preview-image {
    max-width: 200px;
  }
}
</style>
