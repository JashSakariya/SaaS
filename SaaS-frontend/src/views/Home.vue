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
.dashboard-view {
  width: 100%;
}

.welcome-block {
  margin-bottom: var(--space-xl);
}

.welcome-block h1 {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: var(--text-2xl);
  margin: 0 0 var(--space-xs);
  color: var(--ink, #14171c);
}

.subtitle {
  color: var(--slate, #6b7280);
  font-size: var(--text-sm);
  margin: 0;
}

/* Stat cards */
.cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.card-value {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: var(--text-2xl);
  font-weight: 500;
  margin: var(--space-xs) 0 var(--space-md);
}

.card-rule {
  height: 1px;
  background: var(--line, #e4e1d8);
  margin-bottom: var(--space-sm);
}

.card-delta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
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
  border-radius: var(--radius-md, 8px);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.table-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.table-head h2 {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: var(--text-lg);
  margin: 0;
  color: var(--ink, #14171c);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  font-weight: 500;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1.5px solid var(--line, #e4e1d8);
}

td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--line, #e4e1d8);
  font-size: var(--text-sm);
  color: var(--ink, #14171c);
}

td.mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--slate, #6b7280);
}

tr:hover td {
  background: rgba(14, 92, 74, 0.03);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 2px var(--space-sm);
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

