<template>
  <component 
    :is="to ? 'router-link' : 'div'" 
    :to="to" 
    class="stat-card"
  >
    <div class="stat-icon-wrapper" :class="iconVariant">
      <slot name="icon" />
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <div class="stat-value">
        <span v-if="loading" class="skeleton-val"></span>
        <span v-else>{{ value }}</span>
      </div>
      <p class="stat-subtext">
        <slot name="subtext">
          <span :class="subtextClass">{{ subtext }}</span>
        </slot>
      </p>
    </div>
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value?: string | number
    subtext?: string
    subtextClass?: string
    iconVariant?: 'forest' | 'gold' | 'indigo' | 'slate' | 'danger'
    loading?: boolean
    to?: string
  }>(),
  {
    value: 0,
    subtext: '',
    subtextClass: 'highlight-muted',
    iconVariant: 'forest',
    loading: false,
    to: undefined,
  }
)
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md, 16px);
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: 20px 18px;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  min-height: 100px;
}

.stat-card:hover {
  border-color: rgba(14, 92, 74, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.stat-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: var(--radius, 6px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.stat-card:hover .stat-icon-wrapper {
  transform: scale(1.05);
}

/* Theme Icon Variants */
.stat-icon-wrapper.forest {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  border: 1px solid rgba(14, 92, 74, 0.15);
}

.stat-icon-wrapper.gold {
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
  border: 1px solid rgba(184, 135, 47, 0.18);
}

.stat-icon-wrapper.indigo {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid rgba(67, 56, 202, 0.18);
}

.stat-icon-wrapper.slate {
  background: #ece9e2;
  color: var(--slate, #6b7280);
  border: 1px solid var(--line, #e4e1d8);
}

.stat-icon-wrapper.danger {
  background: var(--danger-soft, #f6e9e7);
  color: var(--danger, #a3372c);
  border: 1px solid rgba(163, 55, 44, 0.18);
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.stat-label {
  font-family: var(--font-body, 'Inter', sans-serif);
  font-size: 13px;
  font-weight: 500;
  color: var(--slate, #6b7280);
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 26px;
  font-weight: 600;
  color: var(--ink, #14171c);
  line-height: 1.1;
  margin-bottom: 6px;
}

.stat-subtext {
  font-family: var(--font-mono, 'IBM Plex Mono', monospace);
  font-size: 11.5px;
  color: var(--slate, #6b7280);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skeleton-val {
  display: inline-block;
  width: 40px;
  height: 26px;
  background: linear-gradient(90deg, #ece9e2 25%, #f5f4f0 50%, #ece9e2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
