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
            <span v-if="taskData.assignee" class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {{ taskData.assignee }}
            </span>
            <span v-else class="meta-item">
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

      <!-- Comments / Feedback Card Section -->
      <div class="card comments-card">
        <div class="comments-header">
          <div class="comments-title-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h2 class="comments-title">Comments</h2>
            <span class="comments-count">({{ comments.length }})</span>
          </div>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments-prompt">
            No comments yet. Be the first to share an update or feedback!
          </div>

          <div 
            v-for="comment in comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <div class="comment-avatar">
              {{ (comment.author || 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="comment-body">
              <div class="comment-top-row">
                <div class="comment-meta">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ comment.time }}</span>
                </div>
                <button 
                  type="button" 
                  class="comment-delete-btn" 
                  title="Delete comment"
                  @click="deleteComment(comment.id)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
              <div class="comment-message">
                {{ comment.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Write Feedback / Comment Input -->
        <div class="comment-form-container">
          <form @submit.prevent="postComment" class="comment-form">
            <input 
              v-model="newCommentText" 
              type="text" 
              placeholder="Write a comment..." 
              class="comment-input"
            />
            <button 
              type="submit" 
              class="btn-primary post-btn" 
              :disabled="!newCommentText.trim()"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

// Feedback & Comments state with persistence
const newCommentText = ref('');
const defaultComments = [
  {
    id: 1,
    author: 'jash',
    time: '2 hrs ago',
    text: 'Started working on this'
  },
  {
    id: 2,
    author: 'jash',
    time: '1 hr ago',
    text: 'Almost done, testing left'
  }
];

const comments = ref<any[]>([]);

const loadComments = () => {
  const saved = localStorage.getItem(`task_comments_${taskId.value}`);
  if (saved) {
    try {
      comments.value = JSON.parse(saved);
    } catch {
      comments.value = [...defaultComments];
    }
  } else {
    comments.value = [...defaultComments];
  }
};

const saveComments = () => {
  localStorage.setItem(`task_comments_${taskId.value}`, JSON.stringify(comments.value));
};

const deleteComment = (commentId: number | string) => {
  comments.value = comments.value.filter(c => c.id !== commentId);
  saveComments();
  showToast('Comment removed');
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

const postComment = () => {
  if (!newCommentText.value.trim()) return;
  comments.value.push({
    id: Date.now(),
    author: taskData.value.assignee || 'jash',
    time: 'Just now',
    text: newCommentText.value.trim()
  });
  saveComments();
  newCommentText.value = '';
  showToast('Comment posted');
};

onMounted(async () => {
  loadComments();
  await Promise.all([
    fetchTaskData(),
    fetchProjectData()
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

.comment-delete-btn {
  background: transparent;
  border: none;
  color: var(--slate);
  opacity: 0;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 0.15s ease);
}

.comment-item:hover .comment-delete-btn {
  opacity: 0.6;
}

.comment-delete-btn:hover {
  opacity: 1 !important;
  color: var(--danger, #a3372c);
  background: var(--danger-soft, #f6e9e7);
}

.comment-message {
  font-size: 14px;
  color: var(--ink-soft, #2b2f36);
  line-height: 1.5;
}

/* Comment Form */
.comment-form-container {
  margin-top: 8px;
  padding-top: 18px;
  border-top: 1px solid var(--line, #e4e1d8);
}

.comment-form {
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
