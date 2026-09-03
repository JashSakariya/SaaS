<template>
  <div class="project-detail-view">
    <!-- Task Create/Edit Modal -->
    <TaskModal
      :is-open="showTaskModal"
      :project-name="projectData.title"
      :project-id="projectId"
      :client-id="clientId"
      :mode="taskModalMode"
      :task="selectedTask"
      @close="showTaskModal = false"
      @create="handleTaskCreated"
      @update="handleTaskUpdated"
    />

    <!-- Delete Task Confirmation Modal -->
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
            <h3>Delete Task</h3>
          </div>
          <p class="modal-body">
            Are you sure you want to delete <strong>{{ deleteItemName }}</strong>? This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn-danger" :disabled="isDeleting" @click="confirmDelete">
              {{ isDeleting ? 'Deleting...' : 'Delete Task' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="fade">
      <div v-if="toastMessage" class="toast-popup">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- Top Navigation Header -->
    <div class="nav-header">
      <router-link :to="`/clients/${clientId}`" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to {{ clientData.name || 'Client' }}
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading project details...</p>
    </div>

    <div v-else class="project-content-layout">
      <!-- Project Hero Card -->
      <div class="card project-hero-card">
        <div class="hero-left">
          <div class="project-avatar-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="project-hero-info">
            <div class="project-title-row">
              <h1 class="project-title-heading">{{ projectData.title }}</h1>
              <span class="status-pill" :class="projectData.status">{{ formatStatus(projectData.status) }}</span>
            </div>
            <p v-if="projectData.description" class="project-description-text">
              {{ projectData.description }}
            </p>
            <div class="project-meta-pills">
              <span class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Client: <router-link :to="`/clients/${clientId}`" class="client-link-underline">{{ clientData.name || 'Client #' + clientId }}</router-link>
              </span>
              <span class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                </svg>
                Due: {{ formattedDueDate }}
              </span>
              <span class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                {{ tasks.length }} {{ tasks.length === 1 ? 'Task' : 'Tasks' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks Card Table -->
      <div class="card tasks-table-card">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left">
            <h2 class="card-title">Project Tasks</h2>
            <span class="count-badge">{{ filteredTasks.length }} total</span>
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
                placeholder="Search tasks..." 
                class="search-input"
              />
              <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">×</button>
            </div>
            <button type="button" class="btn-text-action" @click="openCreateTask">
              + New Task
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="tasks.length === 0" class="empty-state-container">
          <div class="empty-state-card">
            <div class="empty-icon-wrapper">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h3>No tasks yet for this project</h3>
            <p>Break down this project into deliverables and track progress with your team.</p>
            <button type="button" class="btn-primary" @click="openCreateTask">
              + Add First Task
            </button>
          </div>
        </div>

        <!-- No Search Results -->
        <div v-else-if="filteredTasks.length === 0" class="no-search-results">
          <p>No tasks match your query "<strong>{{ searchQuery }}</strong>"</p>
          <button class="btn-secondary" @click="searchQuery = ''">Reset Search</button>
        </div>

        <!-- Tasks Table -->
        <div v-else class="table-scroll-wrapper">
          <table class="tasks-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="task in filteredTasks" 
                :key="task.id" 
                class="task-row"
              >
                <!-- Title -->
                <td class="task-title-cell">
                  <router-link :to="`/clients/${clientId}/projects/${projectId}/tasks/${task.id}`" class="task-title-link">
                    {{ task.title }}
                  </router-link>
                </td>

                <!-- Assignee -->
                <td class="assignee-cell">
                  <div v-if="task.assignee" class="assignee-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>{{ task.assignee }}</span>
                  </div>
                  <span v-else class="empty-dash">—</span>
                </td>

                <!-- Due Date -->
                <td class="due-date-cell mono">
                  <div v-if="task.due_date || task.dueDate" class="date-tag">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                    </svg>
                    <span>{{ (task.due_date || task.dueDate).split('T')[0] }}</span>
                  </div>
                  <span v-else class="empty-dash">—</span>
                </td>

                <!-- Status -->
                <td>
                  <span class="task-status-pill" :class="task.status">
                    {{ formatStatus(task.status) }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="action-cell text-right">
                  <div class="action-wrapper">
                    <button 
                      @click.stop="toggleTaskDropdown($event, task)"
                      class="btn-action-trigger" 
                      :class="{ active: activeTaskDropdownId === task.id }"
                      type="button"
                    >
                      Action
                      <svg class="chevron-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
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

    <!-- Fixed Overlay Task Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="activeTaskDropdownId !== null" class="dropdown-backdrop" @click="closeTaskDropdown"></div>

      <div 
        v-if="activeTaskDropdownId !== null && activeDropdownTask" 
        class="actions-dropdown fixed-overlay" 
        :style="taskDropdownStyle"
      >
        <router-link 
          :to="`/clients/${clientId}/projects/${projectId}/tasks/${activeDropdownTask.id}`" 
          class="dropdown-item view-btn"
          @click="closeTaskDropdown"
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
          @click="openEditTask(activeDropdownTask); closeTaskDropdown();" 
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
          @click="promptDeleteTask(activeDropdownTask); closeTaskDropdown();" 
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/ApiService';
import TaskModal, { type TaskFormData } from '@/components/TaskModal.vue';

const route = useRoute();

const clientId = computed(() => route.params.id as string);
const projectId = computed(() => route.params.pid as string);

const isLoading = ref(true);
const toastMessage = ref('');
const searchQuery = ref('');

// Task Action Dropdown State
const activeTaskDropdownId = ref<number | null>(null);
const activeDropdownTask = ref<any>(null);
const activeTaskTriggerEl = ref<HTMLElement | null>(null);
const taskDropdownStyle = ref<Record<string, string>>({});

const closeTaskDropdown = () => {
  activeTaskDropdownId.value = null;
  activeDropdownTask.value = null;
  activeTaskTriggerEl.value = null;
};

const updateTaskDropdownPosition = () => {
  if (!activeTaskTriggerEl.value) return;
  const rect = activeTaskTriggerEl.value.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) {
    closeTaskDropdown();
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

  taskDropdownStyle.value = {
    position: 'fixed',
    top: topPos,
    left: leftPos,
    minWidth: `${dropdownWidth}px`,
    zIndex: '10000'
  };
};

const toggleTaskDropdown = (event: MouseEvent, task: any) => {
  if (!task || task.id === null) return;
  if (activeTaskDropdownId.value === task.id) {
    closeTaskDropdown();
    return;
  }
  activeTaskTriggerEl.value = event.currentTarget as HTMLElement;
  activeDropdownTask.value = task;
  activeTaskDropdownId.value = task.id;
  updateTaskDropdownPosition();
};

const handleScrollOrResize = () => {
  if (activeTaskDropdownId.value !== null) {
    updateTaskDropdownPosition();
  }
};

// Project data (Information display)
const projectData = ref<any>({
  id: null,
  title: '',
  description: '',
  status: 'active',
  due_date: null,
  dueDate: null
});

// Client data
const clientData = ref<any>({
  id: null,
  name: ''
});

// Tasks state
const tasks = ref<any[]>([]);

// Modals state
const showTaskModal = ref(false);
const taskModalMode = ref<'create' | 'edit'>('create');
const selectedTask = ref<any>(null);

// Delete Modal state
const showDeleteModal = ref(false);
const deleteItemName = ref('');
const deleteItemId = ref<number | null>(null);
const isDeleting = ref(false);

const formattedDueDate = computed(() => {
  const raw = projectData.value.due_date || projectData.value.dueDate;
  if (!raw) return 'No due date';
  return raw.split('T')[0];
});

const filteredTasks = computed(() => {
  if (!searchQuery.value.trim()) return tasks.value;
  const q = searchQuery.value.toLowerCase().trim();
  return tasks.value.filter((t: any) =>
    t.title?.toLowerCase().includes(q) ||
    t.assignee?.toLowerCase().includes(q) ||
    t.status?.toLowerCase().includes(q)
  );
});

const formatStatus = (st: string) => {
  if (!st) return '—';
  return st.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const showToast = (msg: string, duration = 2500) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, duration);
};

// Fetch Project & Client Details
const fetchProjectDetails = async () => {
  isLoading.value = true;
  try {
    const res = await api.get(`/client/${clientId.value}/projects/${projectId.value}`);
    if (res.data?.data) {
      projectData.value = res.data.data;
    }
  } catch (err: any) {
    console.error('Error fetching project:', err);
    showToast('Failed to load project details');
  } finally {
    isLoading.value = false;
  }
};

const fetchClientDetails = async () => {
  try {
    const res = await api.get(`/client/${clientId.value}`);
    if (res.data?.data) {
      clientData.value = res.data.data;
    }
  } catch (err: any) {
    console.error('Error fetching client info:', err);
  }
};

const fetchTasks = async () => {
  try {
    const res = await api.get(`/client/${clientId.value}/projects/${projectId.value}/tasks`);
    tasks.value = res.data?.data || [];
  } catch (err: any) {
    console.error('Error fetching tasks:', err);
  }
};

// Task handlers
const openCreateTask = () => {
  selectedTask.value = null;
  taskModalMode.value = 'create';
  showTaskModal.value = true;
};

const openEditTask = (task: any) => {
  selectedTask.value = task;
  taskModalMode.value = 'edit';
  showTaskModal.value = true;
};

const handleTaskCreated = async (data: TaskFormData) => {
  try {
    await api.post(`/client/${clientId.value}/projects/${projectId.value}/tasks`, data);
    showToast('Task created successfully');
    showTaskModal.value = false;
    await fetchTasks();
  } catch (err) {
    console.error('Error creating task:', err);
    showToast('Failed to create task');
  }
};

const handleTaskUpdated = async (data: any) => {
  try {
    await api.put(`/client/${clientId.value}/projects/${projectId.value}/tasks/${data.id}`, data);
    showToast('Task updated successfully');
    showTaskModal.value = false;
    await fetchTasks();
  } catch (err) {
    console.error('Error updating task:', err);
    showToast('Failed to update task');
  }
};

const promptDeleteTask = (task: any) => {
  deleteItemName.value = task.title || 'this task';
  deleteItemId.value = task.id;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!deleteItemId.value) return;
  isDeleting.value = true;
  try {
    await api.delete(`/client/${clientId.value}/projects/${projectId.value}/tasks/${deleteItemId.value}`);
    showToast('Task deleted successfully');
    await fetchTasks();
  } catch (err) {
    console.error('Delete task error:', err);
    showToast('Failed to delete task');
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};

onMounted(async () => {
  await Promise.all([
    fetchProjectDetails(),
    fetchClientDetails(),
    fetchTasks()
  ]);
  window.addEventListener('scroll', handleScrollOrResize, true);
  window.addEventListener('resize', handleScrollOrResize);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScrollOrResize, true);
  window.removeEventListener('resize', handleScrollOrResize);
});

watch(
  () => [route.params.id, route.params.pid],
  ([newCid, newPid]) => {
    if (newCid && newPid) {
      fetchProjectDetails();
      fetchClientDetails();
      fetchTasks();
    }
  }
);
</script>

<style scoped>
.project-detail-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 0 60px;
  font-family: var(--font-body);
  color: var(--ink);
}

/* Project Hero Card */
.project-hero-card {
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

.hero-left {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  flex: 1;
}

.project-hero-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.project-title-heading {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0;
}

.project-description-text {
  font-size: 13.5px;
  color: var(--slate, #6b7280);
  line-height: 1.5;
  margin: 2px 0 6px;
}

.project-meta-pills {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.client-link-underline {
  color: var(--forest, #0e5c4a);
  font-weight: 600;
  text-decoration: none;
}

.client-link-underline:hover {
  text-decoration: underline;
}
</style>
