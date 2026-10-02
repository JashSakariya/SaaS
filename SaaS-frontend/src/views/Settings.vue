<template>
  <div class="settings-view">
    <!-- Header Block -->
    <div class="settings-header">
      <div class="settings-eyebrow">
        <span class="status-dot"></span>
        <span>ACCOUNT &amp; PREFERENCES</span>
      </div>
      <h1>Settings</h1>
      <p class="subtitle">Manage your personal profile, workspace details, security credentials, and subscription.</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Tab 1: Profile -->
    <div v-if="activeTab === 'profile'" class="tab-pane">
      <div class="settings-card">
        <!-- Avatar & Summary Banner -->
        <div class="profile-hero">
          <div class="avatar-circle">
            {{ userInitials }}
          </div>
          <div class="hero-info">
            <h3 class="hero-name">{{ profileForm.name || 'User' }}</h3>
            <p class="hero-email">{{ profileForm.email || 'user@example.com' }}</p>
            <div class="hero-tags">
              <span class="tag-pill">ID: #{{ profileData.id || 1 }}</span>
              <span v-if="profileData.createdAt" class="tag-pill text-muted">
                Member since {{ formatDate(profileData.createdAt) }}
              </span>
            </div>
          </div>
        </div>

        <div class="card-divider"></div>

        <!-- Profile Form -->
        <form @submit.prevent="handleSaveProfile" class="settings-form">
          <div class="form-grid">
            <!-- Full Name -->
            <div class="form-group">
              <label for="prof-name" class="ledger-label">Full Name <span class="required">*</span></label>
              <input 
                id="prof-name"
                v-model="profileForm.name" 
                type="text" 
                class="ledger-input" 
                placeholder="e.g. Jash Sakariya" 
                required 
              />
            </div>

            <!-- Email Address -->
            <div class="form-group">
              <label for="prof-email" class="ledger-label">Email Address <span class="required">*</span></label>
              <input 
                id="prof-email"
                v-model="profileForm.email" 
                type="email" 
                class="ledger-input" 
                placeholder="e.g. jash@example.com" 
                required 
              />
            </div>

            <!-- Mobile Phone -->
            <div class="form-group">
              <label for="prof-number" class="ledger-label">Phone Number <span class="required">*</span></label>
              <input 
                id="prof-number"
                v-model="profileForm.number" 
                type="tel" 
                class="ledger-input" 
                placeholder="e.g. +91 9876543210" 
                required 
              />
            </div>

            <!-- Date of Birth -->
            <div class="form-group">
              <label for="prof-dob" class="ledger-label">Date of Birth</label>
              <input 
                id="prof-dob"
                v-model="profileForm.dateOfBirth" 
                type="date" 
                class="ledger-input date-input" 
              />
            </div>

            <!-- Gender -->
            <div class="form-group full-width">
              <label class="ledger-label">Gender</label>
              <div class="gender-options">
                <label 
                  v-for="g in genderOptions" 
                  :key="g.value"
                  class="gender-pill"
                  :class="{ selected: profileForm.gender === g.value }"
                >
                  <input 
                    type="radio" 
                    name="gender" 
                    :value="g.value" 
                    v-model="profileForm.gender" 
                    class="sr-only" 
                  />
                  <span>{{ g.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="savingProfile"
            >
              <span v-if="savingProfile" class="btn-spinner"></span>
              <span v-else>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab 2: Workspace -->
    <div v-if="activeTab === 'workspace'" class="tab-pane">
      <div class="settings-card">
        <div class="section-title-block">
          <h3>Workspace &amp; Organization</h3>
          <p class="section-desc">Configure your business workspace details and invoicing defaults.</p>
        </div>

        <form @submit.prevent="handleSaveWorkspace" class="settings-form">
          <div class="form-grid">
            <!-- Organization Name -->
            <div class="form-group">
              <label for="ws-name" class="ledger-label">Organization Name</label>
              <input 
                id="ws-name"
                v-model="workspaceForm.name" 
                type="text" 
                class="ledger-input" 
                placeholder="e.g. Handle Studio Ltd." 
              />
            </div>

            <!-- Workspace Email -->
            <div class="form-group">
              <label for="ws-email" class="ledger-label">Billing / Contact Email</label>
              <input 
                id="ws-email"
                v-model="workspaceForm.email" 
                type="email" 
                class="ledger-input" 
                placeholder="billing@yourcompany.com" 
              />
            </div>

            <!-- Business Phone -->
            <div class="form-group">
              <label for="ws-phone" class="ledger-label">Business Phone</label>
              <input 
                id="ws-phone"
                v-model="workspaceForm.phone" 
                type="tel" 
                class="ledger-input" 
                placeholder="+91 (0) 22 1234 5678" 
              />
            </div>

            <!-- Default Currency -->
            <div class="form-group">
              <label for="ws-curr" class="ledger-label">Default Currency</label>
              <select id="ws-curr" v-model="workspaceForm.currency" class="ledger-input select-input">
                <option value="INR">₹ INR (Indian Rupee)</option>
                <option value="USD">$ USD (US Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (British Pound)</option>
              </select>
            </div>

            <!-- Invoice Payment Terms -->
            <div class="form-group">
              <label for="ws-terms" class="ledger-label">Default Payment Terms</label>
              <select id="ws-terms" v-model="workspaceForm.paymentTerms" class="ledger-input select-input">
                <option value="due_on_receipt">Due on Receipt</option>
                <option value="net_15">Net 15 (15 Days)</option>
                <option value="net_30">Net 30 (30 Days)</option>
                <option value="net_45">Net 45 (45 Days)</option>
              </select>
            </div>

            <!-- Office / Headquarters Address -->
            <div class="form-group full-width">
              <label for="ws-addr" class="ledger-label">Headquarters / Business Address</label>
              <textarea 
                id="ws-addr"
                v-model="workspaceForm.address" 
                rows="3" 
                class="ledger-input textarea-input" 
                placeholder="Street address, Suite, City, State, ZIP code"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="savingWorkspace"
            >
              <span v-if="savingWorkspace" class="btn-spinner"></span>
              <span v-else>Save Workspace Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab 3: Security -->
    <div v-if="activeTab === 'security'" class="tab-pane">
      <div class="settings-card">
        <div class="section-title-block">
          <h3>Security &amp; Password</h3>
          <p class="section-desc">Ensure your account remains safe with an up-to-date strong password.</p>
        </div>

        <div class="security-tip-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <div>
            <strong>Password Hygiene:</strong> Use at least 6 characters with a combination of letters, numbers, and special characters.
          </div>
        </div>

        <form @submit.prevent="handleChangePassword" class="settings-form">
          <div class="form-grid narrow-grid">
            <!-- Current Password -->
            <div class="form-group full-width">
              <label for="curr-pwd" class="ledger-label">Current Password <span class="required">*</span></label>
              <div class="password-field-wrapper">
                <input 
                  id="curr-pwd"
                  v-model="passwordForm.currentPassword" 
                  :type="showCurrentPassword ? 'text' : 'password'" 
                  class="ledger-input pwd-input" 
                  placeholder="Enter your existing password" 
                  required 
                />
                <button 
                  type="button" 
                  class="toggle-pwd-btn"
                  @click="showCurrentPassword = !showCurrentPassword"
                  :title="showCurrentPassword ? 'Hide password' : 'Show password'"
                >
                  <svg v-if="showCurrentPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="form-group full-width">
              <label for="new-pwd" class="ledger-label">New Password <span class="required">*</span></label>
              <div class="password-field-wrapper">
                <input 
                  id="new-pwd"
                  v-model="passwordForm.newPassword" 
                  :type="showNewPassword ? 'text' : 'password'" 
                  class="ledger-input pwd-input" 
                  placeholder="Minimum 6 characters" 
                  minlength="6"
                  required 
                />
                <button 
                  type="button" 
                  class="toggle-pwd-btn"
                  @click="showNewPassword = !showNewPassword"
                  :title="showNewPassword ? 'Hide password' : 'Show password'"
                >
                  <svg v-if="showNewPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div class="form-group full-width">
              <label for="conf-pwd" class="ledger-label">Confirm New Password <span class="required">*</span></label>
              <input 
                id="conf-pwd"
                v-model="passwordForm.confirmPassword" 
                type="password" 
                class="ledger-input" 
                placeholder="Re-type new password" 
                required 
              />
              <p v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="field-error">
                Passwords do not match
              </p>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="savingPassword || (passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword)"
            >
              <span v-if="savingPassword" class="btn-spinner"></span>
              <span v-else>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tab 4: Plan & Subscription -->
    <div v-if="activeTab === 'subscription'" class="tab-pane">
      <div class="settings-card">
        <div class="section-title-block">
          <h3>Active Subscription</h3>
          <p class="section-desc">Manage your billing tier and feature entitlements.</p>
        </div>

        <div v-if="loadingSub" class="sub-loading-skeleton">
          <div class="skeleton-line full"></div>
          <div class="skeleton-line medium"></div>
        </div>

        <!-- Subscription Card -->
        <div v-else class="subscription-overview-box">
          <div class="sub-header-row">
            <div>
              <span class="sub-tier-badge">
                {{ currentSubscription?.plan?.name || 'Starter Plan' }}
              </span>
              <h4 class="sub-plan-title">
                {{ currentSubscription?.plan?.name ? `${currentSubscription.plan.name} Tier` : 'Active Plan' }}
              </h4>
            </div>
            <div class="sub-status-pill active">
              ● {{ currentSubscription?.status ? currentSubscription.status.toUpperCase() : 'ACTIVE' }}
            </div>
          </div>

          <div class="sub-details-grid">
            <div class="sub-detail-item">
              <span class="detail-name">Billing Period</span>
              <span class="detail-data">
                {{ currentSubscription?.plan?.billingCycle || 'Monthly' }}
              </span>
            </div>
            <div class="sub-detail-item">
              <span class="detail-name">Valid Until</span>
              <span class="detail-data">
                {{ currentSubscription?.currentPeriodEnd ? formatDate(currentSubscription.currentPeriodEnd) : 'Renewing next cycle' }}
              </span>
            </div>
            <div class="sub-detail-item">
              <span class="detail-name">Amount</span>
              <span class="detail-data highlight">
                ₹{{ currentSubscription?.plan?.price ? Math.round(currentSubscription.plan.price / 100).toLocaleString('en-IN') : '1,499' }}
              </span>
            </div>
          </div>

          <div class="sub-action-row">
            <router-link to="/plans" class="btn-upgrade-plan">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              View &amp; Change Plan
            </router-link>
            <span class="sub-security-note">
              Payments secured &amp; powered by Razorpay
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/ApiService'

const toast = useToast()

// Tabs
const activeTab = ref<'profile' | 'workspace' | 'security' | 'subscription'>('profile')

const tabs = [
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  },
  {
    id: 'workspace' as const,
    label: 'Workspace',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  },
  {
    id: 'security' as const,
    label: 'Security',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
  },
  {
    id: 'subscription' as const,
    label: 'Plan & Billing',
    badge: 'Active',
    icon: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`
  },
]

// Gender options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

// State
const savingProfile = ref(false)
const savingWorkspace = ref(false)
const savingPassword = ref(false)
const loadingSub = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)

// Profile state
const profileData = ref<any>({})
const profileForm = reactive({
  name: '',
  email: '',
  number: '',
  gender: 'other',
  dateOfBirth: '',
})

// Workspace state
const workspaceForm = reactive({
  name: localStorage.getItem('workspaceName') || 'Handle Workspace',
  email: localStorage.getItem('workspaceEmail') || '',
  phone: localStorage.getItem('workspacePhone') || '',
  currency: localStorage.getItem('workspaceCurrency') || 'INR',
  paymentTerms: localStorage.getItem('workspaceTerms') || 'net_30',
  address: localStorage.getItem('workspaceAddress') || '',
})

// Password state
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Active subscription
const currentSubscription = ref<any>(null)

// Computed initials
const userInitials = computed(() => {
  const name = profileForm.name?.trim() || 'User'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const first = parts[0].charAt(0)
    const second = parts[1].charAt(0)
    return (first + second).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Fetch Profile
const fetchProfile = async () => {
  try {
    const res = await api.get('/user/profile')
    if (res.data?.success && res.data?.data) {
      profileData.value = res.data.data
      profileForm.name = res.data.data.name || ''
      profileForm.email = res.data.data.email || ''
      profileForm.number = res.data.data.number || ''
      profileForm.gender = res.data.data.gender || 'other'
      
      // Date formatting for HTML date picker (YYYY-MM-DD)
      if (res.data.data.dateOfBirth) {
        profileForm.dateOfBirth = res.data.data.dateOfBirth.split('T')[0]
      }

      // Sync workspace email default if not set
      if (!workspaceForm.email && profileForm.email) {
        workspaceForm.email = profileForm.email
      }
    }
  } catch (err: any) {
    console.error('Error fetching user profile:', err)
  }
}

// Fetch Active Subscription
const fetchSubscription = async () => {
  loadingSub.value = true
  try {
    const res = await api.get('/payments/subscription/current')
    if (res.data?.success && res.data?.data) {
      currentSubscription.value = res.data.data
    }
  } catch (err) {
    console.warn('Could not fetch active subscription:', err)
  } finally {
    loadingSub.value = false
  }
}

// Save Profile
const handleSaveProfile = async () => {
  savingProfile.value = true
  try {
    const res = await api.put('/user/profile', {
      name: profileForm.name,
      email: profileForm.email,
      number: profileForm.number,
      gender: profileForm.gender,
      dateOfBirth: profileForm.dateOfBirth,
    })

    if (res.data?.success) {
      toast.success('Profile updated successfully!')
      profileData.value = res.data.data

      // Update stored name and dispatch event so topbar updates
      localStorage.setItem('userName', profileForm.name)
      window.dispatchEvent(new Event('user-updated'))
    } else {
      toast.error(res.data?.message || 'Failed to update profile')
    }
  } catch (err: any) {
    console.error('Error updating profile:', err)
    toast.error(err.response?.data?.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

// Save Workspace
const handleSaveWorkspace = () => {
  savingWorkspace.value = true
  try {
    localStorage.setItem('workspaceName', workspaceForm.name)
    localStorage.setItem('workspaceEmail', workspaceForm.email)
    localStorage.setItem('workspacePhone', workspaceForm.phone)
    localStorage.setItem('workspaceCurrency', workspaceForm.currency)
    localStorage.setItem('workspaceTerms', workspaceForm.paymentTerms)
    localStorage.setItem('workspaceAddress', workspaceForm.address)

    toast.success('Workspace settings saved!')
    window.dispatchEvent(new Event('workspace-updated'))
  } catch (err) {
    toast.error('Failed to save workspace settings')
  } finally {
    savingWorkspace.value = false
  }
}

// Change Password
const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('New password and confirm password do not match')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    toast.error('Password must be at least 6 characters long')
    return
  }

  savingPassword.value = true
  try {
    const res = await api.put('/user/change-password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })

    if (res.data?.success) {
      toast.success('Password changed successfully!')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      toast.error(res.data?.message || 'Failed to update password')
    }
  } catch (err: any) {
    console.error('Error changing password:', err)
    toast.error(err.response?.data?.message || 'Failed to change password. Check current password.')
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  fetchProfile()
  fetchSubscription()
})
</script>

<style scoped>
.settings-view {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
  box-sizing: border-box;
}

/* Header */
.settings-header {
  margin-bottom: var(--space-xl);
}

.settings-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  padding: 3px 10px;
  border-radius: var(--radius-sm, 4px);
  margin-bottom: var(--space-xs);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--forest, #0e5c4a);
}

.settings-header h1 {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: var(--text-2xl, 30px);
  color: var(--ink, #14171c);
  margin: 4px 0 6px;
}

.subtitle {
  color: var(--slate, #6b7280);
  font-size: var(--text-sm, 14px);
  margin: 0;
}

/* Navigation Tabs */
.settings-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--line, #e4e1d8);
  margin-bottom: var(--space-xl);
  overflow-x: auto;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 10px 16px;
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--slate, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: var(--ink, #14171c);
}

.tab-btn.active {
  color: var(--forest, #0e5c4a);
  border-bottom-color: var(--forest, #0e5c4a);
  font-weight: 600;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
}

.tab-badge {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
  padding: 1px 6px;
  border-radius: 999px;
  font-weight: 600;
}

/* Card Container */
.settings-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-lg, 10px);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.section-title-block {
  margin-bottom: var(--space-lg);
}

.section-title-block h3 {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0 0 4px;
}

.section-desc {
  font-size: 13px;
  color: var(--slate, #6b7280);
  margin: 0;
}

/* Profile Hero */
.profile-hero {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding-bottom: var(--space-lg);
}

.avatar-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--forest, #0e5c4a);
  flex-shrink: 0;
}

.hero-name {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0 0 2px;
}

.hero-email {
  font-family: var(--font-mono, monospace);
  font-size: 12.5px;
  color: var(--slate, #6b7280);
  margin: 0 0 6px;
}

.hero-tags {
  display: flex;
  gap: 8px;
}

.tag-pill {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  background: #f4f2eb;
  color: var(--ink, #14171c);
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-pill.text-muted {
  color: var(--slate, #6b7280);
}

.card-divider {
  height: 1px;
  background: var(--line, #e4e1d8);
  margin-bottom: var(--space-lg);
}

/* Forms */
.settings-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.form-grid.narrow-grid {
  max-width: 480px;
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.ledger-label {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  margin-bottom: 6px;
}

.required {
  color: var(--danger, #a3372c);
}

.ledger-input {
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  color: var(--ink, #14171c);
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-sm, 4px);
  padding: 10px 12px;
  outline: none;
  transition: all 0.2s ease;
}

.ledger-input:focus {
  background: var(--surface, #ffffff);
  border-color: var(--forest, #0e5c4a);
  box-shadow: 0 0 0 3px var(--forest-soft, #e7f0ed);
}

.date-input,
.select-input {
  cursor: pointer;
}

.textarea-input {
  resize: vertical;
  line-height: 1.5;
}

/* Gender Pills */
.gender-options {
  display: flex;
  gap: 10px;
}

.gender-pill {
  padding: 7px 18px;
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 6px);
  background: var(--paper, #fbfaf6);
  font-size: 13px;
  font-weight: 500;
  color: var(--slate, #6b7280);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gender-pill:hover {
  background: #f4f2eb;
}

.gender-pill.selected {
  background: var(--forest-soft, #e7f0ed);
  border-color: var(--forest, #0e5c4a);
  color: var(--forest-dark, #0a4638);
  font-weight: 600;
}

.sr-only {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Password Field Wrapper */
.password-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.pwd-input {
  width: 100%;
  padding-right: 38px;
}

.toggle-pwd-btn {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--slate, #6b7280);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.toggle-pwd-btn:hover {
  color: var(--ink, #14171c);
}

.field-error {
  font-size: 12px;
  color: var(--danger, #a3372c);
  margin-top: 4px;
}

/* Security Tip Box */
.security-tip-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--forest-soft, #e7f0ed);
  border: 1px solid rgba(14, 92, 74, 0.2);
  padding: 12px 16px;
  border-radius: var(--radius-md, 6px);
  color: var(--forest-dark, #0a4638);
  font-size: 13px;
  margin-bottom: var(--space-lg);
}

/* Buttons & Actions */
.form-actions {
  display: flex;
  justify-content: flex-start;
  padding-top: var(--space-sm);
}

.btn-primary {
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  border: 1px solid var(--forest, #0e5c4a);
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--forest-dark, #0a4638);
  border-color: var(--forest-dark, #0a4638);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Subscription Box */
.subscription-overview-box {
  background: var(--paper, #fbfaf6);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-lg);
}

.sub-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.sub-tier-badge {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  color: var(--forest, #0e5c4a);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sub-plan-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 4px 0 0;
}

.sub-status-pill {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
}

.sub-status-pill.active {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
}

.sub-details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-top: 1px solid var(--line, #e4e1d8);
  border-bottom: 1px solid var(--line, #e4e1d8);
  margin-bottom: var(--space-lg);
}

.sub-detail-item {
  display: flex;
  flex-direction: column;
}

.detail-name {
  font-size: 12px;
  color: var(--slate, #6b7280);
  margin-bottom: 4px;
}

.detail-data {
  font-family: var(--font-body, sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink, #14171c);
}

.detail-data.highlight {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  color: var(--forest, #0e5c4a);
  font-size: 16px;
}

.sub-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-upgrade-plan {
  display: inline-flex;
  align-items: center;
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: var(--radius-sm, 4px);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-upgrade-plan:hover {
  background: var(--forest-dark, #0a4638);
}

.sub-security-note {
  font-size: 12px;
  color: var(--slate, #6b7280);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .sub-details-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .sub-action-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
