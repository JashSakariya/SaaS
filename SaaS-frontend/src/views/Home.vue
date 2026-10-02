<template>
  <div class="dashboard-view">
    <!-- Page Header (Consistent with Clients / Invoices directory) -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Overview</p>
        <h1 class="page-title">Dashboard</h1>
        <p class="subtitle">Here is an overview of your active clients, projects, tasks, and billing.</p>
      </div>
    </div>

    <!-- Stat Cards Grid (Reusing StatCard component) -->
    <div class="stats-grid">
      <!-- Clients -->
      <StatCard
        label="Clients"
        :value="stats.clients.total"
        :loading="loading"
        icon-variant="forest"
        to="/clients"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </template>
        <template #subtext>
          <span class="highlight-forest">+{{ stats.clients.newThisMonth }} this month</span>
        </template>
      </StatCard>

      <!-- Active Projects -->
      <StatCard
        label="Active projects"
        :value="stats.projects.active"
        :loading="loading"
        icon-variant="indigo"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </template>
        <template #subtext>
          <span class="highlight-muted">{{ stats.projects.onHold }} on hold</span>
        </template>
      </StatCard>

      <!-- Open Tasks -->
      <StatCard
        label="Open tasks"
        :value="stats.tasks.open"
        :loading="loading"
        icon-variant="gold"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="m9 14 2 2 4-4"></path>
          </svg>
        </template>
        <template #subtext>
          <span :class="stats.tasks.overdue > 0 ? 'highlight-danger' : 'highlight-muted'">
            {{ stats.tasks.overdue }} overdue
          </span>
        </template>
      </StatCard>

      <!-- Unpaid Invoices -->
      <StatCard
        label="Unpaid invoices"
        :value="stats.invoices.unpaid"
        :loading="loading"
        icon-variant="danger"
        to="/invoices"
      >
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </template>
        <template #subtext>
          <span :class="stats.invoices.overdue > 0 ? 'highlight-danger' : 'highlight-muted'">
            {{ stats.invoices.overdue }} overdue
          </span>
        </template>
      </StatCard>
    </div>

    <!-- Middle Section: Project Progress & Tasks Overview -->
    <div class="dashboard-middle-grid">
      <!-- Left Card: Project Progress -->
      <div class="section-card project-progress-card">
        <div class="card-header">
          <h2 class="card-title">Project progress</h2>
          <router-link to="/clients" class="card-action-link">View all</router-link>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="loading" class="project-list-skeleton">
          <div v-for="i in 4" :key="i" class="skeleton-item">
            <div class="skeleton-avatar"></div>
            <div class="skeleton-lines">
              <div class="sk-line wide"></div>
              <div class="sk-line bar"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="projectProgressList.length === 0" class="empty-projects-state">
          <p>No active projects found.</p>
          <router-link to="/clients" class="btn-sm-link">Create a project</router-link>
        </div>

        <!-- Project Items List -->
        <div v-else class="project-list">
          <div 
            v-for="(project, idx) in projectProgressList" 
            :key="project.id" 
            class="project-item"
          >
            <div class="project-item-top">
              <ClientAvatar 
                :initials="project.initials" 
                :index="idx" 
                size="md"
              />
              <div class="project-info">
                <router-link 
                  :to="`/clients/${project.clientId}/projects/${project.id}`" 
                  class="project-name"
                >
                  {{ project.title }}
                </router-link>
                <span class="project-client">{{ project.clientName }}</span>
              </div>
              <div class="project-meta">
                <span class="project-pct">{{ project.percentage }}%</span>
                <span class="project-due" :class="getDueStatusClass(project.dueDate)">
                  {{ formatDueDate(project.dueDate) }}
                </span>
              </div>
            </div>

            <!-- Theme Consistent Forest Progress Bar -->
            <div class="progress-track">
              <div 
                class="progress-fill" 
                :style="{ width: `${project.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Card: Tasks Overview Donut Chart -->
      <div class="section-card tasks-overview-card">
        <div class="card-header">
          <h2 class="card-title">Tasks overview</h2>
          <span class="header-total-badge">{{ tasksOverview.total }} tasks</span>
        </div>

        <div class="tasks-overview-body">
          <!-- Donut Chart with Hover Tooltip -->
          <div class="donut-chart-container" @mouseleave="hoveredSegment = null">
            <svg class="donut-chart" viewBox="0 0 160 160">
              <!-- Background Ring -->
              <circle
                cx="80"
                cy="80"
                r="60"
                class="donut-bg"
                stroke-width="16"
                fill="none"
              />

              <!-- Segment 1: To do (Slate) -->
              <circle
                v-if="chartSegments.todo.pct > 0"
                cx="80"
                cy="80"
                r="60"
                class="donut-segment seg-todo"
                :class="{ 'is-hovered': hoveredSegment === 'todo', 'is-dimmed': hoveredSegment && hoveredSegment !== 'todo' }"
                :stroke-width="hoveredSegment === 'todo' ? 20 : 16"
                fill="none"
                :stroke-dasharray="`${chartSegments.todo.dash} ${circumference}`"
                :stroke-dashoffset="chartSegments.todo.offset"
                @mouseenter="hoveredSegment = 'todo'"
              />

              <!-- Segment 2: In progress (Indigo) -->
              <circle
                v-if="chartSegments.inProgress.pct > 0"
                cx="80"
                cy="80"
                r="60"
                class="donut-segment seg-in-progress"
                :class="{ 'is-hovered': hoveredSegment === 'inProgress', 'is-dimmed': hoveredSegment && hoveredSegment !== 'inProgress' }"
                :stroke-width="hoveredSegment === 'inProgress' ? 20 : 16"
                fill="none"
                :stroke-dasharray="`${chartSegments.inProgress.dash} ${circumference}`"
                :stroke-dashoffset="chartSegments.inProgress.offset"
                @mouseenter="hoveredSegment = 'inProgress'"
              />

              <!-- Segment 3: Completed (Forest Green) -->
              <circle
                v-if="chartSegments.completed.pct > 0"
                cx="80"
                cy="80"
                r="60"
                class="donut-segment seg-completed"
                :class="{ 'is-hovered': hoveredSegment === 'completed', 'is-dimmed': hoveredSegment && hoveredSegment !== 'completed' }"
                :stroke-width="hoveredSegment === 'completed' ? 20 : 16"
                fill="none"
                :stroke-dasharray="`${chartSegments.completed.dash} ${circumference}`"
                :stroke-dashoffset="chartSegments.completed.offset"
                @mouseenter="hoveredSegment = 'completed'"
              />

              <!-- Segment 4: Blocked (Danger Rust) -->
              <circle
                v-if="chartSegments.blocked.pct > 0"
                cx="80"
                cy="80"
                r="60"
                class="donut-segment seg-blocked"
                :class="{ 'is-hovered': hoveredSegment === 'blocked', 'is-dimmed': hoveredSegment && hoveredSegment !== 'blocked' }"
                :stroke-width="hoveredSegment === 'blocked' ? 20 : 16"
                fill="none"
                :stroke-dasharray="`${chartSegments.blocked.dash} ${circumference}`"
                :stroke-dashoffset="chartSegments.blocked.offset"
                @mouseenter="hoveredSegment = 'blocked'"
              />
            </svg>

            <!-- Interactive Hover Tooltip Popover -->
            <transition name="popover-fade">
              <div 
                v-if="activeTooltip" 
                class="chart-tooltip"
                :style="activeTooltip.style"
              >
                <div class="tooltip-title">{{ activeTooltip.label }}</div>
                <div class="tooltip-value-row">
                  <span class="tooltip-color-box" :style="{ backgroundColor: activeTooltip.color }"></span>
                  <span class="tooltip-count">{{ activeTooltip.count }}</span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Legend with Hover Interaction -->
          <div class="donut-legend">
            <div 
              class="legend-item" 
              :class="{ 'is-active': hoveredSegment === 'todo' }"
              @mouseenter="hoveredSegment = 'todo'"
              @mouseleave="hoveredSegment = null"
            >
              <div class="legend-left">
                <span class="legend-marker marker-todo"></span>
                <span class="legend-label">To do</span>
              </div>
              <span class="legend-count">{{ tasksOverview.todo }}</span>
            </div>

            <div 
              class="legend-item" 
              :class="{ 'is-active': hoveredSegment === 'inProgress' }"
              @mouseenter="hoveredSegment = 'inProgress'"
              @mouseleave="hoveredSegment = null"
            >
              <div class="legend-left">
                <span class="legend-marker marker-in-progress"></span>
                <span class="legend-label">In progress</span>
              </div>
              <span class="legend-count">{{ tasksOverview.inProgress }}</span>
            </div>

            <div 
              class="legend-item" 
              :class="{ 'is-active': hoveredSegment === 'completed' }"
              @mouseenter="hoveredSegment = 'completed'"
              @mouseleave="hoveredSegment = null"
            >
              <div class="legend-left">
                <span class="legend-marker marker-completed"></span>
                <span class="legend-label">Completed</span>
              </div>
              <span class="legend-count">{{ tasksOverview.completed }}</span>
            </div>

            <!-- Blocked Tasks item (shown if count > 0) -->
            <div 
              v-if="tasksOverview.blocked > 0"
              class="legend-item" 
              :class="{ 'is-active': hoveredSegment === 'blocked' }"
              @mouseenter="hoveredSegment = 'blocked'"
              @mouseleave="hoveredSegment = null"
            >
              <div class="legend-left">
                <span class="legend-marker marker-blocked"></span>
                <span class="legend-label">Blocked</span>
              </div>
              <span class="legend-count">{{ tasksOverview.blocked }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Section 1: Clients Snapshot Table -->
    <div class="section-card clients-snapshot-card">
      <div class="card-header">
        <h2 class="card-title">Clients snapshot</h2>
        <router-link to="/clients" class="card-action-link">View all</router-link>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="snapshot-skeleton">
        <div v-for="i in 3" :key="i" class="sk-row"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="clientsSnapshotList.length === 0" class="empty-clients-state">
        <p>No client records available yet.</p>
        <router-link to="/clients" class="btn-sm-link">Add your first client</router-link>
      </div>

      <!-- Clients Snapshot Table -->
      <div v-else class="table-scroll-wrapper">
        <table class="snapshot-table">
          <thead>
            <tr>
              <th class="col-client">Client</th>
              <th class="col-projects">Projects</th>
              <th class="col-tasks">Open tasks</th>
              <th class="col-invoices">Unpaid invoices</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(client, idx) in clientsSnapshotList" :key="client.id">
              <td class="col-client">
                <div class="client-cell">
                  <ClientAvatar 
                    :initials="client.initials" 
                    :index="idx" 
                    size="sm"
                  />
                  <router-link :to="`/clients/${client.id}`" class="client-name">
                    {{ client.name }}
                  </router-link>
                </div>
              </td>
              <td class="col-projects mono-cell">
                {{ client.projectsCount }}
              </td>
              <td class="col-tasks mono-cell">
                {{ client.openTasksCount }}
              </td>
              <td class="col-invoices">
                <span 
                  v-if="client.unpaidInvoicesCount > 0" 
                  class="invoice-badge" 
                  :class="client.unpaidInvoicesCount >= 2 ? 'badge-danger' : 'badge-amber'"
                >
                  {{ client.unpaidInvoicesCount }}
                </span>
                <span v-else class="text-none">None</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Section 2: Invoice Pipeline -->
    <div class="section-card invoice-pipeline-card">
      <div class="card-header">
        <h2 class="card-title">Invoice pipeline</h2>
        <router-link to="/invoices" class="card-action-link">View invoices</router-link>
      </div>

      <!-- Pipeline Status Metric Mini-Cards (4 Theme Consistent Blocks) -->
      <div class="pipeline-metrics-grid">
        <!-- Draft -->
        <div class="pipeline-metric-box metric-draft">
          <span class="metric-label">Draft</span>
          <span class="metric-value">
            <span v-if="loading" class="skeleton-metric"></span>
            <span v-else>{{ invoicePipeline.draft }}</span>
          </span>
        </div>

        <!-- Sent -->
        <div class="pipeline-metric-box metric-sent">
          <span class="metric-label">Sent</span>
          <span class="metric-value">
            <span v-if="loading" class="skeleton-metric"></span>
            <span v-else>{{ invoicePipeline.sent }}</span>
          </span>
        </div>

        <!-- Overdue (Harmonious Theme Danger Soft) -->
        <div class="pipeline-metric-box metric-overdue">
          <span class="metric-label">Overdue</span>
          <span class="metric-value">
            <span v-if="loading" class="skeleton-metric"></span>
            <span v-else>{{ invoicePipeline.overdue }}</span>
          </span>
        </div>

        <!-- Paid (Harmonious Theme Forest Soft) -->
        <div class="pipeline-metric-box metric-paid">
          <span class="metric-label">Paid</span>
          <span class="metric-value">
            <span v-if="loading" class="skeleton-metric"></span>
            <span v-else>{{ invoicePipeline.paid }}</span>
          </span>
        </div>
      </div>

      <!-- Invoice Items List -->
      <div v-if="loading" class="pipeline-list-skeleton">
        <div v-for="i in 3" :key="i" class="sk-row"></div>
      </div>

      <div v-else-if="invoicePipeline.items.length === 0" class="empty-pipeline-state">
        <p>No invoices created yet.</p>
        <router-link to="/invoices/new" class="btn-sm-link">Create an invoice</router-link>
      </div>

      <div v-else class="pipeline-items-list">
        <div 
          v-for="inv in invoicePipeline.items" 
          :key="inv.id" 
          class="pipeline-item-row"
        >
          <div class="pipeline-item-left">
            <div class="pipeline-invoice-heading">
              <router-link :to="`/invoices`" class="invoice-number">
                {{ inv.invoiceNumber }}
              </router-link>
              <span class="heading-sep">·</span>
              <span class="invoice-client-name">{{ inv.clientName }}</span>
            </div>
            <div class="pipeline-invoice-subtext">
              {{ formatInvoiceSubtext(inv) }}
            </div>
          </div>

          <div class="pipeline-item-right">
            <span 
              class="pipeline-status-badge"
              :class="getInvoiceBadge(inv).badgeClass"
            >
              {{ getInvoiceBadge(inv).text }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/ApiService'
import ClientAvatar from '@/components/ClientAvatar.vue'
import StatCard from '@/components/StatCard.vue'

const loading = ref(true)
const hoveredSegment = ref<'todo' | 'inProgress' | 'completed' | 'blocked' | null>(null)

const stats = reactive({
  clients: {
    total: 0,
    newThisMonth: 0,
  },
  projects: {
    active: 0,
    onHold: 0,
    total: 0,
  },
  tasks: {
    open: 0,
    overdue: 0,
    todo: 0,
    completed: 0,
    blocked: 0,
    total: 0,
  },
  invoices: {
    unpaid: 0,
    overdue: 0,
    total: 0,
  },
})

interface ProjectProgressItem {
  id: number
  clientId: number
  title: string
  clientName: string
  initials: string
  status: string
  dueDate: string | null
  percentage: number
  totalTasks: number
  completedTasks: number
}

interface ClientSnapshotItem {
  id: number
  name: string
  companyName: string
  initials: string
  projectsCount: number
  openTasksCount: number
  unpaidInvoicesCount: number
}

interface PipelineInvoiceItem {
  id: number
  invoiceNumber: string
  clientName: string
  status: 'draft' | 'sent' | 'paid'
  dueDate: string | null
  createdAt: string | null
  totalAmount: number
}

const projectProgressList = ref<ProjectProgressItem[]>([])
const clientsSnapshotList = ref<ClientSnapshotItem[]>([])

const invoicePipeline = reactive<{
  draft: number
  sent: number
  overdue: number
  paid: number
  items: PipelineInvoiceItem[]
}>({
  draft: 0,
  sent: 0,
  overdue: 0,
  paid: 0,
  items: [],
})

const tasksOverview = reactive({
  todo: 0,
  inProgress: 0,
  completed: 0,
  blocked: 0,
  total: 0,
})

// Due date formatting helper
const formatDueDate = (dateStr: string | null) => {
  if (!dateStr) return 'No due date'
  try {
    const due = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return `Overdue (${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})`
    } else if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays <= 3) {
      return `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else {
      return `Due ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    }
  } catch {
    return dateStr
  }
}

const getDueStatusClass = (dateStr: string | null) => {
  if (!dateStr) return 'due-muted'
  try {
    const due = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0 || diffDays <= 3) {
      return 'due-alert'
    }
    return 'due-normal'
  } catch {
    return 'due-normal'
  }
}

// Invoice pipeline subtitle and badge helpers
const formatInvoiceSubtext = (inv: PipelineInvoiceItem) => {
  const dateStr = inv.createdAt || inv.dueDate
  if (!dateStr) return inv.status === 'sent' ? 'Sent' : 'Draft'

  try {
    const d = new Date(dateStr)
    const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    if (inv.status === 'sent') return `Sent ${formatted}`
    if (inv.status === 'draft') return `Draft · ${formatted}`
    if (inv.status === 'paid') return `Paid · ${formatted}`
    return formatted
  } catch {
    return inv.status
  }
}

const getInvoiceBadge = (inv: PipelineInvoiceItem) => {
  if (inv.status === 'paid') {
    return { text: 'Paid', badgeClass: 'badge-paid' }
  }

  if (inv.dueDate) {
    try {
      const due = new Date(inv.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      due.setHours(0, 0, 0, 0)

      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0) {
        const days = Math.abs(diffDays)
        return { text: `${days} day${days > 1 ? 's' : ''} overdue`, badgeClass: 'badge-overdue' }
      } else if (diffDays === 0) {
        return { text: 'Due today', badgeClass: 'badge-warning' }
      } else if (diffDays <= 3) {
        return { text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, badgeClass: 'badge-warning' }
      }
    } catch {
      // fallback
    }
  }

  if (inv.status === 'draft') {
    return { text: 'Draft', badgeClass: 'badge-draft' }
  }

  return { text: 'Sent', badgeClass: 'badge-sent' }
}

// Donut Chart Math Calculation
const radius = 60
const circumference = 2 * Math.PI * radius // ≈ 376.99

const chartSegments = computed(() => {
  const todo = tasksOverview.todo
  const inProgress = tasksOverview.inProgress
  const completed = tasksOverview.completed
  const blocked = tasksOverview.blocked
  const total = todo + inProgress + completed + blocked

  if (total === 0) {
    return {
      todo: { pct: 0, dash: 0, offset: 0 },
      inProgress: { pct: 0, dash: 0, offset: 0 },
      completed: { pct: 0, dash: 0, offset: 0 },
      blocked: { pct: 0, dash: 0, offset: 0 },
    }
  }

  const todoPct = todo / total
  const inProgressPct = inProgress / total
  const completedPct = completed / total
  const blockedPct = blocked / total

  const todoDash = todoPct * circumference
  const inProgressDash = inProgressPct * circumference
  const completedDash = completedPct * circumference
  const blockedDash = blockedPct * circumference

  // Start at -90deg (top)
  const baseOffset = 0
  const todoOffset = -baseOffset
  const inProgressOffset = -(baseOffset + todoDash)
  const completedOffset = -(baseOffset + todoDash + inProgressDash)
  const blockedOffset = -(baseOffset + todoDash + inProgressDash + completedDash)

  return {
    todo: {
      pct: todoPct,
      dash: todoDash,
      offset: todoOffset,
    },
    inProgress: {
      pct: inProgressPct,
      dash: inProgressDash,
      offset: inProgressOffset,
    },
    completed: {
      pct: completedPct,
      dash: completedDash,
      offset: completedOffset,
    },
    blocked: {
      pct: blockedPct,
      dash: blockedDash,
      offset: blockedOffset,
    },
  }
})

// Tooltip popover computation for the hovered slice
const activeTooltip = computed(() => {
  if (!hoveredSegment.value) return null

  const total = tasksOverview.total || (tasksOverview.todo + tasksOverview.inProgress + tasksOverview.completed + tasksOverview.blocked)
  if (total === 0) return null

  if (hoveredSegment.value === 'completed') {
    return {
      label: 'Completed',
      count: tasksOverview.completed,
      color: '#10b981',
      style: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
  } else if (hoveredSegment.value === 'inProgress') {
    return {
      label: 'In progress',
      count: tasksOverview.inProgress,
      color: '#3b82f6',
      style: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
  } else if (hoveredSegment.value === 'todo') {
    return {
      label: 'To do',
      count: tasksOverview.todo,
      color: '#9ca3af',
      style: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
  } else if (hoveredSegment.value === 'blocked') {
    return {
      label: 'Blocked',
      count: tasksOverview.blocked,
      color: '#e06c75',
      style: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
  }

  return null
})

const fetchDashboardStats = async () => {
  loading.value = true
  try {
    const res = await api.get('/dashboard/stats')
    if (res.data?.success && res.data?.data) {
      const data = res.data.data
      stats.clients.total = data.clients?.total || 0
      stats.clients.newThisMonth = data.clients?.newThisMonth || 0

      stats.projects.active = data.projects?.active || 0
      stats.projects.onHold = data.projects?.onHold || 0
      stats.projects.total = data.projects?.total || 0

      stats.tasks.open = data.tasks?.open || 0
      stats.tasks.overdue = data.tasks?.overdue || 0
      stats.tasks.todo = data.tasks?.todo || 0
      stats.tasks.completed = data.tasks?.completed || 0
      stats.tasks.blocked = data.tasks?.blocked || 0
      stats.tasks.total = data.tasks?.total || 0

      projectProgressList.value = data.projectProgress || []
      clientsSnapshotList.value = data.clientsSnapshot || []

      if (data.invoicePipeline) {
        invoicePipeline.draft = data.invoicePipeline.draft || 0
        invoicePipeline.sent = data.invoicePipeline.sent || 0
        invoicePipeline.overdue = data.invoicePipeline.overdue || 0
        invoicePipeline.paid = data.invoicePipeline.paid || 0
        invoicePipeline.items = data.invoicePipeline.items || []
      }

      tasksOverview.todo = data.tasksOverview?.todo || 0
      tasksOverview.inProgress = data.tasksOverview?.inProgress || 0
      tasksOverview.completed = data.tasksOverview?.completed || 0
      tasksOverview.blocked = data.tasksOverview?.blocked || 0
      tasksOverview.total = data.tasksOverview?.total || 0
    }
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
})
</script>

<style scoped>
.dashboard-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 var(--space-2xl);
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.page-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: var(--text-2xl, 30px);
  margin: 4px 0 6px;
  color: var(--ink, #14171c);
}

.subtitle {
  color: var(--slate, #6b7280);
  font-size: var(--text-sm, 14px);
  margin: 0;
}

/* Stat Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md, 16px);
  margin-bottom: var(--space-lg, 24px);
}

/* Highlight text utility */
.highlight-forest {
  color: var(--forest, #0e5c4a);
  font-weight: 500;
}

.highlight-danger {
  color: var(--danger, #a3372c);
  font-weight: 500;
}

.highlight-muted {
  color: var(--slate, #6b7280);
}

/* Middle Section: Project Progress & Tasks Overview */
.dashboard-middle-grid {
  display: grid;
  grid-template-columns: 1.55fr 1fr;
  gap: var(--space-md, 16px);
  margin-bottom: var(--space-lg, 24px);
}

.section-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-lg, 24px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  margin-bottom: var(--space-lg, 24px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0;
}

.card-action-link {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--forest, #0e5c4a);
  text-decoration: none;
  transition: color 0.15s ease;
}

.card-action-link:hover {
  text-decoration: underline;
  color: var(--forest-dark, #0a4638);
}

.header-total-badge {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11.5px;
  color: var(--slate, #6b7280);
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  padding: 2px 8px;
  border-radius: 4px;
}

/* Project Progress List */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-item-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.project-name {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink, #14171c);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
}

.project-name:hover {
  color: var(--forest, #0e5c4a);
}

.project-client {
  font-size: 12px;
  color: var(--slate, #6b7280);
}

.project-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.project-pct {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #14171c);
}

.project-due {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11px;
}

.due-normal {
  color: var(--slate, #6b7280);
}

.due-alert {
  color: var(--danger, #a3372c);
  font-weight: 500;
}

.due-muted {
  color: var(--slate, #6b7280);
}

/* Progress Track and Fill - Forest Brand Theme */
.progress-track {
  width: 100%;
  height: 5px;
  background: #f0ede6;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tasks Overview Donut Chart Section */
.tasks-overview-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.donut-chart-container {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-chart {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  overflow: visible;
}

.donut-bg {
  stroke: #ece9e2;
}

.donut-segment {
  cursor: pointer;
  transition: stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
  stroke-linecap: butt;
}

.seg-todo {
  stroke: #9ca3af;
}

.seg-in-progress {
  stroke: #3b82f6;
}

.seg-completed {
  stroke: #10b981;
}

.seg-blocked {
  stroke: #e06c75;
}

.donut-segment.is-hovered {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
  opacity: 1 !important;
}

.donut-segment.is-dimmed {
  opacity: 0.45;
}

/* Interactive Center Popover Tooltip */
.chart-tooltip {
  position: absolute;
  background: var(--ink, #14171c);
  color: #ffffff;
  padding: 7px 12px;
  border-radius: 7px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  min-width: 80px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.tooltip-title {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.tooltip-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tooltip-color-box {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  display: inline-block;
}

.tooltip-count {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

/* Tooltip transition */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.92);
}

/* Legend */
.donut-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--ink, #14171c);
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.legend-item:hover,
.legend-item.is-active {
  background: var(--paper, #fbfaf6);
}

.legend-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-marker {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  transition: transform 0.15s ease;
}

.legend-item:hover .legend-marker,
.legend-item.is-active .legend-marker {
  transform: scale(1.2);
}

.marker-todo {
  background: #9ca3af;
}

.marker-in-progress {
  background: #3b82f6;
}

.marker-completed {
  background: #10b981;
}

.marker-blocked {
  background: #e06c75;
}

.legend-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  color: var(--ink-soft, #2b2f36);
}

.legend-count {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-weight: 500;
  color: var(--slate, #6b7280);
}

/* Bottom Section 1: Clients Snapshot Table */
.clients-snapshot-card {
  width: 100%;
}

.table-scroll-wrapper {
  overflow-x: auto;
  width: 100%;
}

.snapshot-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.snapshot-table th {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--slate, #6b7280);
  padding: 10px 16px;
  border-bottom: 1px solid var(--line, #e4e1d8);
}

.snapshot-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line, #e4e1d8);
  font-size: 13.5px;
  vertical-align: middle;
}

.snapshot-table tbody tr:hover td {
  background: rgba(14, 92, 74, 0.02);
}

.col-client {
  width: 40%;
}

.col-projects,
.col-tasks,
.col-invoices {
  width: 20%;
}

.client-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-name {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 500;
  color: var(--ink, #14171c);
  text-decoration: none;
  transition: color 0.15s ease;
}

.client-name:hover {
  color: var(--forest, #0e5c4a);
}

.mono-cell {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--ink, #14171c);
}

.invoice-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11.5px;
  font-weight: 700;
}

.badge-danger {
  background: var(--danger-soft, #f6e9e7);
  color: var(--danger, #a3372c);
  border: 1px solid rgba(163, 55, 44, 0.2);
}

.badge-amber {
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
  border: 1px solid rgba(184, 135, 47, 0.2);
}

.text-none {
  color: var(--slate, #6b7280);
  font-size: 13px;
}

/* Bottom Section 2: Invoice Pipeline */
.invoice-pipeline-card {
  width: 100%;
}

.pipeline-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md, 16px);
  margin-bottom: 24px;
}

.pipeline-metric-box {
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--line, #e4e1d8);
  background: var(--paper, #fbfaf6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.pipeline-metric-box .metric-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12.5px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--slate, #6b7280);
}

.pipeline-metric-box .metric-value {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--ink, #14171c);
}

/* Overdue block with harmonious theme danger soft */
.metric-overdue {
  background: var(--danger-soft, #f6e9e7);
  border-color: rgba(163, 55, 44, 0.2);
}

.metric-overdue .metric-label,
.metric-overdue .metric-value {
  color: var(--danger, #a3372c) !important;
}

/* Paid block with harmonious theme forest soft */
.metric-paid {
  background: var(--forest-soft, #e7f0ed);
  border-color: rgba(14, 92, 74, 0.2);
}

.metric-paid .metric-label,
.metric-paid .metric-value {
  color: var(--forest, #0e5c4a) !important;
}

/* Pipeline Invoices List */
.pipeline-items-list {
  display: flex;
  flex-direction: column;
}

.pipeline-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 4px;
  border-bottom: 1px solid var(--line, #e4e1d8);
  transition: background 0.15s ease;
}

.pipeline-item-row:last-child {
  border-bottom: none;
}

.pipeline-item-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.pipeline-invoice-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.invoice-number {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-weight: 600;
  color: var(--ink, #14171c);
  text-decoration: none;
  transition: color 0.15s ease;
}

.invoice-number:hover {
  color: var(--forest, #0e5c4a);
}

.heading-sep {
  color: var(--slate, #6b7280);
}

.invoice-client-name {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 500;
  color: var(--ink, #14171c);
}

.pipeline-invoice-subtext {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11.5px;
  color: var(--slate, #6b7280);
}

/* Pipeline Status Badges */
.pipeline-status-badge {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  line-height: 1.2;
}

.badge-overdue {
  background: var(--danger-soft, #f6e9e7);
  color: var(--danger, #a3372c);
  border: 1px solid rgba(163, 55, 44, 0.2);
}

.badge-warning {
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
  border: 1px solid rgba(184, 135, 47, 0.2);
}

.badge-paid {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
  border: 1px solid rgba(14, 92, 74, 0.2);
}

.badge-draft {
  background: #ece9e2;
  color: var(--slate, #6b7280);
  border: 1px solid var(--line, #e4e1d8);
}

.badge-sent {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid rgba(67, 56, 202, 0.2);
}

/* Loading & Empty states */
.skeleton-metric {
  display: inline-block;
  width: 32px;
  height: 22px;
  background: linear-gradient(90deg, #ece9e2 25%, #f5f4f0 50%, #ece9e2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.project-list-skeleton,
.snapshot-skeleton,
.pipeline-list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ece9e2;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-line {
  height: 8px;
  background: #ece9e2;
  border-radius: 4px;
}

.sk-line.wide {
  width: 60%;
}

.sk-line.bar {
  width: 100%;
}

.sk-row {
  height: 40px;
  background: #ece9e2;
  border-radius: 6px;
}

.empty-clients-state,
.empty-pipeline-state,
.empty-projects-state {
  padding: 30px 0;
  text-align: center;
  color: var(--slate, #6b7280);
  font-size: 13px;
}

.btn-sm-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--forest, #0e5c4a);
  text-decoration: underline;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive Grid */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-middle-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
