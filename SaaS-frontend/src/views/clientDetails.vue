<template>
  <div class="client-detail-view">
    <!-- Client Edit Drawer Component -->
    <ClientDrawer
      :is-open="showEditDrawer"
      :client="drawerClientPayload"
      @close="showEditDrawer = false"
      @saved="handleClientSaved"
    />

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="modal-backdrop" @click="showDeleteModal = false">
        <div class="modal-card" @click.stop>
          <div class="modal-header">
            <div class="danger-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <h3>Delete Client</h3>
          </div>
          <p class="modal-body">
            Are you sure you want to delete <strong>{{ payload.name }}</strong>? All associated records will be removed. This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn-danger" :disabled="isDeleting" @click="confirmDelete">
              {{ isDeleting ? 'Deleting...' : 'Delete Client' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- New Project Modal Component -->
    <ProjectModal
      :is-open="showNewProjectModal"
      :client-name="payload.name"
      :client-id="payload.id"
      :project = "selectedProject"
      @close="showNewProjectModal = false"
      @create="handleProjectCreated"
      @update="handleProjectEdit"
      :mode= "modelMode"
    />

    <!-- Top Navigation Header (Scrolls naturally) -->
    <div class="nav-header">
      <router-link to="/clients" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Clients
      </router-link>
      <div class="breadcrumb">
        <span>Clients</span>
        <span class="sep">/</span>
        <span class="current">{{ payload.name || 'Client Profile' }}</span>
      </div>
    </div>

    <!-- Header Profile Card Container -->
    <div class="header-card-container">

      <!-- Hero Profile Header Card -->
      <div class="hero-profile-card">
        <div class="profile-main-info">
          <div class="avatar-badge">
            {{ initials }}
          </div>
          <div class="profile-title-group">
            <div class="title-row">
              <h1 class="client-name">{{ payload.name }}</h1>
              <span class="client-id-tag">#{{ clientId }}</span>
            </div>
            <p class="company-name-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              {{ payload.companyName || 'Individual Client' }}
            </p>
          </div>
        </div>

        <div class="hero-actions">
          <!-- Status Dropdown Selector -->
          <div class="status-dropdown-wrapper">
            <button 
              type="button" 
              class="status-select-btn" 
              :class="currentStatus.toLowerCase()"
              @click="showStatusMenu = !showStatusMenu"
            >
              <span class="status-indicator-dot"></span>
              <span>{{ currentStatus }}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Status Options Menu -->
            <div v-if="showStatusMenu" class="status-dropdown-menu" @click.stop>
              <div 
                v-for="status in statusOptions" 
                :key="status"
                class="status-menu-option"
                :class="{ active: currentStatus === status }"
                @click="changeStatus(status)"
              >
                <span class="status-dot" :class="status.toLowerCase()"></span>
                {{ status }}
              </div>
            </div>
            <div v-if="showStatusMenu" class="dropdown-backdrop" @click="showStatusMenu = false"></div>
          </div>

          <!-- Edit Button -->
          <button type="button" class="btn-action-outline" @click="openEditDrawer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profile
          </button>

          <!-- More Options Menu -->
          <div class="more-menu-wrapper">
            <button type="button" class="btn-icon-square" title="More Options" @click="showMoreMenu = !showMoreMenu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>

            <div v-if="showMoreMenu" class="more-dropdown-menu">
              <button type="button" class="more-item" @click="copyToClipboard(payload.email, 'Email copied to clipboard')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Email
              </button>
              <button type="button" class="more-item" @click="copyToClipboard(payload.phone, 'Phone copied to clipboard')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Copy Phone
              </button>
              <div class="menu-divider"></div>
              <button type="button" class="more-item danger" @click="showDeleteModal = true; showMoreMenu = false;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete Client
              </button>
            </div>
            <div v-if="showMoreMenu" class="dropdown-backdrop" @click="showMoreMenu = false"></div>
          </div>
        </div>
      </div>
    </div>

      <!-- Toast Feedback Popup -->
      <Transition name="fade">
        <div v-if="toastMessage" class="toast-popup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          {{ toastMessage }}
        </div>
      </Transition>

      <!-- 2-Column Dashboard Body -->
      <div class="dashboard-body-grid">
        <!-- Main Primary Column (Left 65%) -->
        <div class="main-column">
          <!-- Quick Contact Cards Grid -->
          <div class="contact-cards-grid">
            <!-- Email Card -->
            <div class="card contact-card">
              <div class="card-icon-box email-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div class="contact-info">
                <span class="ledger-label">Email Address</span>
                <a :href="`mailto:${payload.email}`" class="contact-value-link">
                  {{ payload.email || 'No email specified' }}
                </a>
              </div>
              <button 
                v-if="payload.email"
                type="button" 
                class="btn-copy-icon" 
                title="Copy Email" 
                @click="copyToClipboard(payload.email, 'Email copied!')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <!-- Phone Card -->
            <div class="card contact-card">
              <div class="card-icon-box phone-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div class="contact-info">
                <span class="ledger-label">Phone Number</span>
                <a :href="`tel:${payload.phone}`" class="contact-value-link">
                  {{ payload.phone || 'No phone specified' }}
                </a>
              </div>
              <button 
                v-if="payload.phone"
                type="button" 
                class="btn-copy-icon" 
                title="Copy Phone" 
                @click="copyToClipboard(payload.phone, 'Phone copied!')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <!-- Company Card -->
            <div class="card contact-card">
              <div class="card-icon-box company-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div class="contact-info">
                <span class="ledger-label">Company</span>
                <span class="contact-value-static">
                  {{ payload.companyName || 'Individual' }}
                </span>
              </div>
            </div>

            <!-- Gender Card -->
            <div class="card contact-card">
              <div class="card-icon-box gender-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="contact-info">
                <span class="ledger-label">Gender</span>
                <span class="contact-value-static capital">
                  {{ payload.gender || 'Unspecified' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Notes Card Section -->
          <div class="card section-card">
            <div class="card-header">
              <div class="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 class="card-title">Client Notes</h3>
              </div>
              <div class="header-right">
                <span v-if="isSavingNotes" class="note-status-tag saving">Saving changes...</span>
                <span v-else-if="notesSavedToast" class="note-status-tag saved">Autosaved ✓</span>
              </div>
            </div>
            <div class="card-body">
              <textarea
                v-model="clientNotes"
                class="notes-editor-textarea"
                placeholder="Write notes, preferences, or key instructions for this client..."
                @input="onNotesInput"
                @blur="saveNotes"
              ></textarea>
            </div>
          </div>

          <!-- Active Projects Section -->
          <div class="card section-card">
            <div class="card-header">
              <div class="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <h3 class="card-title">Projects</h3>
              </div>
              <button type="button" class="btn-text-action" @click="addNewProject">
                + New Project
              </button>
            </div>
            <div class="card-body padding-off">
              <div class="projects-container">
                <div v-for="(project, index) in clientProjects" :key="index" class="project-row-item">
                  <div class="project-left">
                    <div class="project-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h4 class="project-name">{{ project.title }}</h4>
                      <span class="project-subtitle">{{ project.status }}</span>
                    </div>
                  </div>
                  <div class="project-right">
                    <button type="button" class="btn-chevron" title="Update Project" 
                    @click="updateProject(project.id)">
                      Edit
                    </button>
                    <button type="button" class="btn-chevron" title="Delete Project" @click="deleteProject(project.id)">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Column (Right 35%) -->
        <div class="sidebar-column">
          <!-- Activity & Timeline Stream -->
          <div class="card section-card">
            <div class="card-header">
              <div class="header-left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3 class="card-title">Activity Timeline</h3>
              </div>
              <button type="button" class="btn-text-action" @click="addCustomTimelineEvent">
                + Add Event
              </button>
            </div>
            <div class="card-body">
              <div class="timeline-stream">
                <div 
                  v-for="(event, idx) in timelineEvents" 
                  :key="idx" 
                  class="timeline-node"
                >
                  <div class="node-marker"></div>
                  <div class="node-content">
                    <p class="node-title">{{ event.title }}</p>
                    <span class="node-time">{{ event.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Action Shortcuts -->
          <div class="card section-card">
            <div class="card-header">
              <h3 class="card-title">Quick Actions</h3>
            </div>
            <div class="card-body padding-compact">
              <div class="quick-actions-list">
                <button type="button" class="quick-action-item" @click="copyToClipboard(payload.email, 'Email address copied!')">
                  <span class="action-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    </svg>
                  </span>
                  <span>Send Email</span>
                </button>
                <button type="button" class="quick-action-item" @click="addCustomTimelineEvent">
                  <span class="action-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                    </svg>
                  </span>
                  <span>Schedule Follow Up</span>
                </button>
                <button type="button" class="quick-action-item" @click="openEditDrawer">
                  <span class="action-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    </svg>
                  </span>
                  <span>Edit Information</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, computed, watch} from 'vue';
import api from '@/services/ApiService';
import ClientDrawer from '@/components/ClientDrawer.vue';
import ProjectModal, { type ProjectFormData } from '@/components/ProjectModal.vue';

const route = useRoute();
const router = useRouter();
const clientId = computed(() => route.params.id as string);
const modelMode =  ref<'create' | 'edit'>('create')

const isLoading = ref(true);
const errorMessage = ref('');
const showEditDrawer = ref(false);
const showDeleteModal = ref(false);
const isDeleting = ref(false);
const showStatusMenu = ref(false);
const showMoreMenu = ref(false);
const toastMessage = ref('');
const selectedProject = ref(null);

// New Project Modal State
const showNewProjectModal = ref(false);

// Current Client Payload
const payload = ref({
  id: null as number | string | null,
  name: '',
  email: '',
  phone: '',
  gender: '',
  companyName: ''
});

// Status state (Negotiation, Lead, Active, Onboarding, Closed)
const currentStatus = ref('Negotiation');
const statusOptions = ['Negotiation', 'Lead', 'Active', 'Onboarding', 'Closed'];

// Notes state
const clientNotes = ref('');
const isSavingNotes = ref(false);
const notesSavedToast = ref(false);

// Timeline state
const timelineEvents = ref([
  { title: 'Client added', date: '3 Sept' },
  { title: 'Status changed to Negotiation', date: '8 Sept' }
]);

// Projects state
// const clientProjects = ref([]);
const clientProjects = ref<any[]>([]);

// Initials calculation for Avatar badge
const initials = computed(() => {
  if (!payload.value.name) return 'CL';
  const parts = payload.value.name.trim().split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return payload.value.name.slice(0, 2).toUpperCase();
});

// Format client object for ClientDrawer
const drawerClientPayload = computed(() => ({
  id: payload.value.id ? Number(payload.value.id) : null,
  name: payload.value.name,
  email: payload.value.email,
  phone: payload.value.phone,
  gender: payload.value.gender,
  company_name: payload.value.companyName
}));

// Fetch Client Details from Backend
const fetchClientDetails = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await api.get(`/client/${clientId.value}`);
    if (response.status === 200 && response.data?.data) {
      const data = response.data.data;
      payload.value = {
        id: data.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        companyName: data.company_name || data.companyName || ''
      };

      // Load saved notes for this client from localStorage if available
      const savedNote = localStorage.getItem(`client_note_${clientId.value}`);
      if (savedNote !== null) {
        clientNotes.value = savedNote;
      } else {
        clientNotes.value = 'Interested in a full website redesign. Prefers WhatsApp over email. Follow up after Diwali.';
      }

      // Load saved status if available
      const savedStatus = localStorage.getItem(`client_status_${clientId.value}`);
      if (savedStatus) {
        currentStatus.value = savedStatus;
      }
    } else {
      throw new Error('Client record not found.');
    }
  } catch (error: any) {
    console.error('API Error fetching client:', error);
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to load client details. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Change status
const changeStatus = (newStatus: string) => {
  currentStatus.value = newStatus;
  showStatusMenu.value = false;
  localStorage.setItem(`client_status_${clientId.value}`, newStatus);

  const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  timelineEvents.value.unshift({
    title: `Status changed to ${newStatus}`,
    date: today
  });

  showToast(`Status updated to ${newStatus}`);
};

// Notes handler
let notesTimeout: any = null;
const onNotesInput = () => {
  isSavingNotes.value = true;
  notesSavedToast.value = false;
  if (notesTimeout) clearTimeout(notesTimeout);
  notesTimeout = setTimeout(() => {
    saveNotes();
  }, 1000);
};

const saveNotes = () => {
  localStorage.setItem(`client_note_${clientId.value}`, clientNotes.value);
  isSavingNotes.value = false;
  notesSavedToast.value = true;
  setTimeout(() => {
    notesSavedToast.value = false;
  }, 2500);
};

// Open Edit Drawer
const openEditDrawer = () => {
  showEditDrawer.value = true;
};

// Handle client saved from drawer
const handleClientSaved = async () => {
  showEditDrawer.value = false;
  showToast('Client profile updated');
  await fetchClientDetails();
};

// Delete Client
const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    await api.delete(`/clients/${clientId.value}`);
    showToast('Client deleted successfully');
    router.push('/clients');
  } catch (error: any) {
    console.error('Error deleting client:', error);
    showToast('Failed to delete client');
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};

// Copy helper
const copyToClipboard = (text: string, msg: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  showToast(msg);
  showMoreMenu.value = false;
};

// Toast notification helper
const showToast = (msg: string, duration = 2500) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, duration);
};

// Add timeline item dynamically
const addCustomTimelineEvent = () => {
  const eventName = prompt('Enter timeline event description:');
  if (eventName && eventName.trim()) {
    const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    timelineEvents.value.unshift({
      title: eventName.trim(),
      date: today
    });
    showToast('Event added to timeline');
  }
};

// Add project modal handler
const addNewProject = () => {
   modelMode.value = 'create'
  showNewProjectModal.value = true;

};

const handleProjectCreated = async (data: ProjectFormData) => {
  try {

    console.log("duedate check happen or something: ", data)
    const res = await api.post(`/client/${clientId.value}/projects`, data)
    console.log("project creating response: ", res)
    showToast('Project created');
    fetchClientProjects(clientId.value)
  }
  catch (err) {
    console.log("project creating error: ", err)
    showToast('Failed to create project');
  }
};


const fetchClientProjects = async(clientId:string) =>{
  try {
    const res = await api.get(`/client/${clientId}/projects`)
    clientProjects.value = res.data.data
    console.log("client projects", clientProjects.value)

  } catch (err) {
    console.log("client projects error: ", err)
  }
}

const updateProject = async(pid:number)=>{
  try{
  const res = await api.get(`/client/${clientId.value}/projects/${pid}`)
  console.log("here it is the result", res?.data?.data)
  selectedProject.value = res?.data?.data ?? null 
  modelMode.value = 'edit'
  showNewProjectModal.value = true;
  }
  catch(e){
    console.log(e)
  }
}

const handleProjectEdit = async(data: any) => {
  console.log("update data is : ", data)
  try{
    const res = await api.put(`/client/${clientId.value}/projects/${data.id}`, data)
    console.log("project updating response: ", res)
    showToast('Project updated');
    fetchClientProjects(clientId.value)
  }
  catch(err){
    console.log("project updating error: ", err)
    showToast('Failed to update project');
  }
  //to do
}

const deleteProject = async(id:number)=>{
  try {
    const res = await api.delete(`/client/${clientId.value}/projects/${id}`)
    showToast('Project deleted successfully');
    fetchClientProjects(clientId.value);
  } catch (err) {
    console.log("project deleting error: ", err)
    showToast('Failed to delete project');
  }
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchClientProjects(newId as string)
    }
  },
  { immediate: true }   // pehli load pe bhi chalega
)

onMounted(() => {
  fetchClientDetails();
});
</script>

<style scoped>
/* Page Layout */
.client-detail-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 60px;
  font-family: var(--font-body);
  color: var(--ink);
}

/* Header & Breadcrumb */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* Header Card Container */
.header-card-container {
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--slate);
  text-decoration: none;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--forest);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--slate);
}

.breadcrumb .sep {
  opacity: 0.4;
}

.breadcrumb .current {
  color: var(--ink);
  font-weight: 600;
}

/* Hero Profile Header Card */
.hero-profile-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 8px;
  padding: 24px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  box-shadow: 0 1px 3px rgba(20, 23, 28, 0.04), 0 4px 12px rgba(20, 23, 28, 0.02);
}

.profile-main-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  border: 1.5px solid rgba(14, 92, 74, 0.15);
}

.profile-title-group .title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.client-name {
  font-family: var(--font-display, Georgia, serif);
  font-size: 24px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0;
  letter-spacing: -0.01em;
}

.client-id-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  background: #f1efe9;
  color: var(--slate);
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 500;
}

.company-name-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--slate, #6b7280);
  margin: 0;
}

/* Actions Bar */
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Status Selector Pill */
.status-dropdown-wrapper {
  position: relative;
}

.status-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
  border: 1px solid rgba(184, 135, 47, 0.25);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-select-btn:hover {
  background: #f0e2c5;
}

.status-select-btn.active {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  border-color: rgba(14, 92, 74, 0.2);
}

.status-select-btn.closed {
  background: var(--danger-soft, #f6e9e7);
  color: var(--danger, #a3372c);
  border-color: rgba(163, 55, 44, 0.2);
}

.status-indicator-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 6px;
  padding: 4px 0;
  min-width: 160px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(20, 23, 28, 0.12);
}

.status-menu-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--ink);
  cursor: pointer;
  transition: background 0.15s ease;
}

.status-menu-option:hover {
  background: #f6f4ee;
}

.status-menu-option.active {
  font-weight: 600;
  color: var(--forest);
  background: var(--forest-soft);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gold);
}

.status-dot.active {
  background: var(--forest);
}

.status-dot.closed {
  background: var(--danger);
}

/* Action Buttons */
.btn-action-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid var(--line, #e4e1d8);
  color: var(--ink, #14171c);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-action-outline:hover {
  background: #f8f6f0;
  border-color: #d8d4c8;
}

.btn-icon-square {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: #ffffff;
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon-square:hover {
  background: #f8f6f0;
  color: var(--ink);
}

.more-menu-wrapper {
  position: relative;
}

.more-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 4px 0;
  min-width: 170px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(20, 23, 28, 0.12);
}

.more-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--ink);
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.more-item:hover {
  background: #f6f4ee;
}

.more-item.danger {
  color: var(--danger);
}

.more-item.danger:hover {
  background: var(--danger-soft);
}

.menu-divider {
  height: 1px;
  background: var(--line);
  margin: 4px 0;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 150;
}

/* 2-Column Dashboard Grid */
.dashboard-body-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Card Container Base */
.card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(20, 23, 28, 0.03);
}

.section-card {
  margin-bottom: 24px;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--forest);
}

.card-title {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.card-body {
  padding: 20px;
}

.card-body.padding-off {
  padding: 0;
}

.card-body.padding-compact {
  padding: 12px;
}

/* Contact Cards 2x2 Grid */
.contact-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.contact-card {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.contact-card:hover {
  border-color: #d2cebf;
  box-shadow: 0 2px 8px rgba(20, 23, 28, 0.05);
}

.card-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.email-bg {
  background: #eff6ff;
  color: #2563eb;
}

.phone-bg {
  background: #f0fdf4;
  color: #16a34a;
}

.company-bg {
  background: #fefce8;
  color: #ca8a04;
}

.gender-bg {
  background: #faf5ff;
  color: #9333ea;
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.contact-info .ledger-label {
  display: block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  margin: 0 0 3px;
}

.contact-value-link {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
}

.contact-value-link:hover {
  color: var(--forest);
}

.contact-value-static {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-value-static.capital {
  text-transform: capitalize;
}

.btn-copy-icon {
  background: transparent;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}

.contact-card:hover .btn-copy-icon {
  opacity: 1;
}

.btn-copy-icon:hover {
  color: var(--forest);
  background: var(--forest-soft);
}

/* Notes Card Section */
.note-status-tag {
  font-size: 11px;
  font-family: var(--font-mono);
}

.note-status-tag.saving {
  color: var(--gold);
}

.note-status-tag.saved {
  color: var(--forest);
}

.notes-editor-textarea {
  width: 100%;
  min-height: 80px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink);
  background: #fbfaf8;
  line-height: 1.5;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.notes-editor-textarea:focus {
  border-color: var(--forest);
  background: #ffffff;
}

/* Projects Section */
.btn-text-action {
  background: transparent;
  border: none;
  color: var(--forest);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.btn-text-action:hover {
  background: var(--forest-soft);
}

.projects-container {
  display: flex;
  flex-direction: column;
}

.project-row-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.15s ease;
}

.project-row-item:last-child {
  border-bottom: none;
}

.project-row-item:hover {
  background: #fbfaf6;
}

.project-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--forest-soft);
  color: var(--forest);
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 2px;
}

.project-subtitle {
  font-size: 12px;
  color: var(--slate);
}

.project-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-tasks-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--slate);
  background: #f1efe9;
  padding: 3px 8px;
  border-radius: 4px;
}

.btn-chevron {
  background: transparent;
  border: none;
  color: var(--slate);
  cursor: pointer;
  padding: 4px;
}

/* Timeline Stream */
.timeline-stream {
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 8px;
}

.timeline-stream::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 11px;
  width: 2px;
  background: var(--line);
}

.timeline-node {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  position: relative;
}

.timeline-node:last-child {
  padding-bottom: 0;
}

.node-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--forest);
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 2px var(--line);
  margin-top: 5px;
  position: relative;
  z-index: 2;
}

.node-content {
  flex: 1;
}

.node-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 2px;
  line-height: 1.4;
}

.node-time {
  font-size: 11px;
  color: var(--slate);
  font-family: var(--font-mono);
}

/* Quick Actions List */
.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quick-action-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.quick-action-item:hover {
  background: #f6f4ee;
  border-color: var(--line);
}

.action-icon {
  color: var(--forest);
  display: flex;
  align-items: center;
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 23, 28, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 8px;
  width: 420px;
  max-width: 90%;
  padding: 24px;
  box-shadow: 0 16px 36px rgba(20, 23, 28, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.danger-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--danger-soft);
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h3 {
  font-family: var(--font-display, Georgia, serif);
  font-size: 18px;
  color: var(--ink);
  margin: 0;
}

.modal-body {
  font-size: 14px;
  color: var(--slate);
  line-height: 1.5;
  margin: 0 0 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background: #ffffff;
  border: 1px solid var(--line);
  color: var(--slate);
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8f6f0;
  color: var(--ink);
}

.btn-danger {
  background: var(--danger, #a3372c);
  border: none;
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-danger:hover {
  background: #872c23;
}

/* Toast Popup */
.toast-popup {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 6px 20px rgba(14, 92, 74, 0.25);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
}

/* Loading & Error */
.loading-state, .error-state {
  padding: 80px 0;
  text-align: center;
  color: var(--slate);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top-color: var(--forest);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon-wrapper {
  color: var(--danger);
  margin-bottom: 12px;
}

/* Responsive Breakpoints */
@media (max-width: 900px) {
  .dashboard-body-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-column {
    position: static;
    top: auto;
  }
}

@media (max-width: 640px) {
  .sticky-header-container {
    position: relative;
    top: auto;
    z-index: 10;
  }

  .contact-cards-grid {
    grid-template-columns: 1fr;
  }

  .hero-profile-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .hero-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
