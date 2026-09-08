<template>
  <div class="invoices-view">
    <!-- Top Navigation Header -->
    <div class="nav-header">
      <router-link to="/dashboard" class="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Dashboard
      </router-link>
      <div class="breadcrumb">
        <router-link to="/invoices" class="breadcrumb-link">Invoices</router-link>
        <span class="sep">/</span>
        <span class="current">New Invoice</span>
      </div>
    </div>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Billing & Invoicing</p>
        <h1 class="page-title">New Invoice</h1>
      </div>
    </div>

    <!-- Main Invoice Card -->
    <div class="card invoice-card">
      <!-- Section: Invoice Details -->
      <div class="invoice-section">
        <h3 class="section-heading">Invoice Details</h3>
        
        <div class="form-row">
          <!-- Client Selector -->
          <div class="form-group col">
            <label class="form-label">Client</label>
            <div class="select-input-wrapper">
              <select v-model="payload.clientId" class="form-select">
                <option value="" disabled selected>Select client...</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Invoice Number -->
          <div class="form-group col">
            <label class="form-label">Invoice Number</label>
            <input 
              type="text" 
              v-model="payload.invoice_number" 
              class="form-input" 
              placeholder="e.g. INV-0012" 
            />
          </div>

          <!-- Due Date -->
          <div class="form-group col">
            <label class="form-label">Due Date</label>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                v-model="payload.dueDate" 
                class="form-input date-input" 
              />
              <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Section: Line Items -->
      <div class="invoice-section">
        <div class="line-header">
          <div>
            <h3 class="section-heading">Line Items</h3>
            <p class="section-subtitle">Specify descriptions, hours/quantities, and unit pricing.</p>
          </div>

          <button type="button" class="btn-secondary" @click="addLineItem()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Item
          </button>
        </div>

        <!-- Integrated Line Items Table -->
        <div class="table-scroll-wrapper items-table-wrapper">
          <table class="ledger-table items-table">
            <thead>
              <tr>
                <th class="col-desc">Description</th>
                <th class="col-qty text-center">Qty</th>
                <th class="col-price">Unit Price (₹)</th>
                <th class="col-amount text-right">Amount (₹)</th>
                <th class="col-action text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in payload.lineItems" 
                :key="index" 
                class="table-row-item"
              >
                <!-- Description -->
                <td class="col-desc">
                  <input 
                    type="text" 
                    class="table-input" 
                    placeholder="Item or service description..." 
                    v-model="item.description" 
                  />
                </td>

                <!-- Quantity -->
                <td class="col-qty">
                  <input 
                    type="number" 
                    min="1" 
                    class="table-input text-center" 
                    v-model.number="item.quantity" 
                  />
                </td>

                <!-- Unit Price -->
                <td class="col-price">
                  <div class="price-input-wrapper">
                    <span class="currency-prefix">₹</span>
                    <input 
                      type="number" 
                      min="0" 
                      class="table-input price-input" 
                      v-model.number="item.unitPrice" 
                    />
                  </div>
                </td>

                <!-- Amount -->
                <td class="col-amount text-right">
                  <span class="amount-mono">₹{{ ((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString() }}</span>
                </td>

                <!-- Action Button -->
                <td class="col-action text-center">
                  <button 
                    v-if="payload.lineItems.length > 1"
                    type="button" 
                    class="btn-row-delete" 
                    @click="removeLineItem(index)"
                    title="Remove line item"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Bottom Grid: Notes & Summary -->
      <div class="invoice-bottom-grid">
        <!-- Notes -->
        <div class="form-group notes-group">
          <label class="form-label">Notes & Terms (Optional)</label>
          <textarea 
            v-model="payload.notes" 
            class="form-textarea" 
            placeholder="Payment instructions, bank wire details, or thank-you note..."
            rows="4"
          ></textarea>
        </div>

        <!-- Total Calculation Card -->
        <div class="invoice-summary-box">
          <div class="summary-line">
            <span class="summary-title">Subtotal</span>
            <span class="summary-num">₹{{ total.toLocaleString() }}</span>
          </div>
          <div class="summary-line">
            <span class="summary-title">Tax (0%)</span>
            <span class="summary-num">₹0</span>
          </div>
          <div class="summary-hr"></div>
          <div class="summary-line total-line">
            <span class="total-title">Total Due</span>
            <span class="total-num">₹{{ total.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Footer Actions -->
      <div class="invoice-footer-actions">
        <router-link to="/dashboard" class="btn-secondary">
          Cancel
        </router-link>
        <button type="button" class="btn-primary" @click="createInvoice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Create Invoice
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/services/ApiService'

interface LineItem {
  description: string
  quantity: number
  unitPrice: number
}

interface Client {
  id: number | string
  name: string
}

const clients = ref<Client[]>([])

const payload = ref({
  clientId: '',
  invoice_number: '',
  dueDate: '',
  notes: '',
  lineItems: [
    { description: '', quantity: 1, unitPrice: 0 }
  ] as LineItem[]
})

const total = computed(() => {
  return payload.value.lineItems.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unitPrice || 0))
  }, 0)
})

const getclients = async () => {
  try {
    const res = await api.get('/clients')
    clients.value = res?.data?.data?.map((client: any) => ({
      name: client.name,
      id: client.id
    })) || []
  } catch (error) {
    console.error('Failed to load clients', error)
  }
}

function addLineItem() {
  payload.value.lineItems.push({ description: '', quantity: 1, unitPrice: 0 })
}

const removeLineItem = (index: number) => {
  if (payload.value.lineItems.length > 1) {
    payload.value.lineItems.splice(index, 1)
  }
}

const createInvoice = () => {
  console.log('invoice created ...', payload.value)
}

onMounted(() => {
  getclients()
})
</script>

<style scoped>
.invoices-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 var(--space-2xl);
}

.page-header {
  margin-bottom: var(--space-lg);
}

.page-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: var(--text-2xl);
  margin: 0;
  color: var(--ink, #14171c);
}

.invoice-card {
  padding: var(--space-xl);
}

.invoice-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.section-heading {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.section-subtitle {
  font-size: var(--text-xs);
  color: var(--slate);
  margin: var(--space-xs) 0 0;
}

.section-divider {
  height: 1px;
  background: var(--line);
  margin: var(--space-lg) 0;
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Integrated Table Wrapper */
.items-table-wrapper {
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: #ffffff;
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  padding: 10px 14px;
  background: #faf8f3;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--slate);
  border-bottom: 1px solid var(--line);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.items-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.items-table tbody tr:hover {
  background: #fdfcf9;
}

.col-desc {
  width: auto;
}

.col-qty {
  width: 90px;
}

.col-price {
  width: 150px;
}

.col-amount {
  width: 130px;
}

.col-action {
  width: 44px;
}

/* Cell Inputs */
.table-input {
  width: 100%;
  height: 36px;
  padding: 6px 10px;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-sm, 4px);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--ink);
  outline: none;
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.table-input:focus {
  background: #ffffff;
  border-color: var(--forest);
  box-shadow: 0 0 0 2px var(--forest-soft);
}

.price-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 10px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--slate);
  pointer-events: none;
}

.price-input {
  padding-left: 22px;
}

.amount-mono {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
  display: block;
}

.btn-row-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm, 4px);
  border: none;
  background: transparent;
  color: var(--slate);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-row-delete:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Bottom Grid Layout */
.invoice-bottom-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: var(--space-xl);
  align-items: flex-start;
}

.invoice-summary-box {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--slate);
}

.summary-num {
  font-family: var(--font-mono);
  color: var(--ink);
  font-weight: 500;
}

.summary-hr {
  height: 1px;
  background: var(--line);
  margin: var(--space-xs) 0;
}

.total-line {
  padding-top: var(--space-xs);
}

.total-title {
  font-size: var(--text-base);
  color: var(--ink);
  font-weight: 600;
}

.total-num {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  color: var(--forest);
  font-weight: 700;
}

.invoice-footer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-md);
}

@media (max-width: 768px) {
  .invoice-bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
