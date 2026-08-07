<template>
  <div class="auth-shell">
    <!-- Left brand panel -->
    <aside class="auth-panel">
      <div class="brand-mark">MyApp</div>

      <div class="panel-copy">
        <h1>Welcome back to<br />the ledger.</h1>
        <p>Sign in to pick up right where your team left off.</p>
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
        <p class="ledger-label">Sign in</p>
        <h2>Welcome back</h2>
        <p class="subtitle">Enter your details to continue.</p>

        <div class="tab-group">
          <button type="button" class="tab" :class="{ active: loginType === 'email' }" @click="loginType = 'email'">
            Email
          </button>
          <button type="button" class="tab" :class="{ active: loginType === 'Mobile' }" @click="loginType = 'Mobile'">
            Mobile
          </button>
        </div>

        <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>

        <form @submit.prevent="onLogin">
          <div class="row" v-if="loginType === 'Mobile'">
            <label>Mobile number</label>
            <input class="ledger-input" v-model="login.Mobile" type="tel" placeholder="+91 90000 00000" required />
          </div>

          <div class="row" v-if="loginType === 'email'">
            <label>Email</label>
            <input class="ledger-input" v-model="login.email" type="email" placeholder="jane@company.com" required />
          </div>

          <div class="row">
            <label>Password</label>
            <input class="ledger-input" v-model="login.password" type="password" placeholder="••••••••" required />
          </div>

          <div class="options">
            <label class="remember">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button class="submit-btn" type="submit">Sign in</button>
        </form>

        <p class="switch-link">
          Don't have an account?
          <router-link to="/">Sign up</router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/services/ApiService'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginType = ref('email')
const errorMsg = ref('')

interface Login {
  loginType: string
  email: string
  Mobile: string
  password: string
}

const login = ref<Login>({
  loginType: loginType.value,
  email: '',
  Mobile: '',
  password: '',
})

const onLogin = async () => {
  errorMsg.value = ''
  login.value.loginType = loginType.value

  try {
    const response = await api.post('/login', login.value)
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('refreshToken', response.data.refreshToken)
    router.push('/home')
  } catch (error: any) {
    errorMsg.value =
      error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed.'
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

.auth-panel {
  background: var(--ink);
  color: #f2f0ea;
  padding: 56px 56px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-image: repeating-linear-gradient(180deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 64px);
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
  margin: 0 0 24px;
}

.tab-group {
  display: flex;
  border-bottom: 1.5px solid var(--line);
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--slate);
  padding: 10px 0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1.5px;
  transition: 0.2s ease;
}

.tab.active {
  color: var(--forest-dark);
  border-bottom-color: var(--forest);
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

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 26px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
}

.options a {
  color: var(--forest);
  text-decoration: none;
  font-weight: 500;
}

.options a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
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
