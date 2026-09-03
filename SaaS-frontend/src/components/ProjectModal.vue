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
  (e: 'update', data: ProjectFormData & { id?: number }): void;
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
