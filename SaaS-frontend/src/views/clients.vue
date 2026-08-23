<template>
  <div class="clients-view">
    <!-- Client Form Drawer component -->
    <ClientDrawer 
      :is-open="showAddClient"
      :client="selectedClient"
      @close="closeDrawer"
      @saved="fetchClient"
    />

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Overview</p>
        <h1 class="page-title">Clients Directory</h1>
        <p class="subtitle">Manage client profiles, contact details, and account records.</p>
      </div>
      <button type="button" @click="addClient()" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Client
      </button>
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

    <!-- Main Table Container Card -->
    <div v-else class="table-container">
      <!-- Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <h2>All Clients</h2>
          <span class="count-badge">{{ filteredClients.length }} total</span>
        </div>
        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search clients..." 
              class="search-input"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
          </div>
        </div>
      </div>

      <!-- No Search Results -->
      <div v-if="filteredClients.length === 0" class="no-search-results">
        <p>No clients match your query "<strong>{{ searchQuery }}</strong>"</p>
        <button class="btn-secondary" @click="searchQuery = ''">Reset Search</button>
      </div>

      <!-- Table Wrapper -->
      <div v-else class="table-scroll-wrapper">
        <table class="clients-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Company</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in filteredClients" :key="client.id ?? ''">
              <td>
                <div class="client-profile-cell">
                  <div class="avatar-sm">{{ getInitials(client.name) }}</div>
                  <router-link :to="`/clients/${client.id}`" class="client-link">
                    {{ client.name || 'Unnamed Client' }}
                  </router-link>
                </div>
              </td>
              <td>
                <span class="id-tag">#{{ client.id }}</span>
              </td>
              <td class="mono email-cell">
                {{ client.email || '—' }}
              </td>
              <td class="phone-cell">
                {{ client.phone || '—' }}
              </td>
              <td>
                <span class="status-pill" :class="client.gender?.toLowerCase() || 'other'">
                  {{ client.gender || '—' }}
                </span>
              </td>
              <td>
                <span class="company-tag">
                  {{ client.company_name || '—' }}
                </span>
              </td>
              <td class="action-cell text-right">
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
                    <router-link :to="`/clients/${client.id}`" class="dropdown-item view-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </router-link>
                    <button type="button" @click="editClient(client); activeClientId = null;" class="dropdown-item edit-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </button>
                    <button @click="deleteClient(client.id); activeClientId = null;" type="button" class="dropdown-item delete-btn">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
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
const searchQuery = ref('')

const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) return clients.value
  const q = searchQuery.value.toLowerCase().trim()
  return clients.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.email && c.email.toLowerCase().includes(q)) ||
    (c.company_name && c.company_name.toLowerCase().includes(q)) ||
    (c.phone && c.phone.includes(q))
  )
})

const getInitials = (name: string | null) => {
  if (!name) return 'CL'
  const parts = name.trim().split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const fetchClient = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/clients')
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
    await api.delete(`/clients/${id}`)
    await fetchClient()
  }
  catch (e) {
    console.log(e)
  }
}

const addClient = () => {
  selectedClient.value = null
  showAddClient.value = true
}

const editClient = (client: client) => {
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
  fetchClient()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.clients-view {
  width: 100%;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-title {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 28px;
  margin: 0 0 4px;
  color: var(--ink, #14171c);
}

.subtitle {
  color: var(--slate, #6b7280);
  font-size: 14px;
  margin: 0;
}

.ledger-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  margin: 0 0 6px;
}

/* Table Card Container */
.table-container {
  background: #ffffff;
  border: 1px solid #e4e1d8;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(20, 23, 28, 0.03);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-left h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 20px;
  margin: 0;
  color: #14171c;
}

.count-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
  padding: 3px 9px;
  border-radius: 999px;
  font-weight: 500;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--slate, #6b7280);
  pointer-events: none;
}

.search-input {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 7px 28px 7px 30px;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  outline: none;
  background: #ffffff;
  color: #14171c;
  width: 220px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #0e5c4a;
  width: 260px;
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
}

.no-search-results {
  text-align: center;
  padding: 48px 16px;
  color: var(--slate, #6b7280);
}

.no-search-results p {
  margin-bottom: 12px;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table th {
  text-align: left;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 500;
  padding: 12px 14px;
  border-bottom: 1.5px solid #e4e1d8;
  background: #fcfbf8;
}

.clients-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e4e1d8;
  font-size: 14px;
  color: #14171c;
  vertical-align: middle;
}

.clients-table tr:hover td {
  background: rgba(14, 92, 74, 0.025);
}

/* Client Profile Cell */
.client-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e7f0ed;
  color: #0e5c4a;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(14, 92, 74, 0.15);
}

.client-link {
  color: #14171c;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s ease;
}

.client-link:hover {
  color: #0e5c4a;
  text-decoration: underline;
}

.id-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #6b7280;
  background: #f3f1ec;
  padding: 2px 6px;
  border-radius: 3px;
}

.company-tag {
  font-size: 13px;
  color: #14171c;
}

.text-right {
  text-align: right;
}

.status-pill {
  display: inline-block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: capitalize;
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

/* Actions Cell & Dropdown Styles */
.action-cell {
  position: relative;
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
  color: #6b7280;
  background: transparent;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  padding: 6px 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-action-trigger:hover {
  background: #e7f0ed;
  color: #0a4638;
  border-color: #0e5c4a;
}

.chevron-icon {
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.btn-action-trigger:hover .chevron-icon {
  opacity: 1;
  transform: translateY(1px);
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: transparent;
}

.actions-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 100;
  background: #ffffff;
  border: 1px solid #e4e1d8;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(20, 23, 28, 0.08);
  padding: 4px 0;
  min-width: 120px;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #14171c;
  background: transparent;
  border: none;
  padding: 8px 14px;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.dropdown-item svg {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.dropdown-item:hover svg {
  opacity: 1;
}

.dropdown-item.view-btn:hover {
  background: #e7f0ed;
  color: #0a4638;
}

.dropdown-item.edit-btn:hover {
  background: #f6ecd9;
  color: #b8872f;
}

.dropdown-item.delete-btn:hover {
  background: #f6e9e7;
  color: #a3372c;
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
  background: #e7f0ed;
  color: #0e5c4a;
  margin-bottom: 24px;
}

.empty-state-card h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  font-weight: 500;
  color: #14171c;
  margin: 0 0 10px;
}

.empty-state-card p {
  font-size: 14px;
  color: #6b7280;
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
  border: 2px solid #e4e1d8;
  border-top-color: #0e5c4a;
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

