<template>
  <div class="auth-shell">
    <!-- Left brand panel -->
    <aside class="auth-panel">
      <div class="brand-mark">MyApp</div>

      <div class="panel-copy">
        <h1>Run the business<br />from one ledger.</h1>
        <p>Users, orders, payments and reports — kept in one place, updated in real time.</p>
      </div>

      <ul class="feature-list">
        <li>
          <span class="tick" />
          <span>Live revenue and order tracking</span>
        </li>
        <li>
          <span class="tick" />
          <span>Role-based access for your team</span>
        </li>
        <li>
          <span class="tick" />
          <span>Exportable reports, always in sync</span>
        </li>
      </ul>

      <div class="panel-foot">© {{ new Date().getFullYear() }} MyApp</div>
    </aside>

    <!-- Right form panel -->
    <main class="auth-form-panel">
      <div class="form-card">
        <p class="ledger-label">Get started</p>
        <h2>Create your account</h2>
        <p class="subtitle">Takes less than a minute.</p>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <form @submit.prevent="onSubmit">
          <div class="row">
            <label>Name</label>
            <input class="ledger-input" v-model="user.name" type="text" placeholder="Jane Cooper" required />
          </div>

          <div class="row">
            <label>Email</label>
            <input class="ledger-input" v-model="user.email" type="email" placeholder="jane@company.com" required />
          </div>

          <div class="row">
            <label>Mobile number</label>
            <input class="ledger-input" v-model="user.mobile_number" type="tel" placeholder="+91 90000 00000" />
          </div>

          <div class="row">
            <label>Gender</label>
            <div class="pill-group">
              <label class="pill" :class="{ active: user.gender === 'Male' }">
                <input type="radio" value="Male" v-model="user.gender" />
                Male
              </label>
              <label class="pill" :class="{ active: user.gender === 'Female' }">
                <input type="radio" value="Female" v-model="user.gender" />
                Female
              </label>
              <label class="pill" :class="{ active: user.gender === 'Other' }">
                <input type="radio" value="Other" v-model="user.gender" />
                Other
              </label>
            </div>
          </div>

          <div class="row-split">
            <div class="row">
              <label>Date of birth</label>
              <input class="ledger-input" type="date" v-model="user.dob" />
            </div>
          </div>

          <div class="row-split">
            <div class="row">
              <label>Password</label>
              <input class="ledger-input" type="password" v-model="user.password" placeholder="••••••••" required />
            </div>
            <div class="row">
              <label>Confirm password</label>
              <input class="ledger-input" type="password" v-model="user.confirm_password" placeholder="••••••••" required />
            </div>
          </div>

          <button class="btn-primary submit-btn" type="submit">Create account</button>
        </form>

        <p class="switch-link">
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/ApiService'

const router = useRouter()
const errorMsg = ref('')

interface User {
  name: string
  email: string
  password: string
  confirm_password: string
  dob: string
  gender: string
  mobile_number: string
}

const user = ref<User>({
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  dob: '',
  gender: '',
  mobile_number: '',
})

const onSubmit = async () => {
  errorMsg.value = ''

  if (user.value.password !== user.value.confirm_password) {
    errorMsg.value = 'Password and confirm password do not match.'
    return
  }

  try {
    const response = await api.post('/user', user.value)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    await router.push('/home')
  } catch (error: any) {
    errorMsg.value =
      error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed.'
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --ink: #14171c;
  --paper: #fbfaf6;
  --surface: #ffffff;
  --line: #e4e1d8;
  --forest: #0e5c4a;
  --forest-dark: #0a4638;
  --forest-soft: #e7f0ed;
  --gold: #b8872f;
  --slate: #6b7280;
  --danger: #a3372c;
  --danger-soft: #f6e9e7;
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --radius: 3px;
}

* {
  box-sizing: border-box;
}

.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: var(--font-body);
  color: var(--ink);
}

/* Left panel */
.auth-panel {
  background: var(--ink);
  color: #f2f0ea;
  padding: 56px 56px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  background-image:
    linear-gradient(180deg, transparent 0%, transparent 100%),
    repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 64px);
}

.brand-mark {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
}

.panel-copy h1 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 40px;
  line-height: 1.18;
  margin: 28px 0 16px;
}

.panel-copy p {
  font-size: 15px;
  line-height: 1.6;
  color: #c9c6bd;
  max-width: 380px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 40px 0 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid rgba(255,255,255,0.12);
  padding-top: 28px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #dedbd2;
}

.tick {
  width: 14px;
  height: 1px;
  background: var(--gold);
  flex-shrink: 0;
}

.panel-foot {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #6f6d66;
}

/* Right panel */
.auth-form-panel {
  background: var(--paper);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 420px;
}

.ledger-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate);
  margin: 0 0 10px;
}

.form-card h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 30px;
  margin: 0 0 6px;
}

.subtitle {
  color: var(--slate);
  font-size: 14px;
  margin: 0 0 28px;
}

.form-error {
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius);
  margin-bottom: 20px;
}

.row {
  margin-bottom: 20px;
}

.row-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.row-split .row {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 6px;
}

.ledger-input {
  width: 100%;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink);
  background: transparent;
  border: none;
  border-bottom: 1.5px solid var(--line);
  padding: 10px 2px;
  outline: none;
  transition: border-color 0.2s ease;
}
.ledger-input:focus {
  border-bottom-color: var(--forest);
}

.pill-group {
  display: flex;
  gap: 10px;
}

.pill {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 0;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--slate);
  transition: 0.2s ease;
}

.pill input {
  display: none;
}

.pill.active {
  background: var(--forest-soft);
  border-color: var(--forest);
  color: var(--forest-dark);
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 15px;
  color: #fff;
  background: var(--forest);
  border: none;
  border-radius: var(--radius);
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.submit-btn:hover {
  background: var(--forest-dark);
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: var(--slate);
  margin-top: 24px;
}

.switch-link a {
  color: var(--forest);
  font-weight: 600;
  text-decoration: none;
}

.switch-link a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }
  .auth-panel {
    padding: 32px;
  }
  .panel-copy h1 {
    font-size: 30px;
  }
  .feature-list {
    display: none;
  }
}
</style>
