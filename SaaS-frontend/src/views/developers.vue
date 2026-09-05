<template>
  <div class="developers-view">
    <!-- Add / Edit Developer Modal -->
    <DeveloperModal
      :is-open="showModal"
      :mode="modalMode"
      :developer="selectedDeveloper"
      @close="closeDeveloperModal"
      @save="handleSaveDeveloper"
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
            <h3>Delete Employee</h3>
          </div>
          <p class="modal-body-text">
            Are you sure you want to delete <strong>{{ selectedDeveloper?.name }}</strong>? Any assigned tasks will remain but become unassigned.
          </p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn-danger" :disabled="isDeleting" @click="confirmDeleteDeveloper">
              {{ isDeleting ? 'Deleting...' : 'Delete Employee' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification Popup -->
    <Transition name="fade">
      <div v-if="toastMessage" class="toast-popup">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <p class="ledger-label">Overview</p>
        <h1 class="page-title">Employees Directory</h1>
        <p class="subtitle">Manage team members, freelancers, and their specialties.</p>
      </div>
      <button type="button" class="btn-primary" @click="openCreateModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add Employee
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading employees...</p>
    </div>

    <!-- Empty State (Zero developers exist yet) -->
    <div v-else-if="developers.length === 0" class="empty-state-container">
      <div class="empty-state-card">
        <div class="empty-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3>No employees found!</h3>
        <p>Looks like you're just getting started. Begin by adding employees and freelancers to outsource tasks.</p>
        <button type="button" @click="openCreateModal" class="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Employee
        </button>
      </div>
    </div>

    <!-- Main Content when Developers exist -->
    <div v-else class="developers-content">
      <!-- Category Filter Pills -->
      <div class="filter-pills-row">
        <button 
          v-for="cat in categories" 
          :key="cat"
          type="button" 
          class="filter-pill"
          :class="{ active: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Table Container Card -->
      <div class="table-container">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <h2>All Employees</h2>
            <span class="count-badge">{{ filteredDevelopers.length }} total</span>
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
                placeholder="Search employees..." 
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
            </div>
          </div>
        </div>

        <!-- No Filter/Search Results -->
        <div v-if="filteredDevelopers.length === 0" class="no-search-results">
          <p v-if="searchQuery">No employees match your query "<strong>{{ searchQuery }}</strong>"</p>
          <p v-else>No employees found in category "<strong>{{ activeCategory }}</strong>"</p>
          <button class="btn-secondary" @click="resetFilters">Reset Filters</button>
        </div>

        <!-- Developers Table -->
        <div v-else class="table-scroll-wrapper">
          <table class="ledger-table developers-table">
            <thead>
              <tr>
                <th>EMPLOYEE NAME</th>
                <th>CATEGORY</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th class="text-right action-column">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dev in filteredDevelopers" :key="dev.id" class="table-row">
                <!-- Name Column with Circle Initial Avatar -->
                <td>
                  <div class="dev-profile-cell">
                    <div class="dev-avatar" :class="getAvatarColorClass(dev.category)">
                      {{ getInitial(dev.name) }}
                    </div>
                    <span class="dev-name-text">{{ dev.name }}</span>
                  </div>
                </td>

                <!-- Category Column -->
                <td>
                  <span class="category-pill" :class="getCategoryClass(dev.category)">
                    {{ dev.category }}
                  </span>
                </td>

                <!-- Email Column -->
                <td class="mono email-cell">
                  {{ dev.email || '—' }}
                </td>

                <!-- Phone Column -->
                <td class="phone-cell">
                  {{ dev.phone || '—' }}
                </td>

                <!-- Action Column with 3-Dots Button -->
                <td class="action-cell text-right">
                  <div class="action-wrapper">
                    <button 
                      @click.stop="toggleDropdown($event, dev)"
                      class="btn-action-dots" 
                      :class="{ active: activeDevId === dev.id }"
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

    <!-- Fixed Overlay Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="activeDevId !== null" class="dropdown-backdrop" @click="closeDropdown"></div>

      <div 
        v-if="activeDevId !== null && activeDev" 
        class="actions-dropdown fixed-overlay" 
        :style="dropdownStyle"
      >
        <button 
          type="button" 
          @click="openEditModal(activeDev); closeDropdown();" 
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
          @click="openDeleteModal(activeDev); closeDropdown();" 
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '@/services/ApiService';
import DeveloperModal, { type DeveloperFormData } from '@/components/DeveloperModal.vue';

export interface Developer {
  id: number;
  name: string;
  category: string;
  email: string | null;
  phone: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const categories = [
  'All',
  'UI',
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'Executive',
  'Tester (QA)',
  'SEO',
  'Marketing',
  'Sales',
];

const activeCategory = ref('All');
const searchQuery = ref('');

const developers = ref<Developer[]>([]);
const isLoading = ref(true);
const toastMessage = ref('');

// Modals
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedDeveloper = ref<Developer | null>(null);

const showDeleteModal = ref(false);
const isDeleting = ref(false);

// Action Dropdown State
const activeDevId = ref<number | null>(null);
const activeDev = ref<Developer | null>(null);
const activeTriggerEl = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const closeDropdown = () => {
  activeDevId.value = null;
  activeDev.value = null;
  activeTriggerEl.value = null;
};

const updateDropdownPosition = () => {
  if (!activeTriggerEl.value || activeDevId.value === null) return;

  const rect = activeTriggerEl.value.getBoundingClientRect();

  // Close dropdown if trigger button has scrolled out of viewport
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeDropdown();
    return;
  }

  const dropdownHeight = 90;
  const dropdownWidth = 120;
  const spaceBelow = window.innerHeight - rect.bottom;

  let topPos: string;
  const leftPos = `${Math.max(10, rect.right - dropdownWidth)}px`;

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    topPos = `${rect.top - dropdownHeight - 4}px`;
  } else {
    topPos = `${rect.bottom + 4}px`;
  }

  dropdownStyle.value = {
    position: 'fixed',
    top: topPos,
    left: leftPos,
    minWidth: `${dropdownWidth}px`,
    zIndex: '10000',
  };
};

const toggleDropdown = (event: MouseEvent, dev: Developer) => {
  if (!dev || dev.id === null) return;

  if (activeDevId.value === dev.id) {
    closeDropdown();
    return;
  }

  const button = event.currentTarget as HTMLElement;
  activeTriggerEl.value = button;
  activeDev.value = dev;
  activeDevId.value = dev.id;

  updateDropdownPosition();
};

const handleScrollOrResize = () => {
  if (activeDevId.value !== null) {
    updateDropdownPosition();
  }
};

const resetFilters = () => {
  activeCategory.value = 'All';
  searchQuery.value = '';
};

const filteredDevelopers = computed(() => {
  let list = developers.value;

  // Category filter
  if (activeCategory.value !== 'All') {
    list = list.filter(
      (d) => d.category.toLowerCase() === activeCategory.value.toLowerCase()
    );
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.email && d.email.toLowerCase().includes(q)) ||
        (d.phone && d.phone.includes(q)) ||
        (d.category && d.category.toLowerCase().includes(q))
    );
  }

  return list;
});

const getInitial = (name: string) => {
  if (!name) return 'D';
  const parts = name.trim().split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getAvatarColorClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'ui':
      return 'avatar-blue';
    case 'frontend':
      return 'avatar-green';
    case 'backend':
      return 'avatar-amber';
    case 'full stack':
    case 'fullstack':
      return 'avatar-teal';
    case 'devops':
      return 'avatar-indigo';
    case 'executive':
      return 'avatar-purple';
    case 'tester (qa)':
    case 'tester':
    case 'qa':
      return 'avatar-rose';
    case 'seo':
      return 'avatar-lime';
    case 'marketing':
      return 'avatar-orange';
    case 'sales':
      return 'avatar-purple';
    default:
      return 'avatar-default';
  }
};

const getCategoryClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'ui':
      return 'cat-ui';
    case 'frontend':
      return 'cat-frontend';
    case 'backend':
      return 'cat-backend';
    case 'full stack':
    case 'fullstack':
      return 'cat-fullstack';
    case 'devops':
      return 'cat-devops';
    case 'executive':
      return 'cat-executive';
    case 'tester (qa)':
    case 'tester':
    case 'qa':
      return 'cat-qa';
    case 'seo':
      return 'cat-seo';
    case 'marketing':
      return 'cat-marketing';
    case 'sales':
      return 'cat-sales';
    default:
      return 'cat-default';
  }
};

const showToast = (msg: string, duration = 2500) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, duration);
};

// Fetch Developers
const fetchDevelopers = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/developers');
    if (res.data?.data) {
      developers.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    showToast('Failed to load employees');
  } finally {
    isLoading.value = false;
  }
};

// Create / Edit
const openCreateModal = () => {
  selectedDeveloper.value = null;
  modalMode.value = 'create';
  showModal.value = true;
};

const openEditModal = (dev: Developer) => {
  selectedDeveloper.value = { ...dev };
  modalMode.value = 'edit';
  showModal.value = true;
};

const closeDeveloperModal = () => {
  showModal.value = false;
  selectedDeveloper.value = null;
};

const handleSaveDeveloper = async (data: DeveloperFormData) => {
  try {
    if (modalMode.value === 'create') {
      const res = await api.post('/developers', data);
      if (res.data?.data) {
        developers.value.push(res.data.data);
      }
      showToast('Employee created successfully');
    } else if (modalMode.value === 'edit' && data.id) {
      const res = await api.put(`/developers/${data.id}`, data);
      const updated = res.data?.data;
      const idx = developers.value.findIndex((d) => d.id === data.id);
      if (idx !== -1 && updated) {
        developers.value[idx] = updated;
      }
      showToast('Employee updated successfully');
    }
    closeDeveloperModal();
  } catch (err) {
    console.error('Error saving employee:', err);
    showToast('Failed to save employee');
  }
};

// Delete
const openDeleteModal = (dev: Developer) => {
  selectedDeveloper.value = dev;
  showDeleteModal.value = true;
};

const confirmDeleteDeveloper = async () => {
  if (!selectedDeveloper.value) return;
  isDeleting.value = true;
  try {
    await api.delete(`/developers/${selectedDeveloper.value.id}`);
    developers.value = developers.value.filter((d) => d.id !== selectedDeveloper.value?.id);
    showToast('Employee deleted successfully');
    showDeleteModal.value = false;
  } catch (err) {
    console.error('Error deleting employee:', err);
    showToast('Failed to delete employee');
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  fetchDevelopers();
  window.addEventListener('scroll', handleScrollOrResize, true);
  window.addEventListener('resize', handleScrollOrResize);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true);
  window.removeEventListener('resize', handleScrollOrResize);
});
</script>

<style scoped>
.developers-view {
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

/* Category Filter Pills */
.filter-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-pill {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
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

/* Developer Profile Cell */
.dev-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dev-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.avatar-blue {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid rgba(3, 105, 161, 0.2);
}

.avatar-green {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid rgba(21, 128, 61, 0.2);
}

.avatar-amber {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid rgba(180, 83, 9, 0.2);
}

.avatar-teal {
  background: #ccfbf1;
  color: #0f766e;
  border: 1px solid rgba(15, 118, 110, 0.2);
}

.avatar-indigo {
  background: #e0e7ff;
  color: #4338ca;
  border: 1px solid rgba(67, 56, 202, 0.2);
}

.avatar-purple {
  background: #f3e8ff;
  color: #7e22ce;
  border: 1px solid rgba(126, 34, 206, 0.2);
}

.avatar-rose {
  background: #ffe4e6;
  color: #be123c;
  border: 1px solid rgba(190, 18, 60, 0.2);
}

.avatar-lime {
  background: #ecfccb;
  color: #4d7c0f;
  border: 1px solid rgba(77, 124, 15, 0.2);
}

.avatar-orange {
  background: #ffedd5;
  color: #c2410c;
  border: 1px solid rgba(194, 65, 12, 0.2);
}

.avatar-default {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid rgba(71, 85, 105, 0.2);
}

.dev-name-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #14171c);
}

/* Category Badges */
.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  font-family: var(--font-body);
}

.cat-ui {
  background: #e0f2fe;
  color: #0369a1;
}

.cat-frontend {
  background: #dcfce7;
  color: #15803d;
}

.cat-backend {
  background: #fef3c7;
  color: #b45309;
}

.cat-fullstack {
  background: #ccfbf1;
  color: #0f766e;
}

.cat-devops {
  background: #e0e7ff;
  color: #4338ca;
}

.cat-executive {
  background: #f3e8ff;
  color: #7e22ce;
}

.cat-qa {
  background: #ffe4e6;
  color: #be123c;
}

.cat-seo {
  background: #ecfccb;
  color: #4d7c0f;
}

.cat-marketing {
  background: #ffedd5;
  color: #c2410c;
}

.cat-default {
  background: #f1f5f9;
  color: #475569;
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

/* Delete Modal Danger Badge */
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
}
</style>
