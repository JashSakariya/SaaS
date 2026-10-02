<template>
  <div 
    class="client-avatar" 
    :class="[colorClass, sizeClass]"
  >
    {{ displayInitials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    initials?: string
    name?: string
    index?: number
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    initials: '',
    name: '',
    index: 0,
    size: 'md',
  }
)

const avatarColors = ['avatar-forest', 'avatar-gold', 'avatar-indigo', 'avatar-slate']

const colorClass = computed(() => {
  return avatarColors[props.index % avatarColors.length]
})

const sizeClass = computed(() => {
  return `size-${props.size}`
})

const displayInitials = computed(() => {
  if (props.initials) return props.initials.toUpperCase()
  if (props.name) {
    const parts = props.name.trim().split(' ').filter(Boolean)
    const first = parts[0]
    const second = parts[1]
    if (first && second) {
      return (first.charAt(0) + second.charAt(0)).toUpperCase()
    }
    return props.name.slice(0, 2).toUpperCase()
  }
  return 'CL'
})
</script>

<style scoped>
.client-avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, 'Inter', sans-serif);
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}

.size-sm {
  width: 28px;
  height: 28px;
  font-size: 10px;
}

.size-md {
  width: 32px;
  height: 32px;
  font-size: 11px;
}

.size-lg {
  width: 40px;
  height: 40px;
  font-size: 13px;
}

/* Harmonious Ledger Theme Palettes */
.avatar-forest {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  border: 1px solid rgba(14, 92, 74, 0.15);
}

.avatar-gold {
  background: var(--gold-soft, #f6ecd9);
  color: var(--gold, #b8872f);
  border: 1px solid rgba(184, 135, 47, 0.2);
}

.avatar-indigo {
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid rgba(67, 56, 202, 0.18);
}

.avatar-slate {
  background: #ece9e2;
  color: var(--slate, #6b7280);
  border: 1px solid var(--line, #e4e1d8);
}
</style>
