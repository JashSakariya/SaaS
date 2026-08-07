<template>
  <div class="dashboard">
    <!-- Top bar -->
    <header class="topbar">
      <div class="brand-mark">MyApp</div>
      <div class="topbar-right">
        <span class="welcome">Welcome, Jash</span>
        <button class="logout-btn" @click="handleLogout">Logout</button>
      </div>
    </header>

    <div class="main">
      <!-- Sidebar -->
      <aside class="sidebar">
        <nav>
          <ul>
            <li v-for="item in navItems" :key="item.label" :class="{ active: item.active }">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Content -->
      <section class="content">
        <div class="welcome-block">
          <p class="ledger-label">Overview</p>
          <h1>Dashboard</h1>
          <p class="subtitle">Here's how things stand today.</p>
        </div>

        <!-- Stat cards -->
        <div class="cards">
          <div class="card" v-for="stat in stats" :key="stat.label">
            <p class="ledger-label">{{ stat.label }}</p>
            <p class="card-value">{{ stat.value }}</p>
            <div class="card-rule" />
            <p class="card-delta" :class="stat.trend">{{ stat.change }}</p>
          </div>
        </div>

        <!-- Table -->
        <div class="table-container">
          <div class="table-head">
            <h2>Recent users</h2>
            <p class="ledger-label">{{ users.length }} total</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.email">
                <td>{{ u.name }}</td>
                <td class="mono">{{ u.email }}</td>
                <td>
                  <span class="status-pill" :class="u.status.toLowerCase()">{{ u.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navItems = [
  { label: 'Dashboard', icon: '—', active: true },
  { label: 'Users', icon: '—', active: false },
  { label: 'Orders', icon: '—', active: false },
  { label: 'Payments', icon: '—', active: false },
  { label: 'Reports', icon: '—', active: false },
  { label: 'Settings', icon: '—', active: false },
]

const stats = [
  { label: 'Total users', value: '150', change: '+12 this week', trend: 'up' },
  { label: 'Total orders', value: '95', change: '+4 this week', trend: 'up' },
  { label: 'Revenue', value: '₹2,45,000', change: '+8.2%', trend: 'up' },
  { label: 'Pending orders', value: '12', change: '−3 this week', trend: 'down' },
]

const users = [
  { name: 'John', email: 'john@gmail.com', status: 'Active' },
  { name: 'Emma', email: 'emma@gmail.com', status: 'Active' },
  { name: 'Alex', email: 'alex@gmail.com', status: 'Inactive' },
  { name: 'David', email: 'david@gmail.com', status: 'Pending' },
]

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
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
  --gold-soft: #f6ecd9;
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

.dashboard {
  min-height: 100vh;
  width: 100%;
  background: var(--paper);
  font-family: var(--font-body);
  color: var(--ink);
}

/* Topbar */
.topbar {
  height: 64px;
  background: var(--ink);
  color: #f2f0ea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}

.brand-mark {
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-size: 14px;
  color: #d6d3ca;
}

.logout-btn {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: var(--radius);
  background: transparent;
  color: #f2f0ea;
  cursor: pointer;
  transition: 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.08);
}

/* Layout */
.main {
  display: flex;
  min-height: calc(100vh - 64px);
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: var(--paper);
  border-right: 1px solid var(--line);
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--slate);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: 0.15s ease;
}

.nav-icon {
  font-family: var(--font-mono);
  color: var(--line);
  width: 10px;
}

.sidebar li:hover {
  color: var(--ink);
  background: rgba(0,0,0,0.02);
}

.sidebar li.active {
  color: var(--forest-dark);
  border-left-color: var(--forest);
  background: var(--forest-soft);
}

.sidebar li.active .nav-icon {
  color: var(--forest);
}

/* Content */
.content {
  flex: 1;
  padding: 40px;
  overflow: auto;
}

.welcome-block {
  margin-bottom: 32px;
}

.ledger-label {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate);
  margin: 0 0 6px;
}

.welcome-block h1 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 32px;
  margin: 0 0 6px;
}

.subtitle {
  color: var(--slate);
  font-size: 14px;
  margin: 0;
}

/* Stat cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 36px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 22px;
}

.card-value {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 500;
  margin: 4px 0 14px;
}

.card-rule {
  height: 1px;
  background: var(--line);
  margin-bottom: 10px;
}

.card-delta {
  font-family: var(--font-mono);
  font-size: 12px;
  margin: 0;
}

.card-delta.up {
  color: var(--forest);
}

.card-delta.down {
  color: var(--danger);
}

/* Table */
.table-container {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 28px;
}

.table-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.table-head h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 20px;
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: 500;
  padding: 10px 12px;
  border-bottom: 1.5px solid var(--line);
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

td.mono {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--slate);
}

tr:hover td {
  background: rgba(14, 92, 74, 0.03);
}

.status-pill {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
}

.status-pill.active {
  background: var(--forest-soft);
  color: var(--forest-dark);
}

.status-pill.inactive {
  background: #ece9e2;
  color: var(--slate);
}

.status-pill.pending {
  background: var(--gold-soft);
  color: var(--gold);
}

@media (max-width: 1000px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .sidebar {
    display: none;
  }
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>
