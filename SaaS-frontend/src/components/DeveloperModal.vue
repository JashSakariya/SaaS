<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-backdrop" @click="closeModal">
      <div class="modal-card" @click.stop>
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ mode === 'edit' ? 'Edit Employee' : 'Add Employee' }}</h3>
          <button type="button" class="modal-close" @click="closeModal" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="modal-body">
          <!-- Name -->
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.name" 
              class="form-input" 
              placeholder="e.g. Ravi Shah" 
              required
            />
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Specialty Category <span class="required">*</span></label>
            <div class="select-wrapper">
              <select v-model="form.category" class="form-select" required>
                <option value="" disabled>Select category</option>
                <option value="UI">UI</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Full Stack">Full Stack</option>
                <option value="DevOps">DevOps</option>
                <option value="Executive">Executive</option>
                <option value="Tester (QA)">Tester (QA)</option>
                <option value="SEO">SEO</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
              <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>

          <!-- Row: Email & Phone -->
          <div class="form-row">
            <div class="form-group col">
              <label class="form-label">Email Address</label>
              <input 
                type="email" 
                v-model="form.email" 
                class="form-input" 
                placeholder="ravi.design@gmail.com" 
              />
            </div>

            <div class="form-group col">
              <label class="form-label">Phone Number</label>
              <input 
                type="tel" 
                v-model="form.phone" 
                class="form-input" 
                placeholder="+91 98765 43210" 
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="modal-footer">
            <div class="modal-actions">
              <button type="button" class="btn-theme-secondary" @click="closeModal">
                Cancel
              </button>
              <button 
                type="button" 
                class="btn-theme-primary" 
                :disabled="!form.name.trim() || !form.category || isSubmitting"
                @click="handleSubmit"
              >
                {{ isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Employee' : 'Add Employee') }}
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

export interface DeveloperFormData {
  id?: number;
  name: string;
  category: string;
  email?: string | null;
  phone?: string | null;
}

const props = defineProps<{
  isOpen: boolean;
  mode?: 'create' | 'edit';
  developer?: Partial<DeveloperFormData> | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: DeveloperFormData): void;
}>();

const isSubmitting = ref(false);

const form = ref<DeveloperFormData>({
  name: '',
  category: 'UI',
  email: '',
  phone: '',
});

watch(
  () => props.developer,
  (newVal) => {
    if (newVal && props.mode === 'edit') {
      form.value = {
        id: newVal.id,
        name: newVal.name || '',
        category: newVal.category || 'UI',
        email: newVal.email || '',
        phone: newVal.phone || '',
      };
    } else {
      form.value = {
        name: '',
        category: 'UI',
        email: '',
        phone: '',
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.mode !== 'edit') {
      form.value = {
        name: '',
        category: 'UI',
        email: '',
        phone: '',
      };
    }
  }
);

const closeModal = () => {
  emit('close');
};

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.category) return;
  emit('save', { ...form.value });
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 23, 28, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: var(--surface, #ffffff);
  border-radius: var(--radius-xl, 12px);
  box-shadow: var(--shadow-lg, 0 20px 40px rgba(20, 23, 28, 0.16));
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line, #e4e1d8);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--line, #e4e1d8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--paper, #fbfaf6);
}

.modal-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  color: var(--slate, #6b7280);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm, 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 0.15s ease);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--ink, #14171c);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group.col {
  flex: 1;
}

.form-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink, #14171c);
}

.required {
  color: var(--danger, #a3372c);
}

.form-input {
  width: 100%;
  height: 40px;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 6px);
  padding: 0 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink, #14171c);
  outline: none;
  box-sizing: border-box;
  transition: all var(--transition-fast, 0.15s ease);
}

.form-input:focus {
  border-color: var(--forest, #0e5c4a);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--forest-soft, #e7f0ed);
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.form-select {
  width: 100%;
  height: 40px;
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 6px);
  padding: 0 36px 0 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink, #14171c);
  outline: none;
  appearance: none;
  cursor: pointer;
  box-sizing: border-box;
  transition: all var(--transition-fast, 0.15s ease);
}

.form-select:focus {
  border-color: var(--forest, #0e5c4a);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--forest-soft, #e7f0ed);
}

.chevron-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--slate, #6b7280);
}

.modal-footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--line, #e4e1d8);
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-theme-secondary {
  font-family: var(--font-body);
  background: #ffffff;
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  padding: 8px 18px;
  border-radius: var(--radius-md, 6px);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-theme-secondary:hover {
  background: var(--paper, #fbfaf6);
  color: var(--ink, #14171c);
  border-color: var(--line-strong, #d8d4c8);
}

.btn-theme-primary {
  font-family: var(--font-body);
  background: var(--forest, #0e5c4a);
  border: 1px solid var(--forest, #0e5c4a);
  color: #ffffff;
  padding: 8px 20px;
  border-radius: var(--radius-md, 6px);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s ease);
}

.btn-theme-primary:hover:not(:disabled) {
  background: var(--forest-dark, #0a4638);
}

.btn-theme-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
