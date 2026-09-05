<template>
  <div class="task-detail-view">
    <!-- Task Edit Modal -->
    <TaskModal
      :is-open="showEditModal"
      :project-name="projectData.title"
      :project-id="projectId"
      :client-id="clientId"
      mode="edit"
      :task="taskData"
      @close="showEditModal = false"
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
            Are you sure you want to delete <strong>{{ taskData.title }}</strong>? This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showDeleteModal = false">Cancel</button>
            <button type="button" class="btn-danger" :disabled="isDeleting" @click="confirmDeleteTask">
              {{ isDeleting ? 'Deleting...' : 'Delete Task' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Popup -->
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
      <router-link :to="`/clients/${clientId}/projects/${projectId}`" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to project "{{ projectData.title || 'Project' }}"
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading task details...</p>
    </div>

    <div v-else class="task-content-layout">
      <!-- Task Hero Overview Card -->
      <div class="card task-hero-card">
        <div class="task-hero-left">
          <div class="task-title-row">
            <h1 class="task-title-heading">{{ taskData.title }}</h1>
            <span class="status-pill" :class="taskData.status">
              {{ formatStatus(taskData.status) }}
            </span>
          </div>

          <p class="task-project-subtext">
            Part of project 
            <router-link :to="`/clients/${clientId}/projects/${projectId}`" class="project-inline-link">
              {{ projectData.title || 'Project' }} (#{{ projectId }})
            </router-link>
          </p>

          <div class="task-meta-pills">
            <span v-if="taskData.developer" class="meta-item developer-assigned">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ taskData.developer.name }}
              <span class="meta-category-badge" :class="getCategoryClass(taskData.developer.category)">
                {{ taskData.developer.category }}
              </span>
            </span>
            <span v-else-if="taskData.assignee" class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ taskData.assignee }}
            </span>
            <span v-else class="meta-item unassigned">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Unassigned
            </span>

            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
              </svg>
              Due {{ formattedDueDate }}
            </span>
          </div>
        </div>

        <div class="task-hero-actions">
          <button type="button" class="btn-action-outline" @click="showEditModal = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button type="button" class="btn-action-outline danger" @click="showDeleteModal = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- Activity Notes Card Section -->
      <div class="card comments-card">
        <div class="comments-header">
          <div class="comments-title-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h2 class="comments-title">Activity notes</h2>
            <span class="comments-count">({{ comments.length }})</span>
          </div>
        </div>

        <!-- Notes List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments-prompt">
            No activity notes yet. Add updates or key milestones below.
          </div>

          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <div class="comment-body">
              <div class="comment-top-row">
                <div class="comment-meta">
                  <span class="comment-time" :title="comment.createdAt || comment.created_at">
                    {{ formatCommentDate(comment.createdAt || comment.created_at) }}
                  </span>
                  <span v-if="comment.developer" class="comment-developer-badge">
                    <span class="dot-indicator"></span>
                    {{ comment.developer.name }} ({{ comment.developer.category }})
                  </span>
                </div>
                
                <div class="action-wrapper">
                  <button 
                    @click.stop="toggleCommentDropdown($event, comment)"
                    class="btn-action-dots" 
                    :class="{ active: activeCommentDropdownId === comment.id }"
                    type="button"
                    aria-label="Actions"
                    title="Actions"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                      <circle cx="19" cy="12" r="2"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Inline Edit Mode -->
              <div v-if="editingCommentId === comment.id" class="comment-edit-box">
                <textarea 
                  v-model="editingCommentText" 
                  class="comment-edit-textarea" 
                  rows="2"
                  placeholder="Edit note..."
                  @keydown.esc="cancelEditComment"
                ></textarea>
                <div class="comment-edit-actions">
                  <button type="button" class="btn-cancel-sm" @click="cancelEditComment">Cancel</button>
                  <button 
                    type="button" 
                    class="btn-save-sm" 
                    :disabled="!editingCommentText.trim() || isSavingComment" 
                    @click="saveEditComment(comment.id)"
                  >
                    {{ isSavingComment ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>

              <div v-else class="comment-message">
                {{ comment.content || comment.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Add Activity Note Form -->
        <div class="comment-form-container">
          <form @submit.prevent="postComment" class="comment-form-box">
            <div v-if="developers.length > 0" class="note-dev-select-row">
              <label class="note-dev-label">Attribute to employee (optional):</label>
              <select v-model="newCommentDevId" class="note-dev-select">
                <option :value="null">No attribution (General note)</option>
                <option v-for="dev in developers" :key="dev.id" :value="dev.id">
                  {{ dev.name }} ({{ dev.category }})
                </option>
              </select>
            </div>

            <div class="comment-input-row">
              <input 
                v-model="newCommentText" 
                type="text" 
                placeholder="Add an activity note or milestone update..." 
                class="comment-input"
              />
              <button 
                type="submit" 
                class="btn-primary post-btn" 
                :disabled="!newCommentText.trim() || isPostingComment"
              >
                {{ isPostingComment ? 'Adding...' : 'Add note' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Fixed Overlay Comment Action Dropdown Teleported to Body -->
    <Teleport to="body">
      <div v-if="activeCommentDropdownId !== null" class="dropdown-backdrop" @click="closeCommentDropdown"></div>

      <div 
        v-if="activeCommentDropdownId !== null && activeComment" 
        class="actions-dropdown fixed-overlay" 
        :style="commentDropdownStyle"
      >
        <button 
          type="button" 
          @click="startEditComment(activeComment)" 
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
          @click="deleteComment(activeComment.id)" 
          class="dropdown-item delete-btn"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/ApiService';
import TaskModal, { type TaskFormData } from '@/components/TaskModal.vue';

const route = useRoute();
const router = useRouter();

const clientId = computed(() => route.params.id as string);
const projectId = computed(() => route.params.pid as string);
const taskId = computed(() => route.params.tid as string);

const isLoading = ref(true);
const toastMessage = ref('');
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const isDeleting = ref(false);

const taskData = ref<any>({
  id: null,
  title: '',
  status: 'todo',
  due_date: null,
  dueDate: null,
  assignee: '',
  project_id: null
});

const projectData = ref<any>({
  id: null,
  title: ''
});

// Feedback & Comments state
const newCommentText = ref('');
const newCommentDevId = ref<number | null>(null);
const comments = ref<any[]>([]);
const developers = ref<any[]>([]);
const isPostingComment = ref(false);
const editingCommentId = ref<number | null>(null);
const editingCommentText = ref('');
const isSavingComment = ref(false);

const activeCommentDropdownId = ref<number | null>(null);
const activeComment = ref<any>(null);
const commentDropdownStyle = ref<Record<string, string>>({});

// Category Badge Helper
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

// Format Date & Relative Time
const formatCommentDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Fetch Developers List
const fetchDevelopers = async () => {
  try {
    const res = await api.get('/developers');
    if (res.data?.data) {
      developers.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching developers:', err);
  }
};

// Fetch Comments
const fetchComments = async () => {
  try {
    const res = await api.get(`/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}/comments`);
    if (res.data?.data) {
      comments.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching comments:', err);
  }
};

// Create Comment
const postComment = async () => {
  if (!newCommentText.value.trim() || isPostingComment.value) return;
  isPostingComment.value = true;
  try {
    const payload = {
      content: newCommentText.value.trim(),
      text: newCommentText.value.trim(),
      developer_id: newCommentDevId.value || null,
      developerId: newCommentDevId.value || null,
      author: localStorage.getItem('userName') || undefined,
    };
    const res = await api.post(
      `/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}/comments`,
      payload
    );
    if (res.data?.data) {
      comments.value.push(res.data.data);
    }
    newCommentText.value = '';
    newCommentDevId.value = null;
    showToast('Activity note added');
  } catch (err) {
    console.error('Error posting note:', err);
    showToast('Failed to add note');
  } finally {
    isPostingComment.value = false;
  }
};

// Edit / Update Comment
const startEditComment = (comment: any) => {
  editingCommentId.value = comment.id;
  editingCommentText.value = comment.content || comment.text || '';
  closeCommentDropdown();
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editingCommentText.value = '';
};

const saveEditComment = async (commentId: number) => {
  if (!editingCommentText.value.trim() || isSavingComment.value) return;
  isSavingComment.value = true;
  try {
    const res = await api.put(
      `/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}/comments/${commentId}`,
      {
        content: editingCommentText.value.trim(),
        text: editingCommentText.value.trim(),
      }
    );
    const updated = res.data?.data;
    const idx = comments.value.findIndex(c => c.id === commentId);
    if (idx !== -1) {
      if (updated) {
        comments.value[idx] = updated;
      } else {
        comments.value[idx].content = editingCommentText.value.trim();
        comments.value[idx].text = editingCommentText.value.trim();
        comments.value[idx].updatedAt = new Date().toISOString();
      }
    }
    editingCommentId.value = null;
    editingCommentText.value = '';
    showToast('Note updated');
  } catch (err) {
    console.error('Error updating note:', err);
    showToast('Failed to update note');
  } finally {
    isSavingComment.value = false;
  }
};

// Delete Comment
const deleteComment = async (commentId: number) => {
  try {
    await api.delete(
      `/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}/comments/${commentId}`
    );
    comments.value = comments.value.filter(c => c.id !== commentId);
    showToast('Comment deleted');
  } catch (err) {
    console.error('Error deleting comment:', err);
    showToast('Failed to delete comment');
  } finally {
    closeCommentDropdown();
  }
};

// Dropdown Positioning
const updateCommentDropdownPosition = (button: HTMLElement) => {
  const rect = button.getBoundingClientRect();
  const dropdownHeight = 85;
  const dropdownWidth = 110;
  const spaceBelow = window.innerHeight - rect.bottom;

  let topPos: string;
  const leftPos = `${Math.max(10, rect.right - dropdownWidth)}px`;

  if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
    topPos = `${rect.top - dropdownHeight - 4}px`;
  } else {
    topPos = `${rect.bottom + 4}px`;
  }

  commentDropdownStyle.value = {
    position: 'fixed',
    top: topPos,
    left: leftPos,
    minWidth: `${dropdownWidth}px`,
    zIndex: '10000',
  };
};

const toggleCommentDropdown = (event: MouseEvent, commentItem: any) => {
  if (!commentItem || commentItem.id === null) return;

  if (activeCommentDropdownId.value === commentItem.id) {
    closeCommentDropdown();
    return;
  }

  const button = event.currentTarget as HTMLElement;
  activeCommentDropdownId.value = commentItem.id;
  activeComment.value = commentItem;
  updateCommentDropdownPosition(button);
};

const closeCommentDropdown = () => {
  activeCommentDropdownId.value = null;
  activeComment.value = null;
};


const formattedDueDate = computed(() => {
  const raw = taskData.value.due_date || taskData.value.dueDate;
  if (!raw) return 'No due date';
  return raw.split('T')[0];
});

const formatStatus = (st: string) => {
  if (!st) return 'To Do';
  return st.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const showToast = (msg: string, duration = 2500) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, duration);
};

// Fetch Task & Project Details
const fetchTaskData = async () => {
  isLoading.value = true;
  try {
    const res = await api.get(`/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}`);
    if (res.data?.data) {
      taskData.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching task details:', err);
    showToast('Failed to load task details');
  } finally {
    isLoading.value = false;
  }
};

const fetchProjectData = async () => {
  try {
    const res = await api.get(`/client/${clientId.value}/projects/${projectId.value}`);
    if (res.data?.data) {
      projectData.value = res.data.data;
    }
  } catch (err) {
    console.error('Error fetching project data:', err);
  }
};

const handleTaskUpdated = async (data: TaskFormData) => {
  try {
    await api.put(`/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}`, data);
    showToast('Task updated successfully');
    showEditModal.value = false;
    await fetchTaskData();
  } catch (err) {
    console.error('Update error:', err);
    showToast('Failed to update task');
  }
};

const confirmDeleteTask = async () => {
  isDeleting.value = true;
  try {
    await api.delete(`/client/${clientId.value}/projects/${projectId.value}/tasks/${taskId.value}`);
    showToast('Task deleted successfully');
    router.push(`/clients/${clientId.value}/projects/${projectId.value}`);
  } catch (err) {
    console.error('Delete error:', err);
    showToast('Failed to delete task');
  } finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};



onMounted(async () => {
  await Promise.all([
    fetchTaskData(),
    fetchProjectData(),
    fetchComments(),
    fetchDevelopers(),
  ]);
});
</script>

<style scoped>
.task-detail-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 0 60px;
  font-family: var(--font-body);
  color: var(--ink);
}

.task-content-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Task Hero Card */
.task-hero-card {
  padding: 24px 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.task-hero-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.task-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.task-title-heading {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 24px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0;
}

.task-project-subtext {
  font-size: 13.5px;
  color: var(--slate, #6b7280);
  margin: 0;
}

.project-inline-link {
  color: var(--forest, #0e5c4a);
  font-weight: 600;
  text-decoration: none;
}

.project-inline-link:hover {
  text-decoration: underline;
}

.task-meta-pills {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.task-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Comments Card */
.comments-card {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comments-header {
  border-bottom: 1px solid var(--line, #e4e1d8);
  padding-bottom: 14px;
}

.comments-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
}

.comments-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.comments-count {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--slate);
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.no-comments-prompt {
  font-size: 13.5px;
  color: var(--slate);
  padding: 12px 0;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--info-soft, #e0f2fe);
  color: var(--info, #0369a1);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(3, 105, 161, 0.15);
}

.comment-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-author {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
}

.comment-time {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--slate);
}

.comment-message {
  font-size: 14px;
  color: var(--ink-soft, #2b2f36);
  line-height: 1.5;
}

/* Action Trigger Button */
.action-wrapper {
  position: relative;
}

.btn-action-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  color: var(--ink, #14171c);
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-action-trigger:hover,
.btn-action-trigger.active {
  background: #f0eee6;
  border-color: var(--line-strong, #d8d4c8);
}

.chevron-icon {
  transition: transform var(--transition-fast, 0.15s ease);
}

.btn-action-trigger.active .chevron-icon {
  transform: rotate(180deg);
}

/* Fixed Overlay Dropdown */
.dropdown-backdrop {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 9999;
}

.actions-dropdown.fixed-overlay {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 6px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(20, 23, 28, 0.08));
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm, 4px);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink, #14171c);
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background var(--transition-fast, 0.15s ease), color var(--transition-fast, 0.15s ease);
}

.dropdown-item:hover {
  background: var(--paper, #fbfaf6);
}

.dropdown-item.edit-btn:hover {
  color: var(--forest, #0e5c4a);
}

.dropdown-item.delete-btn:hover {
  color: var(--danger, #a3372c);
  background: var(--danger-soft, #f6e9e7);
}

/* Comment Inline Edit */
.comment-edit-box {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-edit-textarea {
  width: 100%;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13.5px;
  font-family: var(--font-body);
  color: var(--ink);
  outline: none;
  resize: vertical;
  min-height: 56px;
  transition: all var(--transition-fast, 0.15s ease);
}

.comment-edit-textarea:focus {
  border-color: var(--forest);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--forest-soft);
}

.comment-edit-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel-sm {
  background: transparent;
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel-sm:hover {
  background: var(--paper, #fbfaf6);
  color: var(--ink);
}

.btn-save-sm {
  background: var(--forest, #0e5c4a);
  border: 1px solid var(--forest, #0e5c4a);
  color: #ffffff;
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-sm:hover:not(:disabled) {
  background: var(--forest-dark, #0a4638);
}

.btn-save-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Developer Assignment Badge in Hero */
.meta-item.developer-assigned {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: var(--ink, #14171c);
}

.meta-category-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Category colors */
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

.cat-sales {
  background: #f3e8ff;
  color: #7e22ce;
}

.cat-default {
  background: #f1f5f9;
  color: #475569;
}

/* Comment Developer Attribution Badge */
.comment-developer-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--forest, #0e5c4a);
  background: var(--forest-soft, #e7f0ed);
  padding: 2px 8px;
  border-radius: 4px;
}

.dot-indicator {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

/* Add Activity Note Form */
.comment-form-container {
  margin-top: 8px;
  padding-top: 18px;
  border-top: 1px solid var(--line, #e4e1d8);
}

.comment-form-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-dev-select-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.note-dev-label {
  font-size: 12px;
  color: var(--slate, #6b7280);
  font-weight: 500;
}

.note-dev-select {
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-sm, 4px);
  padding: 4px 10px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--ink);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.note-dev-select:focus {
  border-color: var(--forest);
  background: #ffffff;
}

.comment-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-input {
  flex: 1;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 13.5px;
  color: var(--ink);
  outline: none;
  font-family: var(--font-body);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.comment-input:focus {
  border-color: var(--forest);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--forest-soft);
}

.post-btn {
  padding: 10px 22px;
}
</style>
