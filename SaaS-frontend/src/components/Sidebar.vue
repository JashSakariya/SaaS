<template>
    <aside class="sidebar">
        <nav>
            <ul>
                <li v-for="item in navItems" :key="item.label">
                    <router-link :to="item.path">
                        <span class="nav-icon">{{ item.icon }}</span>
                        <span>{{ item.label }}</span>
                    </router-link>
                </li>
            </ul>
        </nav>
    </aside>
</template>






<script setup lang="ts">
import { ref } from 'vue'


const navItems = ref([
    { label: 'Dashboard', icon: '—', path: '/dashboard' },
    { label: 'Clients', icon: '—', path: '/clients' },
    { label: 'Orders', icon: '—', path: '/' },
    { label: 'Payments', icon: '—', path: '/' },
    { label: 'Reports', icon: '—', path: '/' },
    { label: 'Settings', icon: '—', path: '/' },
])
</script>

<style scoped>
/* Sidebar */
.sidebar {
    width: 220px;
    background: var(--paper);
    border-right: 1px solid var(--line);
    padding: 24px 0;
    flex-shrink: 0;
}

.sidebar ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    color: var(--slate);
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: 0.15s ease;
}

.nav-icon {
    font-family: var(--font-mono);
    color: var(--line);
    width: 10px;
}

.sidebar li:hover {
    color: var(--ink);
    background: rgba(0, 0, 0, 0.02);
}

.sidebar li.active {
    color: var(--forest-dark);
    border-left-color: var(--forest);
    background: var(--forest-soft);
}

.sidebar li.active .nav-icon {
    color: var(--forest);
}
</style>