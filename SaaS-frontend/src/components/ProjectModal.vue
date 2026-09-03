<template>
  <Transition name="fade">
    <div v-if="isOpen" class="project-modal-backdrop" @click="closeModal">
      <div class="project-modal-card" @click.stop>
        <!-- Header -->
        <div class="project-modal-header">
          <h3 class="project-modal-title">{{ mode === 'edit' ? 'Edit Project' : 'New Project' }}</h3>
          <button type="button" class="project-modal-close" @click="closeModal" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="project-modal-body">
          <!-- Project Title -->
          <div class="project-form-group">
            <label class="project-form-label">Project title</label>
            <input type="text" v-model="form.title" class="project-form-input" placeholder="Website redesign" />
          </div>

          <!-- Description -->
          <div class="project-form-group">
            <label class="project-form-label">Description</label>
            <textarea v-model="form.description" class="project-form-textarea"
              placeholder="Brief details about the project" rows="4"></textarea>
          </div>

          <!-- Row: Due Date & Status -->
          <div class="project-form-row">
            <!-- Due Date -->
            <div class="project-form-group col">
              <label class="project-form-label">Due date</label>
              <div class="date-input-wrapper">
                <input type="date" v-model="form.dueDate" class="project-form-input date-input"
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
            <div class="project-form-group col">
              <label class="project-form-label">Status</label>
              <div class="select-input-wrapper">
                <select v-model="form.status" class="project-form-select">
                  <option value="" disabled selected>Select status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On hold</option>
                </select>
                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <!-- Linked Client Info Footer Row -->
          <div class="project-modal-footer">
            <div class="project-linked-client">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Linked to client: {{ clientName || 'old' }} (#{{ clientId || '13' }})</span>
            </div>
            <div class="project-modal-actions">
              <button type="button" class="btn-theme-secondary" @click="closeModal">
                Cancel
              </button>
              <button type="button" class="btn-theme-primary" @click="handleCreate">
                {{ mode === 'edit' ? 'Update' : 'Create project' }}
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

export interface ProjectFormData {
  title: string;
  description: string;
  dueDate: string;
  status: string;
}

const props = defineProps<{
  isOpen: boolean;
  clientName?: string;
  clientId?: string | number | null;
  mode?: 'create' | 'edit'
  project?: {
    id: number
    title: string
    description: string
    status: string
    due_date: string | null
  } | null
}>();


console.log("projects prop value ", props.project)

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', data: ProjectFormData): void;
}>();

const form = ref<ProjectFormData>({
  title: '',
  description: '',
  dueDate: '',
  status: 'active'
});

watch(
  () => form.value.dueDate,
  (newVal, oldVal) => {
    console.log('dueDate changed — old:', oldVal, 'new:', newVal)
  }
)


// watch(
//   () => props.isOpen,
//   (newVal) => {
//     if (newVal) {
//       form.value = {
//         title: '',
//         description: '',
//         dueDate: '',
//         status: 'In progress'
//       };
//     }
//   }
// );


watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {

      if (props.mode === 'edit' && props.project) {
        const rawDate = props.project.due_date ?? (props.project as any)?.dueDate
        
        form.value = {
          title: props.project.title,
          description: props.project.description,
          dueDate: rawDate ? rawDate.split('T')[0] : '',
          status: props.project.status,
        }
        console.log("due date : ", props.project.due_date)
      } else {
        form.value = {
          title: '',
          description: '',
          dueDate: '',
          status: 'active',
        }
      }
    }
  }
)

const closeModal = () => {
  emit('close');
};

const handleCreate = () => {
  if (props.mode === 'edit') {
    emit('update', { id: props.project?.id, ...form.value })
  } else {
  emit('create', { ...form.value })
  }
  closeModal()
}

</script>

<style scoped>
/* New Project Theme-Consistent Modal Styles */
.project-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 23, 28, 0.45);
  backdrop-filter: blur(3px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.project-modal-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 12px;
  width: 500px;
  max-width: 100%;
  padding: 28px;
  box-shadow: 0 20px 40px rgba(20, 23, 28, 0.16);
  color: var(--ink, #14171c);
  font-family: var(--font-body, system-ui, -apple-system, sans-serif);
}

.project-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.project-modal-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--ink, #14171c);
  margin: 0;
}

.project-modal-close {
  background: transparent;
  border: none;
  color: var(--slate, #6b7280);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: color 0.15s ease, background 0.15s ease;
}

.project-modal-close:hover {
  color: var(--ink, #14171c);
  background: #f4f2ec;
}

.project-modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.project-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.project-form-label {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--slate, #6b7280);
}

.project-form-input,
.project-form-textarea,
.project-form-select {
  width: 100%;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--ink, #14171c);
  outline: none;
  font-family: var(--font-body, system-ui, -apple-system, sans-serif);
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  box-sizing: border-box;
}

.project-form-input::placeholder,
.project-form-textarea::placeholder {
  color: #b4b2a9;
}

.project-form-input:focus,
.project-form-textarea:focus,
.project-form-select:focus {
  border-color: var(--forest, #0e5c4a);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--forest-soft, #e7f0ed);
}

.project-form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.project-form-row {
  display: flex;
  gap: 16px;
}

.project-form-group.col {
  flex: 1;
}

.date-input-wrapper,
.select-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-wrapper .calendar-icon {
  position: absolute;
  right: 14px;
  color: var(--slate, #6b7280);
  pointer-events: none;
}

.select-input-wrapper .chevron-icon {
  position: absolute;
  right: 14px;
  color: var(--slate, #6b7280);
  pointer-events: none;
}

.project-form-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 36px;
  cursor: pointer;
}

.project-form-select option {
  background: #ffffff;
  color: var(--ink, #14171c);
}

.date-input {
  color-scheme: light;
  padding-right: 36px;
}

.project-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 12px;
  flex-wrap: wrap;
  gap: 16px;
}

.project-linked-client {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--slate, #6b7280);
  font-family: var(--font-body);
}

.project-modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-theme-secondary {
  font-family: var(--font-body);
  background: #ffffff;
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-theme-secondary:hover {
  background: #f4f2ec;
  color: var(--ink, #14171c);
  border-color: #d8d4c8;
}

.btn-theme-primary {
  font-family: var(--font-body);
  background: var(--forest, #0e5c4a);
  border: none;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-theme-primary:hover {
  background: var(--forest-dark, #0a4638);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
