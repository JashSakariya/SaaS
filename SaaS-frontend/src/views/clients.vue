<template>
  <div class="clients-view">
    <!-- Client Form Drawer component -->
    <ClientDrawer 
      :is-open="showAddClient"
      :client="selectedClient"
      @close="closeDrawer"
      @saved="fetchClient"
    />

    <!-- Welcome Block / Overview -->
    <div class="welcome-block">
      <p class="ledger-label">Overview</p>
      <h1>Clients</h1>
      <p class="subtitle">Here clients details will be shown.</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading clients...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="clients.length === 0" class="empty-state-container">
      <div class="empty-state-card">
        <div class="empty-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3>No clients found!</h3>
        <p>Looks like you're just getting started. Begin by adding new clients to manage your sales.</p>
        <button type="button" @click="addClient()" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Client
        </button>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <div class="table-head">
        <h2>All Clients</h2>
        <button type="button" @click="addClient()" class="btn-primary">add client</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Gender</th>
            <th>Company Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id ?? ''">
            <td class="mono">{{ client.id }}</td>
            <td>
              <router-link :to="`/clients/${client.id}`" class="client-link">
                {{ client.name }}
              </router-link>
            </td>
            <td class="mono">{{ client.email }}</td>
            <td>{{ client.phone }}</td>
            <td>
              <span class="status-pill" :class="client.gender?.toLowerCase()">
                {{ client.gender }}
              </span>
            </td>
            <td>
              <span class="mono" :class="client.company_name?.toLowerCase()">
                {{ client.company_name }}
              </span>
            </td>
            <!-- action button logic will come here -->
            <td class="action-cell">
              <div class="action-wrapper">
                <button @click="activeClientId = activeClientId === client.id ? null : client.id"
                  class="btn-action-trigger" type="button">
                  Action
                  <svg class="chevron-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                <!-- Backdrop to close dropdown when clicking outside -->
                <div v-if="activeClientId === client.id" class="dropdown-backdrop" @click="activeClientId = null"></div>

                <!-- Dropdown Menu -->
                <div v-if="activeClientId === client.id" class="actions-dropdown">
                  <button type="button" class="dropdown-item view-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                  </button>
                  <button type="button" @click="editClient(client)" class="dropdown-item edit-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button @click="deleteClient(client.id)" type="button" class="dropdown-item delete-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import api from '@/services/ApiService';
import ClientDrawer from '@/components/ClientDrawer.vue';

interface client {
  id: number | null
  name: string | null
  email: string | null
  phone: string | null
  gender: string | null
  company_name?: string | null
}

const clients = ref<client[]>([])
const activeClientId = ref<number | null>(null)
const selectedClient = ref<client | null>(null)
const showAddClient = ref(false)
const isLoading = ref(true)

const fetchClient = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/clients')
    console.log("response", response)
    console.log("client details.data", response.data.data)
    clients.value = response.data.data;
  }
  catch (error) {
    console.log(error)
  } finally {
    isLoading.value = false
  }
}

const deleteClient = async (id: number | null) => {
  if (id === null) return
  try {
    console.log("delete button clicked", id)
    const response = await api.delete(`/clients/${id}`)
    console.log("delete response", response)
    await fetchClient()
  }
  catch (e) {
    console.log(e)
  }
}

const addClient = () => {
  console.log("add client btn clicked")
  selectedClient.value = null
  showAddClient.value = true
}

const editClient = (client: client) => {
  console.log("edit client btn clicked", client)
  selectedClient.value = client
  showAddClient.value = true
}

const closeDrawer = () => {
  showAddClient.value = false
  selectedClient.value = null
}

watch(activeClientId, (newValue) => {
  console.log('activeClientId changed to:', newValue)
})

onMounted(() => {
  console.log("this is done in onmount method")
  fetchClient()
})
</script>




<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.clients-view {
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
  color: #6b7280;
  margin: 0 0 6px;
}

.welcome-block h1 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 32px;
  margin: 0 0 6px;
  color: #14171c;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

/* Table */
.table-container {
  background: #ffffff;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
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
  color: #14171c;
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
  color: #6b7280;
  font-weight: 500;
  padding: 10px 12px;
  border-bottom: 1.5px solid #e4e1d8;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid #e4e1d8;
  font-size: 14px;
  color: #14171c;
}

td.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  color: #6b7280;
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

.status-pill.male {
  background: #e7f0ed;
  color: #0a4638;
}

.status-pill.female {
  background: #f6ecd9;
  color: #b8872f;
}

.status-pill.other {
  background: #ece9e2;
  color: #6b7280;
}

.client-link {
  color: #0e5c4a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.client-link:hover {
  color: #0a4638;
  text-decoration: underline;
}

/* Form styles */
.form-container {
  background: #ffffff;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  padding: 32px;
  margin-bottom: 32px;
}

.form-container h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 24px;
  margin-top: 0;
  margin-bottom: 24px;
  color: #14171c;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 20px;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row.full-width {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-row.full-width {
    grid-column: span 1;
  }
}

.form-row label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
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
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  cursor: pointer;
  color: #6b7280;
  transition: 0.2s ease;
}

.pill input {
  display: none;
}

.pill.active {
  background: #e7f0ed;
  border-color: #0e5c4a;
  color: #0a4638;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-secondary {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #6b7280;
  background: transparent;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #ece9e2;
  color: #14171c;
}

/* Actions Cell & Dropdown Styles */
.action-cell {
  position: relative;
  text-align: left;
  width: 120px;
}

.action-wrapper {
  position: relative;
  display: inline-block;
}

.btn-action-trigger {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 6px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-action-trigger:hover {
  background: var(--forest-soft);
  color: var(--forest-dark);
  border-color: var(--forest);
}

.chevron-icon {
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.btn-action-trigger:hover .chevron-icon {
  opacity: 1;
  transform: translateY(1px);
}

/* Backdrop to catch clicks outside the dropdown */
.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: transparent;
}

/* Dropdown Card */
.actions-dropdown {
  position: absolute;
  left: 0;
  top: calc(100% + 4px);
  z-index: 100;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(20, 23, 28, 0.08);
  padding: 4px 0;
  min-width: 120px;
  display: flex;
  flex-direction: column;
}

/* Dropdown Menu Items */
.dropdown-item {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  background: transparent;
  border: none;
  padding: 8px 14px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease;
}

.dropdown-item svg {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.dropdown-item:hover svg {
  opacity: 1;
}

/* View option */
.dropdown-item.view-btn:hover {
  background: var(--forest-soft);
  color: var(--forest-dark);
}

/* Edit option */
.dropdown-item.edit-btn:hover {
  background: var(--gold-soft);
  color: var(--gold);
}

/* Delete option */
.dropdown-item.delete-btn:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

/* Empty State Styles */
.empty-state-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 24px;
  background: #ffffff;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
}

.empty-state-card {
  text-align: center;
  max-width: 420px;
}

.empty-icon-wrapper {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--forest-soft);
  color: var(--forest);
  margin-bottom: 24px;
}

.empty-state-card h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 10px;
}

.empty-state-card p {
  font-size: 14px;
  color: var(--slate);
  line-height: 1.6;
  margin: 0 0 24px;
}

/* Loading State & Spinner */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--line);
  border-top-color: var(--forest);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
