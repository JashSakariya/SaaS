<template>
    <div>
        <!-- Drawer Backdrop -->
        <Transition name="fade">
            <div v-if="isOpen" class="drawer-backdrop" @click="closeDrawer"></div>
        </Transition>

        <!-- Right-side Drawer Panel -->
        <Transition name="slide">
            <div v-if="isOpen" class="client-drawer">
                <div class="drawer-header">
                    <h2>{{ client ? 'Edit Client' : 'Add New Client' }}</h2>
                    <button type="button" class="btn-close" @click="closeDrawer"></button>
                </div>
                <div class="drawer-body">
                    <form @submit.prevent="submitForm">
                        <div class="form-grid">
                            <div class="form-row">
                                <label>Name</label>
                                <input class="form-input" type="text" v-model="payload.name" required
                                    placeholder="Alex Rivera" />
                            </div>

                            <div class="form-row">
                                <label>Email</label>
                                <input class="form-input" type="email" v-model="payload.email" required
                                    placeholder="alex@company.com" />
                            </div>

                            <div class="form-row">
                                <label>Phone</label>
                                <input class="form-input" type="tel" v-model="payload.phone" required
                                    placeholder="+91 90000 00000" pattern="[6-9][0-9]{9}" maxlength="10"
                                    inputmode="numeric" />
                            </div>

                            <div class="form-row">
                                <label>Gender</label>
                                <div class="pill-group">
                                    <label class="pill" :class="{ active: payload.gender === 'male' }">
                                        <input type="radio" value="male" v-model="payload.gender" required />
                                        Male
                                    </label>
                                    <label class="pill" :class="{ active: payload.gender === 'female' }">
                                        <input type="radio" value="female" v-model="payload.gender" required />
                                        Female
                                    </label>
                                    <label class="pill" :class="{ active: payload.gender === 'other' }">
                                        <input type="radio" value="other" v-model="payload.gender" required />
                                        Other
                                    </label>
                                </div>
                            </div>

                            <div class="form-row full-width">
                                <label>Company Name</label>
                                <input class="form-input" type="text" v-model="payload.companyName" required
                                    placeholder="Company Ltd." />
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary" :disabled="isSubmitting">
                                {{ isSubmitting ? 'Saving...' : 'Submit' }}
                            </button>
                            <button type="button" @click="closeDrawer" class="btn-secondary"
                                :disabled="isSubmitting">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '@/services/ApiService';

interface Client {
    id: number | null
    name: string | null
    email: string | null
    phone: string | null
    gender: string | null
    company_name?: string | null
}

const props = defineProps<{
    isOpen: boolean;
    client: Client | null;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'saved'): void;
}>();

const isSubmitting = ref(false);

const payload = ref({
    name: '',
    email: '',
    phone: '',
    gender: '',
    companyName: ''
});

// Watch client changes to populate or clear payload
watch(
    () => props.client,
    (newClient) => {
        if (newClient) {
            payload.value = {
                name: newClient.name ?? '',
                email: newClient.email ?? '',
                phone: newClient.phone ?? '',
                gender: newClient.gender ?? '',
                companyName: newClient.company_name ?? ''
            };
        } else {
            payload.value = {
                name: '',
                email: '',
                phone: '',
                gender: '',
                companyName: ''
            };
        }
    },
    { immediate: true }
);

const resetForm = () => {
    payload.value = {
        name: '',
        email: '',
        phone: '',
        gender: '',
        companyName: ''
    };
};

const closeDrawer = () => {
    resetForm();
    emit('close');
};

const submitForm = async () => {
    isSubmitting.value = true;
    try {
        if (props.client && props.client.id !== null) {
            // Update logic
            await api.put(`/clients/${props.client.id}`, payload.value);
        } else {
            // Create logic
            await api.post('/clients', payload.value);
        }
        emit('saved');
        closeDrawer();
    } catch (error) {
        console.error('Error saving client:', error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
/* Drawer styles */
.drawer-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(20, 23, 28, 0.4);
    backdrop-filter: blur(2px);
    z-index: 1000;
}

.client-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 460px;
    max-width: 100%;
    background: var(--surface);
    border-left: 1px solid var(--line);
    box-shadow: -4px 0 24px rgba(20, 23, 28, 0.15);
    z-index: 1001;
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: var(--space-lg) var(--space-xl);
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drawer-header h2 {
    font-family: var(--font-display, 'Fraunces', Georgia, serif);
    font-weight: 500;
    font-size: var(--text-xl);
    margin: 0;
    color: var(--ink);
}

.drawer-body {
    padding: var(--space-xl);
    flex: 1;
    overflow-y: auto;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
}

.form-row {
    display: flex;
    flex-direction: column;
}

.form-row label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: var(--space-xs);
}

.pill-group {
    display: flex;
    gap: var(--space-sm);
}

.pill {
    flex: 1;
    text-align: center;
    font-size: var(--text-xs);
    font-weight: 500;
    padding: var(--space-sm) 0;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    color: var(--slate);
    transition: 0.2s ease;
}

.pill input {
    display: none;
}

.pill.active {
    background: var(--forest-soft);
    border-color: var(--forest);
    color: var(--forest-dark);
}

.form-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
}

.btn-secondary {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--text-sm);
    color: var(--slate);
    background: transparent;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm, 4px);
    padding: var(--space-sm) var(--space-lg);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: #ece9e2;
    color: var(--ink);
}

.btn-primary:disabled,
.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Vue Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>