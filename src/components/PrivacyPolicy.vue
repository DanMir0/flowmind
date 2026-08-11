<script setup>
import { ref } from 'vue'

const lastUpdated = ref('August 12, 2026')
const contactEmail = ref('support@yourapp.com')
</script>

<template>
  <div class="privacy-policy">
    <div class="container">
      <h1 class="title">Privacy Policy</h1>
      <p class="subtitle">Last updated: {{ lastUpdated }}</p>

      <div class="content">
        <p class="intro">
          We respect your privacy and are committed to protecting your personal data.
        </p>

        <section class="section">
          <h2>What we collect</h2>
          <ul class="list">
            <li>Email address</li>
            <li>Username</li>
            <li>Authentication data (via email or Google)</li>
          </ul>
        </section>

        <section class="section">
          <h2>How we use your data</h2>
          <ul class="list">
            <li>To create and manage your account</li>
            <li>To provide access to the service</li>
            <li>To improve user experience</li>
          </ul>
        </section>

        <section class="section">
          <h2>Data sharing</h2>
          <p>
            <strong>We DO NOT share your data with third parties.</strong>
          </p>
        </section>

        <section class="section">
          <h2>Security</h2>
          <p>
            All data is stored using modern encryption methods.
            You can delete your account and all associated data at any time.
          </p>
        </section>

        <section class="section">
          <h2>Contact</h2>
          <p>
            If you have any questions about our privacy policy, please contact us at:
            <a :href="'mailto:' + contactEmail" class="link">{{ contactEmail }}</a>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.privacy-policy {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 40px 20px;
}

.container {
  max-width: 768px;
  margin: 0 auto;
  background: var(--bg);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px 0;
}

.subtitle {
  color: var(--text-grey);
  font-size: 14px;
  margin: 0 0 32px 0;
}

.intro {
  font-size: 16px;
  color: var(--text-grey);
  line-height: 1.7;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.section {
  margin-bottom: 28px;
}

.section:last-child {
  margin-bottom: 0;
}

.section h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.section p {
  font-size: 15px;
  color: var(--text-grey);
  line-height: 1.7;
  margin: 0;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list li {
  font-size: 15px;
  color: var(--text-grey);
  padding: 6px 0 6px 28px;
  position: relative;
  line-height: 1.6;
}

.list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4f46e5;
}

.link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .privacy-policy {
    padding: 20px 16px;
  }

  .container {
    padding: 24px 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style>
