<template>
  <div class="calendar-view">
    <!-- Event Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedEvent" class="modal-backdrop" @click="selectedEvent = null">
          <div class="event-modal-card" @click.stop>
            <div class="modal-header">
              <div class="header-left">
                <span :class="['category-badge', `badge-${selectedEvent.type}`]">
                  <span class="type-dot"></span>
                  {{ selectedEvent.category }}
                </span>
                <span :class="['status-chip', `status-${selectedEvent.status}`]">
                  {{ formatStatus(selectedEvent.status) }}
                </span>
                <span v-if="selectedEvent.isOverdue" class="overdue-tag">
                  Overdue
                </span>
              </div>
              <button class="modal-close-btn" @click="selectedEvent = null" title="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <h2 class="event-title">{{ selectedEvent.title }}</h2>

              <div class="detail-grid">
                <!-- Date Row -->
                <div class="detail-item">
                  <span class="detail-label">Due Date</span>
                  <div class="detail-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{{ formatFullDate(selectedEvent.date) }}</span>
                  </div>
                </div>

                <!-- Client Row -->
                <div class="detail-item">
                  <span class="detail-label">Client</span>
                  <div class="detail-value">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <router-link 
                      v-if="selectedEvent.clientId" 
                      :to="`/client/${selectedEvent.clientId}`"
                      class="client-link"
                    >
                      {{ selectedEvent.clientName || 'General Client' }}
                    </router-link>
                    <span v-else>{{ selectedEvent.clientName || 'General Client' }}</span>
                  </div>
                </div>

                <!-- Task Specific -->
                <template v-if="selectedEvent.type === 'task'">
                  <div class="detail-item" v-if="selectedEvent.projectTitle">
                    <span class="detail-label">Project</span>
                    <div class="detail-value">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>{{ selectedEvent.projectTitle }}</span>
                    </div>
                  </div>

                  <div class="detail-item" v-if="selectedEvent.assignee">
                    <span class="detail-label">Assigned To</span>
                    <div class="detail-value">
                      <span class="avatar-circle">{{ getInitials(selectedEvent.assignee) }}</span>
                      <span>{{ selectedEvent.assignee }}</span>
                      <span v-if="selectedEvent.developerCategory" class="dev-category">
                        ({{ selectedEvent.developerCategory }})
                      </span>
                    </div>
                  </div>
                </template>

                <!-- Project Specific -->
                <template v-if="selectedEvent.type === 'project'">
                  <div class="detail-item full-width" v-if="selectedEvent.metadata">
                    <span class="detail-label">Project Progress</span>
                    <div class="progress-bar-container">
                      <div class="progress-bar-bg">
                        <div 
                          class="progress-bar-fill" 
                          :style="{ width: `${selectedEvent.metadata.progress || 0}%` }"
                        ></div>
                      </div>
                      <span class="progress-text">
                        {{ selectedEvent.metadata.completedTasks || 0 }} of {{ selectedEvent.metadata.totalTasks || 0 }} tasks completed ({{ selectedEvent.metadata.progress || 0 }}%)
                      </span>
                    </div>
                  </div>

                  <div class="detail-item full-width" v-if="selectedEvent.description">
                    <span class="detail-label">Description</span>
                    <p class="description-text">{{ selectedEvent.description }}</p>
                  </div>
                </template>

                <!-- Invoice Specific -->
                <template v-if="selectedEvent.type === 'invoice'">
                  <div class="detail-item">
                    <span class="detail-label">Total Amount</span>
                    <div class="detail-value highlight-amount">
                      ${{ Number(selectedEvent.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    </div>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">Invoice Number</span>
                    <div class="detail-value mono-text">
                      {{ selectedEvent.invoiceNumber }}
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="selectedEvent = null">
                Close
              </button>
              <button type="button" class="btn-primary" @click="navigateToEvent(selectedEvent)">
                Open {{ selectedEvent.category.slice(0, -1) || 'Item' }}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 6px;">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Day Events Modal (when clicking +X more) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedDayEvents" class="modal-backdrop" @click="selectedDayEvents = null">
          <div class="day-events-modal" @click.stop>
            <div class="modal-header">
              <div>
                <p class="ledger-label">Events on this day</p>
                <h3 class="modal-title">{{ formatFullDate(selectedDayEvents.date) }}</h3>
              </div>
              <button class="modal-close-btn" @click="selectedDayEvents = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div class="day-events-list">
              <div 
                v-for="event in selectedDayEvents.events" 
                :key="event.id"
                class="day-event-card"
                :class="`type-card-${event.type}`"
                @click="openEventDetails(event)"
              >
                <div class="day-event-header">
                  <span :class="['category-badge', `badge-${event.type}`]">
                    <span class="type-dot"></span>
                    {{ event.category }}
                  </span>
                  <span :class="['status-chip', `status-${event.status}`]">
                    {{ formatStatus(event.status) }}
                  </span>
                </div>
                <h4 class="day-event-title">{{ event.title }}</h4>
                <div class="day-event-meta">
                  <span>{{ event.clientName }}</span>
                  <span v-if="event.amount" class="event-amount">
                    ${{ Number(event.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </span>
                  <span v-if="event.assignee" class="event-assignee">
                    👤 {{ event.assignee }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Schedule & Milestones</p>
        <h1 class="page-title">Operations Calendar</h1>
        <p class="subtitle">Unified timeline for project deadlines, task due dates, and billing schedules.</p>
      </div>

      <!-- Header Controls -->
      <div class="header-actions">
        <button class="btn-secondary" @click="jumpToToday">
          Today
        </button>

        <div class="month-nav-group">
          <button class="nav-arrow-btn" @click="previousPeriod" title="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="current-period-text">{{ currentPeriodLabel }}</span>
          <button class="nav-arrow-btn" @click="nextPeriod" title="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div class="view-mode-toggle">
          <button 
            type="button" 
            :class="['toggle-btn', { active: currentView === 'month' }]"
            @click="currentView = 'month'"
          >
            Month
          </button>
          <button 
            type="button" 
            :class="['toggle-btn', { active: currentView === 'week' }]"
            @click="currentView = 'week'"
          >
            Week
          </button>
          <button 
            type="button" 
            :class="['toggle-btn', { active: currentView === 'agenda' }]"
            @click="currentView = 'agenda'"
          >
            Agenda
          </button>
        </div>
      </div>
    </div>

    <!-- Stats KPI Cards -->
    <div class="stats-grid">
      <StatCard
        label="Total Scheduled"
        :value="stats.total"
        :loading="isLoading"
        icon-variant="indigo"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </template>
        <template #subtext>
          <span :class="stats.overdue > 0 ? 'highlight-danger' : 'highlight-muted'">
            {{ stats.overdue }} overdue items
          </span>
        </template>
      </StatCard>

      <StatCard
        label="Tasks Due"
        :value="stats.tasks"
        :loading="isLoading"
        icon-variant="forest"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="m9 14 2 2 4-4"></path>
          </svg>
        </template>
        <template #subtext>
          <span class="highlight-forest">Active task queue</span>
        </template>
      </StatCard>

      <StatCard
        label="Projects Milestones"
        :value="stats.projects"
        :loading="isLoading"
        icon-variant="forest"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </template>
        <template #subtext>
          <span class="highlight-muted">Project deadlines</span>
        </template>
      </StatCard>

      <StatCard
        label="Invoices Due"
        :value="stats.invoices"
        :loading="isLoading"
        icon-variant="gold"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </template>
        <template #subtext>
          <span class="highlight-gold">Billing cycles</span>
        </template>
      </StatCard>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="calendar-toolbar">
      <!-- Category Filter Pills -->
      <div class="category-filters">
        <button 
          v-for="cat in categoryFilters" 
          :key="cat.value"
          type="button" 
          class="filter-pill"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          <span v-if="cat.dotColor" class="category-dot" :style="{ backgroundColor: cat.dotColor }"></span>
          {{ cat.label }}
          <span class="pill-count">{{ getCategoryCount(cat.value) }}</span>
        </button>
      </div>

      <!-- Right Search & Quick Filters -->
      <div class="toolbar-right">
        <!-- Status Filter Select -->
        <select v-model="activeStatusFilter" class="status-select">
          <option value="all">All Statuses</option>
          <option value="overdue">⚠️ Overdue Only</option>
          <option value="pending">⏳ Pending / In Progress</option>
          <option value="completed">✓ Completed / Paid</option>
        </select>

        <!-- Search Input -->
        <div class="search-box">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search events, clients..." 
            class="search-input"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading schedule events...</p>
    </div>

    <!-- Calendar Views -->
    <div v-else class="calendar-container-card">
      <!-- 1. MONTH VIEW -->
      <div v-if="currentView === 'month'" class="month-grid-view">
        <!-- Weekday Headers -->
        <div class="weekday-header-row">
          <div v-for="day in weekDayNames" :key="day" class="weekday-header-cell">
            {{ day }}
          </div>
        </div>

        <!-- Days Grid -->
        <div class="month-grid">
          <div 
            v-for="(cell, index) in monthCalendarDays" 
            :key="index"
            class="calendar-day-cell"
            :class="{
              'is-other-month': !cell.isCurrentMonth,
              'is-today': cell.isToday,
              'has-events': cell.events.length > 0
            }"
          >
            <div class="day-cell-header">
              <span class="day-number" :class="{ 'today-badge': cell.isToday }">
                {{ cell.dayNumber }}
              </span>
              <span v-if="cell.events.length > 0" class="day-event-count">
                {{ cell.events.length }}
              </span>
            </div>

            <!-- Events List inside Day Cell -->
            <div class="day-cell-events">
              <div 
                v-for="event in cell.events.slice(0, 3)" 
                :key="event.id"
                class="event-chip"
                :class="[`chip-${event.type}`, { 'chip-overdue': event.isOverdue }]"
                @click.stop="openEventDetails(event)"
                :title="`${event.title} (${event.clientName})`"
              >
                <span class="event-chip-dot"></span>
                <span class="event-chip-title">{{ event.title }}</span>
                <span v-if="event.amount" class="event-chip-amount">
                  ${{ Math.round(event.amount) }}
                </span>
              </div>

              <!-- +More Button -->
              <button 
                v-if="cell.events.length > 3" 
                type="button" 
                class="more-events-btn"
                @click.stop="openDayEvents(cell)"
              >
                +{{ cell.events.length - 3 }} more
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. WEEK VIEW -->
      <div v-else-if="currentView === 'week'" class="week-grid-view">
        <div class="week-columns-grid">
          <div 
            v-for="(day, dIndex) in weekCalendarDays" 
            :key="dIndex"
            class="week-day-column"
            :class="{ 'is-today': day.isToday }"
          >
            <div class="week-column-header">
              <span class="week-day-name">{{ day.dayName }}</span>
              <span class="week-day-number" :class="{ 'today-badge': day.isToday }">
                {{ day.dayNumber }} {{ day.monthShort }}
              </span>
              <span class="column-count-badge">{{ day.events.length }} items</span>
            </div>

            <div class="week-column-events">
              <div v-if="day.events.length === 0" class="empty-column-state">
                No events
              </div>

              <div 
                v-for="event in day.events" 
                :key="event.id"
                class="week-event-card"
                :class="[`card-type-${event.type}`, { 'card-overdue': event.isOverdue }]"
                @click="openEventDetails(event)"
              >
                <div class="card-top-row">
                  <span :class="['category-badge-sm', `badge-${event.type}`]">
                    {{ event.category.slice(0, -1) }}
                  </span>
                  <span :class="['status-chip-sm', `status-${event.status}`]">
                    {{ formatStatus(event.status) }}
                  </span>
                </div>
                <h4 class="week-card-title">{{ event.title }}</h4>
                <div class="week-card-footer">
                  <span class="card-client">{{ event.clientName }}</span>
                  <span v-if="event.amount" class="card-amount">
                    ${{ Number(event.amount).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. AGENDA / LIST VIEW -->
      <div v-else-if="currentView === 'agenda'" class="agenda-view">
        <div v-if="agendaGroupedEvents.length === 0" class="empty-agenda-state">
          <div class="empty-icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>No events found for this period</h3>
          <p>No tasks, project deadlines, or invoice dates match your current filters.</p>
        </div>

        <div v-else class="agenda-timeline">
          <div 
            v-for="group in agendaGroupedEvents" 
            :key="group.date" 
            class="agenda-date-group"
          >
            <div class="agenda-date-header">
              <div class="date-badge" :class="{ 'is-today-badge': group.isToday }">
                <span class="date-day">{{ group.dayNumber }}</span>
                <span class="date-month">{{ group.monthShort }}</span>
              </div>
              <div class="date-header-info">
                <h3 class="date-heading">{{ group.dateLabel }}</h3>
                <span class="group-count">{{ (group.events || []).length }} events scheduled</span>
              </div>
            </div>

            <div class="agenda-events-list">
              <div 
                v-for="event in group.events" 
                :key="event.id"
                class="agenda-event-row"
                :class="[`row-type-${event.type}`, { 'row-overdue': event.isOverdue }]"
                @click="openEventDetails(event)"
              >
                <div class="row-left">
                  <span :class="['category-badge', `badge-${event.type}`]">
                    <span class="type-dot"></span>
                    {{ event.category.slice(0, -1) }}
                  </span>
                  <div class="row-info">
                    <h4 class="row-title">{{ event.title }}</h4>
                    <p class="row-subtext">
                      <span>{{ event.clientName }}</span>
                      <span v-if="event.assignee" class="separator">•</span>
                      <span v-if="event.assignee">Assignee: {{ event.assignee }}</span>
                      <span v-if="event.projectTitle" class="separator">•</span>
                      <span v-if="event.projectTitle">Project: {{ event.projectTitle }}</span>
                    </p>
                  </div>
                </div>

                <div class="row-right">
                  <span v-if="event.amount" class="row-amount">
                    ${{ Number(event.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </span>
                  <span :class="['status-chip', `status-${event.status}`]">
                    {{ formatStatus(event.status) }}
                  </span>
                  <svg class="row-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/ApiService'
import StatCard from '@/components/StatCard.vue'

const router = useRouter()

// View Mode: 'month' | 'week' | 'agenda'
const currentView = ref<'month' | 'week' | 'agenda'>('month')

// State
const isLoading = ref(true)
const rawEvents = ref<any[]>([])
const stats = ref({
  total: 0,
  tasks: 0,
  projects: 0,
  invoices: 0,
  overdue: 0,
})

// Current Date Cursor
const currentDate = ref(new Date())

// Filters
const activeCategory = ref('all')
const activeStatusFilter = ref('all')
const searchQuery = ref('')

// Modals
const selectedEvent = ref<any | null>(null)
const selectedDayEvents = ref<{ date: string; events: any[] } | null>(null)

// Category Filters config
const categoryFilters = [
  { label: 'All Items', value: 'all', dotColor: null },
  { label: 'Tasks', value: 'task', dotColor: '#3b82f6' },
  { label: 'Projects', value: 'project', dotColor: '#0e5c4a' },
  { label: 'Invoices', value: 'invoice', dotColor: '#b8872f' },
]

const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Helpers for Navigation
const currentPeriodLabel = computed(() => {
  const d = currentDate.value
  const monthName = d.toLocaleString('en-US', { month: 'long' })
  const year = d.getFullYear()

  if (currentView.value === 'week') {
    const startOfWeek = getStartOfWeek(d)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return `${monthName} ${year}`
})

const previousPeriod = () => {
  const d = new Date(currentDate.value)
  if (currentView.value === 'month') {
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
  } else if (currentView.value === 'week') {
    d.setDate(d.getDate() - 7)
  } else {
    d.setDate(1)
    d.setMonth(d.getMonth() - 1)
  }
  currentDate.value = d
}

const nextPeriod = () => {
  const d = new Date(currentDate.value)
  if (currentView.value === 'month') {
    d.setDate(1)
    d.setMonth(d.getMonth() + 1)
  } else if (currentView.value === 'week') {
    d.setDate(d.getDate() + 7)
  } else {
    d.setDate(1)
    d.setMonth(d.getMonth() + 1)
  }
  currentDate.value = d
}

const jumpToToday = () => {
  currentDate.value = new Date()
}

// Fetch Events from Backend API
const fetchCalendarEvents = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/calendar/events')
    if (response.data && response.data.success) {
      rawEvents.value = response.data.data.events || []
      stats.value = response.data.data.stats || {
        total: rawEvents.value.length,
        tasks: rawEvents.value.filter((e: any) => e.type === 'task').length,
        projects: rawEvents.value.filter((e: any) => e.type === 'project').length,
        invoices: rawEvents.value.filter((e: any) => e.type === 'invoice').length,
        overdue: rawEvents.value.filter((e: any) => e.isOverdue).length,
      }
    }
  } catch (error) {
    console.error('Failed to fetch calendar events:', error)
  } finally {
    isLoading.value = false
  }
}

// Filtered Events
const filteredEvents = computed(() => {
  let list = rawEvents.value

  // Category filter
  if (activeCategory.value !== 'all') {
    list = list.filter((e) => e.type === activeCategory.value)
  }

  // Status filter
  if (activeStatusFilter.value === 'overdue') {
    list = list.filter((e) => e.isOverdue)
  } else if (activeStatusFilter.value === 'pending') {
    list = list.filter((e) => e.status !== 'completed' && e.status !== 'paid')
  } else if (activeStatusFilter.value === 'completed') {
    list = list.filter((e) => e.status === 'completed' || e.status === 'paid')
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((e) => {
      const titleMatch = (e.title || '').toLowerCase().includes(q)
      const clientMatch = (e.clientName || '').toLowerCase().includes(q)
      const invMatch = (e.invoiceNumber || '').toLowerCase().includes(q)
      const assigneeMatch = (e.assignee || '').toLowerCase().includes(q)
      return titleMatch || clientMatch || invMatch || assigneeMatch
    })
  }

  return list
})

const getCategoryCount = (val: string) => {
  if (val === 'all') return rawEvents.value.length
  return rawEvents.value.filter((e) => e.type === val).length
}

// Month Grid Calculation
const monthCalendarDays = computed(() => {
  const d = currentDate.value
  const year = d.getFullYear()
  const month = d.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Start with Monday (1). JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  let firstDayIndex = firstDayOfMonth.getDay() - 1
  if (firstDayIndex === -1) firstDayIndex = 6

  const daysInMonth = lastDayOfMonth.getDate()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const cells = []
  const todayIso = new Date().toISOString().split('T')[0]

  // Event map by YYYY-MM-DD
  const eventsByDate: Record<string, any[]> = {}
  filteredEvents.value.forEach((ev) => {
    if (!ev || !ev.date) return
    const key = String(ev.date)
    if (!eventsByDate[key]) {
      eventsByDate[key] = []
    }
    eventsByDate[key]?.push(ev)
  })

  // Previous month trailing days
  for (let i = firstDayIndex; i > 0; i--) {
    const dayNum = prevMonthLastDay - i + 1
    const pDate = new Date(year, month - 1, dayNum)
    const iso = pDate.toISOString().split('T')[0] || ''
    cells.push({
      date: iso,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      events: eventsByDate[iso] || [],
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    cells.push({
      date: iso,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      events: eventsByDate[iso] || [],
    })
  }

  // Next month leading days (fill up grid to 35 or 42 cells)
  const remainingCells = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= remainingCells; i++) {
    const nDate = new Date(year, month + 1, i)
    const iso = `${nDate.getFullYear()}-${String(nDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    cells.push({
      date: iso,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      events: eventsByDate[iso] || [],
    })
  }

  return cells
})

// Week View Days Calculation
function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

const weekCalendarDays = computed(() => {
  const start = getStartOfWeek(currentDate.value)
  const todayIso = new Date().toISOString().split('T')[0]
  const days = []

  const eventsByDate: Record<string, any[]> = {}
  filteredEvents.value.forEach((ev) => {
    if (!ev || !ev.date) return
    const key = String(ev.date)
    if (!eventsByDate[key]) {
      eventsByDate[key] = []
    }
    eventsByDate[key]?.push(ev)
  })

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({
      date: iso,
      dayNumber: d.getDate(),
      dayName: d.toLocaleString('en-US', { weekday: 'short' }),
      monthShort: d.toLocaleString('en-US', { month: 'short' }),
      isToday: iso === todayIso,
      events: eventsByDate[iso] || [],
    })
  }

  return days
})

// Agenda Grouped View Calculation
const agendaGroupedEvents = computed(() => {
  const groups: Record<string, any[]> = {}
  const todayIso = new Date().toISOString().split('T')[0]

  filteredEvents.value.forEach((ev) => {
    if (!ev || !ev.date) return
    const key = String(ev.date)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key]?.push(ev)
  })

  const sortedDates = Object.keys(groups).sort()

  return sortedDates.map((dateStr) => {
    const parts = dateStr.split('-')
    const y = Number(parts[0]) || 2026
    const m = (Number(parts[1]) || 1) - 1
    const day = Number(parts[2]) || 1
    const d = new Date(y, m, day)
    const isToday = dateStr === todayIso

    let label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    if (isToday) {
      label = `Today — ${label}`
    }

    return {
      date: dateStr,
      dateLabel: label,
      dayNumber: d.getDate(),
      monthShort: d.toLocaleString('en-US', { month: 'short' }),
      isToday,
      events: groups[dateStr] || [],
    }
  })
})

// Helpers & Formatters
const formatFullDate = (isoStr: string) => {
  if (!isoStr) return 'No Date'
  const parts = isoStr.split('-')
  if (parts.length < 3) return isoStr
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatStatus = (st: string) => {
  if (!st) return 'Pending'
  return st
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => (n[0] ? n[0].toUpperCase() : ''))
    .join('') || 'U'
}

const openEventDetails = (ev: any) => {
  selectedEvent.value = ev
}

const openDayEvents = (cell: any) => {
  selectedDayEvents.value = {
    date: cell.date,
    events: cell.events,
  }
}

const navigateToEvent = (ev: any) => {
  if (ev && ev.url) {
    selectedEvent.value = null
    selectedDayEvents.value = null
    router.push(ev.url)
  }
}

onMounted(() => {
  fetchCalendarEvents()
})
</script>

<style scoped>
.calendar-view {
  padding: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
  gap: var(--space-md);
  flex-wrap: wrap;
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 500;
  color: var(--ink);
  margin: var(--space-xs) 0 0 0;
  letter-spacing: -0.02em;
}

.subtitle {
  color: var(--slate);
  font-size: var(--text-sm);
  margin: var(--space-xs) 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.month-nav-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 4px 8px;
  border-radius: var(--radius);
}

.nav-arrow-btn {
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.nav-arrow-btn:hover {
  background: var(--paper);
  color: var(--forest);
}

.current-period-text {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: var(--text-base);
  min-width: 160px;
  text-align: center;
  color: var(--ink);
}

/* View Mode Toggles */
.view-mode-toggle {
  display: flex;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 3px;
  gap: 2px;
}

.toggle-btn {
  background: transparent;
  border: none;
  padding: 6px 14px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--slate);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn.active {
  background: var(--surface);
  color: var(--ink);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.highlight-forest {
  color: var(--forest);
  font-weight: 500;
}
.highlight-gold {
  color: var(--gold);
  font-weight: 500;
}
.highlight-danger {
  color: var(--danger);
  font-weight: 600;
}
.highlight-muted {
  color: var(--slate);
}

/* Toolbar */
.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.category-filters {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.filter-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--ink);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-pill:hover {
  border-color: var(--slate);
}

.filter-pill.active {
  background: var(--ink);
  color: #fff;
  border-color: var(--ink);
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.pill-count {
  font-family: var(--font-mono);
  font-size: 10px;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 10px;
}

.filter-pill.active .pill-count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-select {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--ink);
  border-radius: var(--radius);
  outline: none;
  cursor: pointer;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--slate);
  pointer-events: none;
}

.search-input {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 8px 28px 8px 30px;
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--ink);
  border-radius: var(--radius);
  outline: none;
  width: 200px;
  transition: width 0.2s ease, border-color 0.2s ease;
}

.search-input:focus {
  width: 240px;
  border-color: var(--forest);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--slate);
  font-size: 14px;
  cursor: pointer;
}

/* Card Container */
.calendar-container-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

/* Month Grid Styles */
.weekday-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}

.weekday-header-cell {
  padding: var(--space-sm);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--slate);
  font-weight: 500;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(120px, 1fr);
}

.calendar-day-cell {
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  background: var(--surface);
  transition: background 0.15s ease;
  min-height: 120px;
}

.calendar-day-cell:nth-child(7n) {
  border-right: none;
}

.calendar-day-cell.is-other-month {
  background: #fafaf8;
  opacity: 0.55;
}

.calendar-day-cell.is-today {
  background: #f4f8f6;
}

.day-cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  margin-bottom: 4px;
}

.day-number {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--ink);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.today-badge {
  background: var(--forest);
  color: #fff !important;
  font-weight: 600;
}

.day-event-count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--slate);
}

.day-cell-events {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

/* Event Chip inside Month Grid */
.event-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 1px solid transparent;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.event-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.chip-task {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #312e81;
}
.chip-task .event-chip-dot {
  background: #4f46e5;
}

.chip-project {
  background: var(--forest-soft);
  border-color: #a7f3d0;
  color: var(--forest-dark);
}
.chip-project .event-chip-dot {
  background: var(--forest);
}

.chip-invoice {
  background: var(--gold-soft);
  border-color: #fde68a;
  color: #78350f;
}
.chip-invoice .event-chip-dot {
  background: var(--gold);
}

.chip-overdue {
  border-color: #fca5a5 !important;
}

.event-chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-chip-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-chip-amount {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  margin-left: 2px;
}

.more-events-btn {
  background: none;
  border: none;
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-align: left;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 2px;
}

.more-events-btn:hover {
  color: var(--forest);
  text-decoration: underline;
}

/* Week Grid View */
.week-columns-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 480px;
}

.week-day-column {
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
}

.week-day-column:last-child {
  border-right: none;
}

.week-day-column.is-today {
  background: #f7faf8;
}

.week-column-header {
  padding: var(--space-sm);
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.week-day-name {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--slate);
}

.week-day-number {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
  padding: 2px 6px;
  border-radius: 12px;
}

.column-count-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--slate);
}

.week-column-events {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.empty-column-state {
  color: #b4b2a9;
  font-size: var(--text-xs);
  text-align: center;
  padding: var(--space-lg) 0;
  font-style: italic;
}

.week-event-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.week-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.06);
}

.card-type-task {
  border-left: 3px solid #4f46e5;
}
.card-type-project {
  border-left: 3px solid var(--forest);
}
.card-type-invoice {
  border-left: 3px solid var(--gold);
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.week-card-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.week-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--slate);
}

.card-amount {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--ink);
}

/* Agenda View */
.agenda-view {
  padding: var(--space-lg);
}

.empty-agenda-state {
  text-align: center;
  padding: var(--space-2xl) var(--space-md);
}

.empty-icon-wrapper {
  color: var(--slate);
  margin-bottom: var(--space-md);
}

.empty-agenda-state h3 {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  margin: 0 0 var(--space-xs) 0;
}

.empty-agenda-state p {
  color: var(--slate);
  font-size: var(--text-sm);
  margin: 0;
}

.agenda-date-group {
  margin-bottom: var(--space-xl);
}

.agenda-date-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1.5px solid var(--line);
}

.date-badge {
  background: var(--paper);
  border: 1px solid var(--line);
  padding: 4px 10px;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 48px;
}

.date-badge.is-today-badge {
  background: var(--forest);
  border-color: var(--forest);
  color: #fff;
}

.date-badge.is-today-badge .date-day,
.date-badge.is-today-badge .date-month {
  color: #fff;
}

.date-day {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1;
}

.date-month {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--slate);
}

.date-heading {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0;
  color: var(--ink);
}

.group-count {
  font-size: var(--text-xs);
  color: var(--slate);
}

.agenda-events-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.agenda-event-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.agenda-event-row:hover {
  background: var(--paper);
  border-color: var(--slate);
  transform: translateX(3px);
}

.row-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.row-subtext {
  font-size: var(--text-xs);
  color: var(--slate);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.separator {
  color: var(--line);
}

.row-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.row-amount {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
}

.row-arrow {
  color: var(--slate);
}

/* Badges & Status Chips */
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.category-badge-sm {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 5px;
  border-radius: 2px;
}

.badge-task {
  background: #eef2ff;
  color: #4338ca;
}
.badge-task .type-dot {
  background: #4f46e5;
}

.badge-project {
  background: var(--forest-soft);
  color: var(--forest-dark);
}
.badge-project .type-dot {
  background: var(--forest);
}

.badge-invoice {
  background: var(--gold-soft);
  color: #92400e;
}
.badge-invoice .type-dot {
  background: var(--gold);
}

.type-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-chip {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 12px;
  background: var(--paper);
  color: var(--slate);
}

.status-chip-sm {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--paper);
  color: var(--slate);
}

.status-completed, .status-paid {
  background: #ecfdf5;
  color: #065f46;
}

.status-in_progress, .status-active, .status-sent {
  background: #eff6ff;
  color: #1e40af;
}

.status-todo, .status-draft, .status-on_hold {
  background: #f3f4f6;
  color: #4b5563;
}

.status-blocked {
  background: var(--danger-soft);
  color: var(--danger);
}

.overdue-tag {
  background: var(--danger-soft);
  color: var(--danger);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 2px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 23, 28, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--space-md);
}

.event-modal-card, .day-events-modal {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  width: 100%;
  max-width: 540px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.modal-close-btn {
  background: none;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius);
}

.modal-close-btn:hover {
  background: var(--paper);
  color: var(--ink);
}

.modal-body {
  padding: var(--space-lg);
  overflow-y: auto;
}

.event-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 var(--space-lg) 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-label {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  color: var(--slate);
  letter-spacing: 0.05em;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--ink);
  font-weight: 500;
}

.client-link {
  color: var(--forest);
  text-decoration: underline;
}

.avatar-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--forest-soft);
  color: var(--forest-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.dev-category {
  font-size: var(--text-xs);
  color: var(--slate);
  font-weight: normal;
}

.highlight-amount {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--forest);
}

.mono-text {
  font-family: var(--font-mono);
}

.progress-bar-container {
  margin-top: 4px;
}

.progress-bar-bg {
  height: 8px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-bar-fill {
  height: 100%;
  background: var(--forest);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--slate);
}

.description-text {
  font-size: var(--text-sm);
  color: var(--ink-soft);
  margin: 4px 0 0 0;
  line-height: 1.5;
  background: var(--paper);
  padding: var(--space-sm);
  border-radius: var(--radius);
}

.modal-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  background: var(--paper);
}

.btn-secondary {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: var(--paper);
  border-color: var(--slate);
}

/* Day Events Modal List */
.day-events-list {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  overflow-y: auto;
}

.day-event-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--space-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.day-event-card:hover {
  border-color: var(--slate);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.day-event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.day-event-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 6px 0;
}

.day-event-meta {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--slate);
}

.event-amount {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--ink);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) 0;
  color: var(--slate);
  gap: var(--space-md);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top-color: var(--forest);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .month-grid {
    grid-auto-rows: minmax(100px, 1fr);
  }
  .week-columns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .calendar-view {
    padding: var(--space-md);
  }
  .page-header {
    flex-direction: column;
  }
  .month-grid {
    grid-template-columns: repeat(7, 1fr);
  }
  .calendar-day-cell {
    min-height: 80px;
    padding: 2px;
  }
  .event-chip-amount {
    display: none;
  }
}
</style>