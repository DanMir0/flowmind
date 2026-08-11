<script setup>
import { ref } from 'vue'

const lastUpdated = ref('August 12, 2026')
const contactEmail = ref('support@yourapp.com')
</script>

<template>
  <div class="terms-of-service">
    <div class="container">
      <h1 class="title">Terms of Service</h1>
      <p class="subtitle">Last updated: {{ lastUpdated }}</p>

      <div class="content">
        <section class="section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using our service, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section class="section">
          <h2>2. Description of Service</h2>
          <p>
            Our service provides a platform for managing and organizing quotes,
            tasks, and related content. We offer both free and premium subscription plans
            with different features and limitations.
          </p>
        </section>

        <section class="section">
          <h2>3. User Accounts</h2>
          <ul class="list">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section class="section">
          <h2>4. Subscription Plans</h2>
          <div class="plan-info">
            <div class="plan-item">
              <h4>Free Plan</h4>
              <ul class="list">
                <li>Up to 5 tasks</li>
                <li>Basic features</li>
              </ul>
            </div>
            <div class="plan-item">
              <h4>Premium Plan</h4>
              <ul class="list">
                <li>Create unlimited tasks</li>
                <li>Create your own quote</li>
                <li>Add your favorite quotes to your favorites</li>
                <li>Drag on Drop</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>5. User Content</h2>
          <p>
            You retain all rights to the content you create and submit to our service.
            By submitting content, you grant us a license to store, display, and use
            it to provide our service to you.
          </p>
        </section>

        <section class="section">
          <h2>6. Prohibited Activities</h2>
          <ul class="list">
            <li>Violating any laws or regulations</li>
            <li>Infringing on intellectual property rights</li>
            <li>Posting harmful or offensive content</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Interfering with the service for other users</li>
          </ul>
        </section>

        <section class="section">
          <h2>7. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at any time
            if you violate these Terms of Service. You may also delete your account
            at any time through the settings page.
          </p>
        </section>

        <section class="section">
          <h2>8. Changes to Terms</h2>
          <p>
            We may update these Terms of Service from time to time. We will notify
            you of any changes by posting the new Terms on this page. Your continued
            use of the service after any changes constitutes your acceptance of the
            new terms.
          </p>
        </section>

        <section class="section">
          <h2>9. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <a :href="'mailto:' + contactEmail" class="link">{{ contactEmail }}</a>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terms-of-service {
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

.section {
  margin-bottom: 32px;
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

.plan-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 12px;
}

.plan-item {
  background: var(--bg-today);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-card);
}

.plan-item h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.plan-item .list li::before {
  background: #22c55e;
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
  .terms-of-service {
    padding: 20px 16px;
  }

  .container {
    padding: 24px 20px;
  }

  .title {
    font-size: 24px;
  }

  .plan-info {
    grid-template-columns: 1fr;
  }
}
</style>
