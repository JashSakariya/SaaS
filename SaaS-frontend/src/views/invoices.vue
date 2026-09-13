<template>
  <div class="invoices-view">
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal && invoiceToDelete" class="modal-backdrop" @click="showDeleteModal = false">
          <div class="modal-card" @click.stop>
            <div class="modal-header">
              <div class="danger-icon-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
              <h3 class="modal-title">Delete Invoice</h3>
            </div>
            <p class="modal-body-text">
              Are you sure you want to delete invoice <strong>{{ invoiceToDelete.invoiceNumber || invoiceToDelete.invoice_number || `#INV-${invoiceToDelete.id}` }}</strong> for <strong>{{ invoiceToDelete.client?.name || 'this client' }}</strong>? This action will permanently remove all line items.
            </p>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
              <button type="button" class="btn-danger" :disabled="isDeleting" @click="confirmDeleteInvoice">
                {{ isDeleting ? 'Deleting...' : 'Delete Invoice' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Billing & Invoicing</p>
        <h1 class="page-title">Invoices Directory</h1>
        <p class="subtitle">Manage client billing, payment statuses, and issued invoices.</p>
      </div>
      <router-link to="/invoices/new" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Invoice
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading invoices...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="invoices.length === 0" class="empty-state-container">
      <div class="empty-state-card">
        <div class="empty-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3>No invoices found!</h3>
        <p>Looks like you haven't issued any invoices yet. Create your first invoice to bill clients and track payments.</p>
        <router-link to="/invoices/new" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Invoice
        </router-link>
      </div>
    </div>

    <!-- Populated List Content -->
    <div v-else class="invoices-content">
      <!-- Status Filter Pills -->
      <div class="filter-pills-row">
        <button 
          v-for="status in statusFilters" 
          :key="status.value"
          type="button" 
          class="filter-pill"
          :class="{ active: activeStatus === status.value }"
          @click="activeStatus = status.value"
        >
          {{ status.label }}
          <span class="pill-count">{{ getCountByStatus(status.value) }}</span>
        </button>
      </div>

      <!-- Table Container Card -->
      <div class="table-container">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <h2>All Invoices</h2>
            <span class="count-badge">{{ filteredInvoices.length }} total</span>
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
                placeholder="Search invoices..." 
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
            </div>
          </div>
        </div>

        <!-- No Filter / Search Results -->
        <div v-if="filteredInvoices.length === 0" class="no-search-results">
          <p v-if="searchQuery">No invoices match your query "<strong>{{ searchQuery }}</strong>"</p>
          <p v-else>No invoices found with status "<strong>{{ activeStatus }}</strong>"</p>
          <button class="btn-secondary" @click="resetFilters">Reset Filters</button>
        </div>

        <!-- Invoices Table -->
        <div v-else class="table-scroll-wrapper">
          <table class="ledger-table invoices-table">
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>CLIENT</th>
                <th>DUE DATE</th>
                <th>TOTAL AMOUNT</th>
                <th>STATUS</th>
                <th class="text-right action-column">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in filteredInvoices" :key="inv.id" class="table-row">
                <!-- Invoice Number -->
                <td>
                  <div class="invoice-number-cell" @click="openInvoiceDetails(inv)">
                    <span class="invoice-tag">{{ inv.invoiceNumber || inv.invoice_number || `#INV-${inv.id}` }}</span>
                  </div>
                </td>

                <!-- Client -->
                <td>
                  <div class="client-profile-cell">
                    <div class="avatar-sm">{{ getInitials(inv.client?.name) }}</div>
                    <span class="client-name-text">{{ inv.client?.name || 'Unknown Client' }}</span>
                  </div>
                </td>

                <!-- Due Date -->
                <td class="date-cell">
                  {{ formatDate(inv.dueDate || inv.due_date) }}
                </td>

                <!-- Total Amount -->
                <td class="amount-cell">
                  <span class="amount-mono">₹{{ formatAmount(inv.totalAmount ?? inv.total_amount) }}</span>
                </td>

                <!-- Interactive Status Badge / Dropdown -->
                <td>
                  <div class="status-badge-container">
                    <button 
                      type="button" 
                      class="status-pill status-pill-btn" 
                      :class="getStatusClass(inv.status)"
                      @click.stop="toggleStatusMenu($event, inv)"
                      title="Click to update status"
                    >
                      <span>{{ inv.status || 'draft' }}</span>
                      <svg class="status-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- Action Column -->
                <td class="action-cell text-right">
                  <div class="action-wrapper">
                    <button 
                      @click.stop="toggleDropdown($event, inv)"
                      class="btn-action-dots" 
                      :class="{ active: activeInvoiceId === inv.id }"
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
    </div>

    <!-- Status Change Overlay Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="statusMenuInvoiceId !== null" class="dropdown-backdrop" @click="closeStatusMenu"></div>

      <div 
        v-if="statusMenuInvoiceId !== null && statusMenuInvoice" 
        class="actions-dropdown status-menu-dropdown fixed-overlay" 
        :style="statusMenuStyle"
      >
        <div class="dropdown-header-label">Update Status</div>
        <button 
          type="button" 
          class="dropdown-item status-opt draft-opt"
          :class="{ selected: statusMenuInvoice.status === 'draft' }"
          @click="changeStatus(statusMenuInvoice, 'draft')"
        >
          <span class="status-dot draft-dot"></span>
          Draft
        </button>
        <button 
          type="button" 
          class="dropdown-item status-opt sent-opt"
          :class="{ selected: statusMenuInvoice.status === 'sent' }"
          @click="changeStatus(statusMenuInvoice, 'sent')"
        >
          <span class="status-dot sent-dot"></span>
          Sent
        </button>
        <button 
          type="button" 
          class="dropdown-item status-opt paid-opt"
          :class="{ selected: statusMenuInvoice.status === 'paid' }"
          @click="changeStatus(statusMenuInvoice, 'paid')"
        >
          <span class="status-dot paid-dot"></span>
          Paid
        </button>
      </div>
    </Teleport>

    <!-- Actions Overlay Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="activeInvoiceId !== null" class="dropdown-backdrop" @click="closeDropdown"></div>

      <div 
        v-if="activeInvoiceId !== null && activeInvoice" 
        class="actions-dropdown fixed-overlay" 
        :style="dropdownStyle"
      >
        <button 
          type="button" 
          @click="openInvoiceDetails(activeInvoice); closeDropdown();" 
          class="dropdown-item view-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          View Details
        </button>

        <router-link 
          :to="`/invoices/edit/${activeInvoice.id}`" 
          class="dropdown-item edit-btn"
          @click="closeDropdown"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </router-link>

        <button 
          type="button" 
          @click="downloadPdf(activeInvoice); closeDropdown();" 
          class="dropdown-item download-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download PDF
        </button>


        <button 
          type="button" 
          @click="openDeleteConfirm(activeInvoice); closeDropdown();" 
          class="dropdown-item delete-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>
      </div>
    </Teleport>

    <!-- Invoice Details Preview Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal && selectedInvoice" class="modal-backdrop" @click="showDetailsModal = false">
        <div class="modal-card invoice-preview-modal" @click.stop>
          <div class="modal-header-actions">
            <span class="preview-badge">Invoice Preview</span>
            <div class="modal-actions-right">
              <button 
                type="button" 
                class="btn-secondary btn-sm" 
                @click="downloadPdf(selectedInvoice)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PDF
              </button>
              <router-link :to="`/invoices/edit/${selectedInvoice.id}`" class="btn-secondary btn-sm" @click="showDetailsModal = false">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </router-link>
              <button type="button" class="btn-close-modal" @click="showDetailsModal = false">×</button>
            </div>
          </div>

          <!-- Document Sheet (Matches Mockup) -->
          <div class="invoice-document-sheet">
            <!-- Sheet Header -->
            <div class="doc-header">
              <div class="doc-brand">
                <h2 class="brand-title">Business Name</h2>
                <p class="brand-contact">&nbsp; +91 9876543210</p>
              </div>
              <div class="doc-invoice-meta">
                <h1 class="doc-invoice-heading">INVOICE</h1>
                <p class="doc-invoice-num">{{ selectedInvoice.invoiceNumber || selectedInvoice.invoice_number || `#INV-${selectedInvoice.id}` }}</p>
              </div>
            </div>

            <div class="doc-divider-thick"></div>

            <!-- Billed To & Invoice Details Grid -->
            <div class="doc-parties-grid">
              <div class="doc-party-col">
                <span class="doc-section-label">BILLED TO</span>
                <p class="doc-client-name">{{ selectedInvoice.client?.name || 'Valued Client' }}</p>
                <p v-if="selectedInvoice.client?.company_name" class="doc-client-company">{{ selectedInvoice.client?.company_name }}</p>
                <p v-if="selectedInvoice.client?.email" class="doc-client-email">{{ selectedInvoice.client?.email }}</p>
              </div>

              <div class="doc-details-col">
                <span class="doc-section-label">INVOICE DETAILS</span>
                <div class="doc-detail-row">
                  <span class="detail-label">Issue date:</span>
                  <span class="detail-val">{{ formatDate(selectedInvoice.createdAt || selectedInvoice.created_at) }}</span>
                </div>
                <div class="doc-detail-row">
                  <span class="detail-label">Due date:</span>
                  <span class="detail-val">{{ formatDate(selectedInvoice.dueDate || selectedInvoice.due_date) }}</span>
                </div>
                <div class="doc-detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-val capitalize">{{ selectedInvoice.status || 'draft' }}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="doc-items-table">
              <thead>
                <tr>
                  <th class="col-desc">DESCRIPTION</th>
                  <th class="col-qty text-center">QTY</th>
                  <th class="col-price text-right">UNIT PRICE</th>
                  <th class="col-amount text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedInvoice.lineItems" :key="item.id">
                  <td class="col-desc">{{ item.description }}</td>
                  <td class="col-qty text-center">{{ item.quantity }}</td>
                  <td class="col-price text-right font-mono">₹{{ formatAmount(item.unitPrice ?? item.unit_price) }}</td>
                  <td class="col-amount text-right font-mono font-semibold">₹{{ formatAmount(item.amount) }}</td>
                </tr>
                <tr v-if="!selectedInvoice.lineItems || selectedInvoice.lineItems.length === 0">
                  <td colspan="4" class="text-center text-slate py-4">No line items</td>
                </tr>
              </tbody>
            </table>

            <!-- Summary Calculations -->
            <div class="doc-summary-container">
              <div class="doc-summary-box">
                <div class="doc-summary-line">
                  <span>Subtotal</span>
                  <span class="font-mono">₹{{ formatAmount(selectedInvoice.totalAmount ?? selectedInvoice.total_amount) }}</span>
                </div>
                <div class="doc-summary-line">
                  <span>Tax (0%)</span>
                  <span class="font-mono">₹0.00</span>
                </div>
                <div class="doc-divider-thin"></div>
                <div class="doc-summary-line doc-total-due">
                  <span>Total Due</span>
                  <span class="font-mono doc-total-num">₹{{ formatAmount(selectedInvoice.totalAmount ?? selectedInvoice.total_amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Footer Notes -->
            <div class="doc-notes-footer">
              <p>Note : {{ selectedInvoice.notes || 'Payment due within 15 days of receipt. Thank you for your business.' }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/services/ApiService'
import { useToast } from 'vue-toastification'

const toast = useToast()

interface LineItem {
  id?: number
  description: string
  quantity: number
  unitPrice?: number
  unit_price?: number
  amount: number
}

interface Client {
  id: number
  name: string
  company_name?: string
  companyName?: string
  email?: string
}

interface Invoice {
  id: number
  clientId?: number
  client_id?: number
  invoiceNumber?: string
  invoice_number?: string
  dueDate?: string
  due_date?: string
  status: 'draft' | 'sent' | 'paid'
  totalAmount?: number
  total_amount?: number
  notes?: string
  client?: Client
  lineItems?: LineItem[]
  createdAt?: string
  created_at?: string
}

const invoices = ref<Invoice[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeStatus = ref('all')

const statusFilters = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
]

// Actions dropdown state
const activeInvoiceId = ref<number | null>(null)
const activeInvoice = ref<Invoice | null>(null)
const activeTriggerEl = ref<HTMLElement | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

// Status dropdown state
const statusMenuInvoiceId = ref<number | null>(null)
const statusMenuInvoice = ref<Invoice | null>(null)
const statusTriggerEl = ref<HTMLElement | null>(null)
const statusMenuStyle = ref<Record<string, string>>({})

// Details modal state
const showDetailsModal = ref(false)
const selectedInvoice = ref<Invoice | null>(null)

// Delete modal state
const showDeleteModal = ref(false)
const invoiceToDelete = ref<Invoice | null>(null)
const isDeleting = ref(false)

const fetchInvoices = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/invoices')
    if (res.data?.data) {
      invoices.value = res.data.data
    }
  } catch (error) {
    console.error('Failed to load invoices:', error)
    toast.error('Failed to load invoices')
  } finally {
    isLoading.value = false
  }
}

const getCountByStatus = (status: string) => {
  if (status === 'all') return invoices.value.length
  return invoices.value.filter(inv => (inv.status || 'draft').toLowerCase() === status.toLowerCase()).length
}

const filteredInvoices = computed(() => {
  let list = invoices.value

  if (activeStatus.value !== 'all') {
    list = list.filter(inv => (inv.status || 'draft').toLowerCase() === activeStatus.value.toLowerCase())
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(inv => {
      const invNum = (inv.invoiceNumber || inv.invoice_number || '').toLowerCase()
      const clientName = (inv.client?.name || '').toLowerCase()
      const status = (inv.status || '').toLowerCase()
      return invNum.includes(q) || clientName.includes(q) || status.includes(q)
    })
  }

  return list
})

const resetFilters = () => {
  activeStatus.value = 'all'
  searchQuery.value = ''
}

const getInitials = (name?: string | null) => {
  if (!name) return 'CL'
  const parts = name.trim().split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatAmount = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.00'
  return Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getStatusClass = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'completed'
    case 'sent':
      return 'in_progress'
    case 'draft':
    default:
      return 'todo'
  }
}

// Status change logic
const toggleStatusMenu = (event: MouseEvent, inv: Invoice) => {
  if (statusMenuInvoiceId.value === inv.id) {
    closeStatusMenu()
    return
  }
  closeDropdown()
  statusTriggerEl.value = event.currentTarget as HTMLElement
  statusMenuInvoice.value = inv
  statusMenuInvoiceId.value = inv.id
  updateStatusMenuPosition()
}

const closeStatusMenu = () => {
  statusMenuInvoiceId.value = null
  statusMenuInvoice.value = null
  statusTriggerEl.value = null
}

const updateStatusMenuPosition = () => {
  if (!statusTriggerEl.value || statusMenuInvoiceId.value === null) return
  const rect = statusTriggerEl.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeStatusMenu()
    return
  }

  const dropdownHeight = 135
  const dropdownWidth = 130
  const spaceBelow = window.innerHeight - rect.bottom

  let topPos: string
  const leftPos = `${Math.max(10, rect.left)}px`

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    topPos = `${rect.top - dropdownHeight - 4}px`
  } else {
    topPos = `${rect.bottom + 4}px`
  }

  statusMenuStyle.value = {
    position: 'fixed',
    top: topPos,
    left: leftPos,
    minWidth: `${dropdownWidth}px`,
    zIndex: '10000',
  }
}

const changeStatus = async (inv: Invoice, newStatus: 'draft' | 'sent' | 'paid') => {
  if (inv.status === newStatus) {
    closeStatusMenu()
    return
  }

  const oldStatus = inv.status
  inv.status = newStatus
  closeStatusMenu()

  try {
    const res = await api.patch(`/invoices/${inv.id}/status`, { status: newStatus })
    if (res.data?.data) {
      Object.assign(inv, res.data.data)
    }
    toast.success(`Status updated to "${newStatus}"`)
  } catch (error) {
    inv.status = oldStatus
    console.error('Failed to update status:', error)
    toast.error('Failed to update status')
  }
}

// Details modal logic
const openInvoiceDetails = async (inv: Invoice) => {
  try {
    const res = await api.get(`/invoices/${inv.id}`)
    selectedInvoice.value = res.data?.data || inv
  } catch (error) {
    console.error('Failed to load invoice details:', error)
    selectedInvoice.value = inv
  }
  showDetailsModal.value = true
}

// Actions dropdown logic
const closeDropdown = () => {
  activeInvoiceId.value = null
  activeInvoice.value = null
  activeTriggerEl.value = null
}

const updateDropdownPosition = () => {
  if (!activeTriggerEl.value || activeInvoiceId.value === null) return
  const rect = activeTriggerEl.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeDropdown()
    return
  }

  const dropdownHeight = 150
  const dropdownWidth = 150
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
    zIndex: '10000',
  }
}

const toggleDropdown = (event: MouseEvent, inv: Invoice) => {
  if (activeInvoiceId.value === inv.id) {
    closeDropdown()
    return
  }
  closeStatusMenu()
  activeTriggerEl.value = event.currentTarget as HTMLElement
  activeInvoice.value = inv
  activeInvoiceId.value = inv.id
  updateDropdownPosition()
}

// PDF Download logic
const downloadPdf = (inv: Invoice | null) => {
  if (!inv || !inv.id) return
  const baseURL = api.defaults.baseURL || 'http://127.0.0.1:3334'
  window.open(`${baseURL}/invoices/${inv.id}/pdf`, '_blank')
}

// Delete logic
const openDeleteConfirm = (inv: Invoice) => {
  invoiceToDelete.value = inv
  showDeleteModal.value = true
}

const confirmDeleteInvoice = async () => {
  if (!invoiceToDelete.value) return
  const id = invoiceToDelete.value.id
  isDeleting.value = true

  try {
    await api.delete(`/invoices/${id}`)
    invoices.value = invoices.value.filter(i => i.id !== id)
    toast.success('Invoice deleted successfully')
    showDeleteModal.value = false
    invoiceToDelete.value = null
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    toast.error('Failed to delete invoice')
  } finally {
    isDeleting.value = false
  }
}

const handleScrollOrResize = () => {
  if (activeInvoiceId.value !== null) {
    updateDropdownPosition()
  }
  if (statusMenuInvoiceId.value !== null) {
    updateStatusMenuPosition()
  }
}

onMounted(() => {
  fetchInvoices()
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>

<style scoped>
.invoices-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 var(--space-2xl);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  gap: var(--space-md);
}

.page-title {
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

/* Filter Pills */
.filter-pills-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.filter-pill {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  padding: 6px var(--space-md);
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--transition-fast, 0.15s ease);
}

.filter-pill:hover {
  background: var(--paper, #fbfaf6);
  color: var(--ink, #14171c);
  border-color: var(--line-strong, #d8d4c8);
}

.filter-pill.active {
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  border-color: var(--forest, #0e5c4a);
  font-weight: 600;
}

.filter-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.pill-count {
  background: var(--slate-soft, #f1efe9);
  color: var(--slate, #6b7280);
  padding: 1px 6px;
  border-radius: 9999px;
  font-size: 10px;
  font-family: var(--font-mono);
}

/* Invoice Number Cell */
.invoice-number-cell {
  cursor: pointer;
}

.invoice-tag {
  font-family: var(--font-mono, monospace);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--forest, #0e5c4a);
  background: var(--forest-soft, #e7f0ed);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm, 4px);
  border: 1px solid rgba(14, 92, 74, 0.15);
  display: inline-block;
  transition: all var(--transition-fast);
}

.invoice-number-cell:hover .invoice-tag {
  background: #d8eae3;
  border-color: var(--forest);
}

/* Client Profile Cell */
.client-profile-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.avatar-sm {
  width: var(--space-xl);
  height: var(--space-xl);
  border-radius: 50%;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: var(--text-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(14, 92, 74, 0.15);
}

.client-name-text {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--ink, #14171c);
}

.date-cell {
  color: var(--slate, #6b7280);
  font-size: var(--text-sm);
}

.amount-cell {
  font-family: var(--font-mono);
}

.amount-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
}

.text-forest {
  color: var(--forest, #0e5c4a) !important;
}

.font-semibold {
  font-weight: 600;
}

.text-slate {
  color: var(--slate);
}

/* Interactive Status Pill Button */
.status-badge-container {
  display: inline-block;
}

.status-pill-btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all var(--transition-fast);
}

.status-pill-btn:hover {
  filter: brightness(0.92);
  transform: translateY(-1px);
}

.status-chevron {
  opacity: 0.6;
}

/* Status Menu Dropdown */
.status-menu-dropdown {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-header-label {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--slate);
  text-transform: uppercase;
  padding: 4px 8px 6px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 4px;
  letter-spacing: 0.05em;
}

.status-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  padding: 6px 10px;
  border-radius: var(--radius-sm, 4px);
  border: none;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}

.status-opt:hover {
  background: var(--paper, #fbfaf6);
}

.status-opt.selected {
  font-weight: 600;
  background: #f4f2eb;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.draft-dot {
  background: var(--slate, #6b7280);
}

.sent-dot {
  background: var(--info, #0369a1);
}

.paid-dot {
  background: var(--forest, #0e5c4a);
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

/* Invoice Document Preview Modal (Matches Mockup) */
.invoice-preview-modal {
  max-width: 680px;
  width: 95%;
  background: #ffffff;
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-lg) var(--space-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--line, #e4e1d8);
}

.modal-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--line, #e4e1d8);
}

.preview-badge {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--slate);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.modal-actions-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.btn-sm {
  padding: 4px 10px;
  font-size: var(--text-xs);
}

.invoice-document-sheet {
  background: #ffffff;
  padding: var(--space-md) 0;
  font-family: var(--font-body);
  color: #1a1a1a;
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.brand-title {
  font-family: var(--font-body);
  font-size: var(--text-xl);
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.brand-contact {
  font-size: var(--text-xs);
  color: #4b5563;
  margin: 0;
}

.doc-invoice-meta {
  text-align: right;
}

.doc-invoice-heading {
  font-family: var(--font-body);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.04em;
  margin: 0;
}

.doc-invoice-num {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: #4b5563;
  margin: 4px 0 0;
  font-weight: 500;
}

.doc-divider-thick {
  height: 2px;
  background: #111827;
  margin: var(--space-lg) 0;
}

.doc-parties-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
  gap: var(--space-lg);
}

.doc-section-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.doc-client-name {
  font-size: var(--text-sm);
  font-weight: 700;
  color: #111827;
  margin: 0 0 2px;
}

.doc-client-company,
.doc-client-email {
  font-size: var(--text-xs);
  color: #4b5563;
  margin: 0 0 2px;
}

.doc-details-col {
  text-align: right;
}

.doc-detail-row {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  font-size: var(--text-xs);
  margin-bottom: 3px;
}

.detail-label {
  color: #4b5563;
}

.detail-val {
  color: #111827;
  font-weight: 500;
}

.capitalize {
  text-transform: capitalize;
}

/* Document Items Table */
.doc-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-lg);
}

.doc-items-table th {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.05em;
  padding: 8px 10px;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  text-transform: uppercase;
}

.doc-items-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  font-size: var(--text-sm);
  color: #1f2937;
}

/* Document Summary Box */
.doc-summary-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-xl);
}

.doc-summary-box {
  width: 250px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.doc-summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: #4b5563;
}

.doc-divider-thin {
  height: 2px;
  background: #111827;
  margin: 4px 0;
}

.doc-total-due {
  color: #111827;
  font-weight: 700;
  font-size: var(--text-base);
}

.doc-total-num {
  font-size: var(--text-lg);
  font-weight: 800;
  color: #111827;
}

.doc-notes-footer {
  padding-top: var(--space-md);
  border-top: 1px solid #e5e7eb;
  font-size: var(--text-xs);
  color: #6b7280;
  line-height: 1.5;
}

/* Delete Modal Styling */
.danger-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--danger-soft, #f6e9e7);
  color: var(--danger, #a3372c);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: var(--space-sm);
}

.modal-body-text {
  font-size: var(--text-sm);
  color: var(--ink);
  line-height: 1.5;
  margin: var(--space-md) 0 var(--space-lg);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}
</style>
