<template>
  <div class="dashboard-view">
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
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.dashboard-view {
  width: 100%;
}

.welcome-block {
  margin-bottom: 32px;
}

.ledger-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  margin: 0 0 6px;
}

.welcome-block h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 32px;
  margin: 0 0 6px;
  color: var(--ink, #14171c);
}

.subtitle {
  color: var(--slate, #6b7280);
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
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius, 3px);
  padding: 22px;
}

.card-value {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 30px;
  font-weight: 500;
  margin: 4px 0 14px;
}

.card-rule {
  height: 1px;
  background: var(--line, #e4e1d8);
  margin-bottom: 10px;
}

.card-delta {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  margin: 0;
}

.card-delta.up {
  color: var(--forest, #0e5c4a);
}

.card-delta.down {
  color: var(--danger, #a3372c);
}

/* Table */
.table-container {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius, 3px);
  padding: 28px;
}

.table-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 18px;
}

.table-head h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 20px;
  margin: 0;
  color: var(--ink, #14171c);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  font-weight: 500;
  padding: 10px 12px;
  border-bottom: 1.5px solid var(--line, #e4e1d8);
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--line, #e4e1d8);
  font-size: 14px;
  color: var(--ink, #14171c);
}

td.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: var(--slate, #6b7280);
}

tr:hover td {
  background: rgba(14, 92, 74, 0.03);
}

.status-pill {
  display: inline-block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
}

.status-pill.active {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
}

.status-pill.inactive {
  background: #ece9e2;
  color: var(--slate, #6b7280);
}

.status-pill.pending {
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
}

@media (max-width: 1000px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>

