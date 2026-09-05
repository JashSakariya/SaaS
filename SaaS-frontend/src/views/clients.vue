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
              <th class="text-right action-column">Action</th>
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
                  <button 
                    @click.stop="toggleDropdown($event, client)"
                    class="btn-action-dots" 
                    :class="{ active: activeClientId === client.id }"
                    type="button"
                    aria-label="Actions"
                    title="Actions"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="19" cy="12" r="2"></circle>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Fixed Overlay Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="activeClientId !== null" class="dropdown-backdrop" @click="closeDropdown"></div>

      <div 
        v-if="activeClientId !== null && activeClient" 
        class="actions-dropdown fixed-overlay" 
        :style="dropdownStyle"
      >
        <router-link 
          :to="`/clients/${activeClient.id}`" 
          class="dropdown-item view-btn"
          @click="closeDropdown"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View
        </router-link>
        <button 
          type="button" 
          @click="editClient(activeClient); closeDropdown();" 
          class="dropdown-item edit-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button 
          type="button" 
          @click="deleteClient(activeClient.id); closeDropdown();" 
          class="dropdown-item delete-btn"
        >
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
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
const activeClient = ref<client | null>(null)
const activeTriggerEl = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})
const selectedClient = ref<client | null>(null)
const showAddClient = ref(false)
const isLoading = ref(true)
const searchQuery = ref('')

const closeDropdown = () => {
  activeClientId.value = null
  activeClient.value = null
  activeTriggerEl.value = null
}

const updateDropdownPosition = () => {
  if (!activeTriggerEl.value || activeClientId.value === null) return

  const rect = activeTriggerEl.value.getBoundingClientRect()

  // Close dropdown if trigger button has scrolled out of viewport
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeDropdown()
    return
  }

  const dropdownHeight = 125
  const dropdownWidth = 120
  const spaceBelow = window.innerHeight - rect.bottom

  let topPos: string
  const leftPos = `${Math.max(10, rect.right - dropdownWidth)}px`

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    topPos = `${rect.top - dropdownHeight - 4}px`
  } else {
    topPos = `${rect.bottom + 4}px`
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: topPos,
    left: leftPos,
    minWidth: `${dropdownWidth}px`,
    zIndex: '10000'
  }
}

const toggleDropdown = (event: MouseEvent, clientItem: client) => {
  if (!clientItem || clientItem.id === null) return

  if (activeClientId.value === clientItem.id) {
    closeDropdown()
    return
  }

  const button = event.currentTarget as HTMLElement
  activeTriggerEl.value = button
  activeClient.value = clientItem
  activeClientId.value = clientItem.id

  updateDropdownPosition()
}

const handleScrollOrResize = () => {
  if (activeClientId.value !== null) {
    updateDropdownPosition()
  }
}

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
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
.clients-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 60px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
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
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(14, 92, 74, 0.15);
}

.client-link {
  color: var(--ink, #14171c);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast, 0.15s ease);
}

.client-link:hover {
  color: var(--forest, #0e5c4a);
  text-decoration: underline;
}

.id-tag {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--slate, #6b7280);
  background: #f3f1ec;
  padding: 2px 6px;
  border-radius: 3px;
}

.company-tag {
  font-size: 13px;
  color: var(--ink, #14171c);
}

.action-cell {
  position: relative;
  text-align: right;
  white-space: nowrap;
}

.action-wrapper {
  position: relative;
  display: inline-flex;
  justify-content: flex-end;
}
</style>
