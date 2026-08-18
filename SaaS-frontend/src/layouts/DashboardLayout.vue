<template>
  <div class="app-layout">
    <!-- Sidebar component -->
    <Sidebar />

    <!-- Main Content Wrapper right of Sidebar -->
    <div class="main-wrapper">
      <!-- Full-width Topbar Header -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="workspace-badge">
            <span class="status-dot"></span>
            Ledger Workspace
          </span>
        </div>
        <div class="topbar-right">
          <span class="welcome">Welcome, <strong class="user-name">Jash</strong></span>
          <button class="logout-btn" @click="handleLogout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: -2px;">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <!-- Scrollable Main View (Y scroll only allowed) -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  router.push('/login')
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--paper);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
}

/* Topbar Header - matching sidebar background and border line for 100% color consistency */
.topbar {
  height: 65px;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  width: 100%;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
}

.workspace-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--slate);
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 5px 12px;
  border-radius: var(--radius);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--forest);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--slate);
}

.user-name {
  color: var(--ink);
  font-weight: 600;
}

.logout-btn {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 13px;
  padding: 7px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--forest-soft);
  color: var(--forest-dark);
  border-color: var(--forest);
}

/* Page Content Viewport - lock X overflow and allow Y scroll only */
.page-content {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--paper);
}
</style>