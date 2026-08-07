<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page404">

    <div class="card">

      <div class="code404">
        404
      </div>

      <img
        src="../assets/404-illustration.png"
        alt="404"
        class="illustration">

      <h1>Page not found</h1>

      <p>
        Oops! The page you're looking for doesn't exist
        <br>
        or may have been moved.
      </p>

      <div class="buttons">

        <RouterLink
          to="/dashboard"
          class="primary-btn">
          <svg width="30px" height="30px" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.10572 9.36198C4.75336 9.57974 4.64425 10.0419 4.862 10.3943C5.07976 10.7466 5.54193 10.8557 5.89428 10.638L5.10572 9.36198ZM7.89428 9.40198C8.24664 9.18422 8.35575 8.72205 8.138 8.3697C7.92024 8.01734 7.45807 7.90823 7.10572 8.12598L7.89428 9.40198ZM8.25 8.76398C8.25 8.34977 7.91421 8.01398 7.5 8.01398C7.08579 8.01398 6.75 8.34977 6.75 8.76398H8.25ZM10.5 17.75C10.9142 17.75 11.25 17.4142 11.25 17C11.25 16.5858 10.9142 16.25 10.5 16.25V17.75ZM7.10562 8.12604C6.7533 8.34385 6.64425 8.80604 6.86206 9.15836C7.07987 9.51068 7.54206 9.61973 7.89438 9.40192L7.10562 8.12604ZM11.662 6.19098L11.337 5.51504C11.3132 5.52648 11.2901 5.53916 11.2676 5.55304L11.662 6.19098ZM13.338 6.19098L13.7324 5.55304C13.7099 5.53916 13.6868 5.52648 13.663 5.51504L13.338 6.19098ZM17.1056 9.40192C17.4579 9.61973 17.9201 9.51068 18.1379 9.15836C18.3557 8.80604 18.2467 8.34385 17.8944 8.12604L17.1056 9.40192ZM9.75 17C9.75 17.4142 10.0858 17.75 10.5 17.75C10.9142 17.75 11.25 17.4142 11.25 17H9.75ZM13.75 17C13.75 17.4142 14.0858 17.75 14.5 17.75C14.9142 17.75 15.25 17.4142 15.25 17H13.75ZM10.5 16.25C10.0858 16.25 9.75 16.5858 9.75 17C9.75 17.4142 10.0858 17.75 10.5 17.75V16.25ZM14.5 17.75C14.9142 17.75 15.25 17.4142 15.25 17C15.25 16.5858 14.9142 16.25 14.5 16.25V17.75ZM14.5 16.25C14.0858 16.25 13.75 16.5858 13.75 17C13.75 17.4142 14.0858 17.75 14.5 17.75V16.25ZM18.25 8.76398C18.25 8.34977 17.9142 8.01398 17.5 8.01398C17.0858 8.01398 16.75 8.34977 16.75 8.76398H18.25ZM17.8943 8.12598C17.5419 7.90823 17.0798 8.01734 16.862 8.3697C16.6442 8.72205 16.7534 9.18422 17.1057 9.40198L17.8943 8.12598ZM19.1057 10.638C19.4581 10.8557 19.9202 10.7466 20.138 10.3943C20.3558 10.0419 20.2466 9.57974 19.8943 9.36198L19.1057 10.638ZM5.89428 10.638L7.89428 9.40198L7.10572 8.12598L5.10572 9.36198L5.89428 10.638ZM6.75 8.76398V15.5H8.25V8.76398H6.75ZM6.75 15.5C6.75 16.1176 6.90676 16.7486 7.43266 17.1962C7.92874 17.6184 8.61023 17.75 9.35 17.75V16.25C8.73977 16.25 8.49626 16.1317 8.40484 16.0538C8.34324 16.0014 8.25 15.8824 8.25 15.5H6.75ZM9.35 17.75H10.5V16.25H9.35V17.75ZM7.89438 9.40192L12.0564 6.82892L11.2676 5.55304L7.10562 8.12604L7.89438 9.40192ZM11.987 6.86692C12.3112 6.71103 12.6888 6.71103 13.013 6.86692L13.663 5.51504C12.9279 5.16165 12.0721 5.16165 11.337 5.51504L11.987 6.86692ZM12.9436 6.82892L17.1056 9.40192L17.8944 8.12604L13.7324 5.55304L12.9436 6.82892ZM11.25 17V16H9.75V17H11.25ZM11.25 16C11.25 15.3096 11.8096 14.75 12.5 14.75V13.25C10.9812 13.25 9.75 14.4812 9.75 16H11.25ZM12.5 14.75C13.1904 14.75 13.75 15.3096 13.75 16H15.25C15.25 14.4812 14.0188 13.25 12.5 13.25V14.75ZM13.75 16V17H15.25V16H13.75ZM10.5 17.75H14.5V16.25H10.5V17.75ZM14.5 17.75H15.65V16.25H14.5V17.75ZM15.65 17.75C16.3898 17.75 17.0713 17.6184 17.5673 17.1962C18.0932 16.7486 18.25 16.1176 18.25 15.5H16.75C16.75 15.8824 16.6568 16.0014 16.5952 16.0538C16.5037 16.1317 16.2602 16.25 15.65 16.25V17.75ZM18.25 15.5V8.76398H16.75V15.5H18.25ZM17.1057 9.40198L19.1057 10.638L19.8943 9.36198L17.8943 8.12598L17.1057 9.40198Z" fill="#fff"/>
          </svg>
          <span> Go to Home</span>
        </RouterLink>

        <button
          class="secondary-btn"
          @click="goBack">
          Go Back
        </button>

      </div>

      <span class="star star1">✦</span>
      <span class="star star2">✦</span>
      <span class="star star3">✦</span>

    </div>

  </div>
</template>

<style scoped>

.page404{
  display:flex;
  justify-content:center;
  align-items:center;
  padding:40px;
  background:
    linear-gradient(
      180deg,
      #faf9ff,
      #f5f3ff);
}

[data-theme="dark"] .page404 {
  background: linear-gradient(
    180deg,
    #1A1730,
    #0f1117
  );
}
.card{
  position:relative;
  width:900px;
  max-width:100%;
  background: var(--bg);
  border-radius:32px;
  padding:30px;
  text-align:center;
  overflow:hidden;
  box-shadow:
    0 25px 60px rgba(124,58,237,.08);
}

.code404{
  font-size:110px;
  font-weight:800;
  line-height:1;
  margin-bottom:10px;
  background:
    linear-gradient(
      135deg,
      #8B5CF6,
      #6D28D9);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}

.illustration{
  display:block;
  width: 700px;
  margin: 0 auto;
  border-radius: 30px;
}

h1{
  margin:0;
  font-size:42px;
  font-weight:700;
  color: var(--text);
}

p{
  margin-top:18px;
  font-size:17px;
  line-height:1.7;
  color:#6B7280;
}

.buttons{
  margin-top:30px;
  display:flex;
  justify-content:center;
  gap:18px;
}

.primary-btn{
  display: flex;
  align-items: center;
  gap: 5px;
  padding:14px 34px;
  background:
    linear-gradient(
      135deg,
      #8B5CF6,
      #6D28D9);
  color:white;
  text-decoration:none;
  border-radius:16px;
  font-weight:600;
  transition:.25s;
}

.primary-btn:hover{
  transform:translateY(-2px);
  box-shadow:
    0 12px 30px rgba(124,58,237,.35);
}

.secondary-btn{
  background:none;
  border:none;
  color:#7C3AED;
  cursor:pointer;
  font-size:16px;
  font-weight:600;
}

.secondary-btn:hover{
  text-decoration:underline;
}

.star{
  position:absolute;
  color:#C4B5FD;
  animation:blink 2.5s infinite;
}

.star1{
  left:180px;
  top:300px;
}

.star2{
  right:118px;
  top:300px;
  animation-delay:.8s;
}

.star3{
  left:60%;
  top:160px;
  animation-delay:1.4s;
}

@keyframes float{
  0%{
    transform:translateY(0px);
  }

  50%{
    transform:translateY(-12px);
  }

  100%{
    transform:translateY(0px);
  }

}

@keyframes blink{

  0%,100%{
    opacity:.25;
    transform:scale(.8);
  }

  50%{
    opacity:1;
    transform:scale(1.2);
  }
}

@media (max-width:768px){

  .card{
    padding:40px 24px;
  }

  .code404{
    font-size:80px;
  }

  h1{
    font-size:32px;
  }

  .illustration{
    width:180px;
  }

  .buttons{
    flex-direction:column;
  }

}

</style>
