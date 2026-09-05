<template>
  <aside class="sidebar">
    <!-- Sidebar Brand / Logo Header -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
      </div>
      <span class="brand-title">Ledger</span>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.label" 
        :to="item.path"
        class="nav-item"
        exact-active-class="active"
      >
        <span class="nav-icon">
          <svg v-if="item.label === 'Dashboard'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <svg v-else-if="item.label === 'Clients'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <svg v-else-if="item.label === 'Employees' || item.label === 'Developers'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <svg v-else-if="item.label === 'Orders'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <svg v-else-if="item.label === 'Payments'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
          <svg v-else-if="item.label === 'Reports'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <svg v-else-if="item.label === 'Settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const navItems = ref([
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Clients', path: '/clients' },
  { label: 'Employees', path: '/developers' },
  { label: 'Orders', path: '/' },
  { label: 'Payments', path: '/' },
  { label: 'Reports', path: '/' },
  { label: 'Settings', path: '/' },
]);
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 220px;
  background: var(--paper);
  border-right: 1px solid var(--line);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

/* Sidebar Brand Header */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 24px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
}

.brand-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background: var(--forest-soft);
  color: var(--forest);
  border-radius: var(--radius);
}

.brand-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.01em;
}

/* Navigation List */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Navigation Link Items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin: 0 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--slate);
  text-decoration: none;
  border-radius: var(--radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--slate);
  transition: color 0.2s ease;
  opacity: 0.8;
}

.nav-label {
  transition: transform 0.2s ease;
}

/* Hover State */
.nav-item:hover {
  background: rgba(14, 92, 74, 0.03);
  color: var(--ink);
  border-color: var(--line);
}

.nav-item:hover .nav-icon {
  color: var(--ink);
}

/* Active State (toggled automatically by Vue Router) */
.nav-item.active {
  background: var(--forest-soft);
  border-color: var(--forest);
  color: var(--forest-dark);
  font-weight: 600;
}

.nav-item.active .nav-icon {
  color: var(--forest);
  opacity: 1;
}
</style>