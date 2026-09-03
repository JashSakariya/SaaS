<template>
  <Transition name="fade">
    <div v-if="isOpen" class="task-modal-backdrop" @click="closeModal">
      <div class="task-modal-card" @click.stop>
        <!-- Header -->
        <div class="task-modal-header">
          <h3 class="task-modal-title">{{ mode === 'edit' ? 'Edit Task' : 'New Task' }}</h3>
          <button type="button" class="task-modal-close" @click="closeModal" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="task-modal-body">
          <!-- Task Title -->
          <div class="task-form-group">
            <label class="task-form-label">Task title</label>
            <input type="text" v-model="form.title" class="task-form-input" placeholder="e.g. Design wireframes & brand kit" />
          </div>

          <!-- Assignee -->
          <div class="task-form-group">
            <label class="task-form-label">Assignee</label>
            <input type="text" v-model="form.assignee" class="task-form-input" placeholder="e.g. Sarah Connor or sarah@example.com" />
          </div>

          <!-- Row: Due Date & Status -->
          <div class="task-form-row">
            <!-- Due Date -->
            <div class="task-form-group col">
              <label class="task-form-label">Due date</label>
              <div class="date-input-wrapper">
                <input type="date" v-model="form.dueDate" class="task-form-input date-input"
                  placeholder="dd/mm/yyyy" />
                <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>

            <!-- Status -->
            <div class="task-form-group col">
              <label class="task-form-label">Status</label>
              <div class="select-input-wrapper">
                <select v-model="form.status" class="task-form-select">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <!-- Linked Project Info Footer Row -->
          <div class="task-modal-footer">
            <div class="task-linked-context">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Project: {{ projectName || 'Selected Project' }} (#{{ projectId || '—' }})</span>
            </div>
            <div class="task-modal-actions">
              <button type="button" class="btn-theme-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="button" class="btn-theme-primary" @click="handleSubmit">
                {{ mode === 'edit' ? 'Update task' : 'Create task' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface TaskFormData {
  title: string;
  assignee: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
}

const props = defineProps<{
  isOpen: boolean;
  projectName?: string;
  projectId?: string | number | null;
  clientId?: string | number | null;
  mode?: 'create' | 'edit';
  task?: {
    id: number;
    title: string;
    assignee?: string | null;
    status: string;
    due_date?: string | null;
    dueDate?: string | null;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', data: TaskFormData): void;
  (e: 'update', data: TaskFormData & { id: number }): void;
}>();

const form = ref<TaskFormData>({
  title: '',
  assignee: '',
  dueDate: '',
  status: 'todo',
});

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.task) {
        const rawDate = props.task.due_date ?? (props.task as any)?.dueDate;
        form.value = {
          title: props.task.title || '',
          assignee: props.task.assignee || '',
          dueDate: rawDate ? rawDate.split('T')[0] : '',
          status: (props.task.status as any) || 'todo',
        };
      } else {
        form.value = {
          title: '',
          assignee: '',
          dueDate: '',
          status: 'todo',
        };
      }
    }
  }
);

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!form.value.title.trim()) return;
  if (props.mode === 'edit' && props.task?.id) {
    emit('update', { id: props.task.id, ...form.value });
  } else {
    emit('create', { ...form.value });
  }
  closeModal();
};
</script>
