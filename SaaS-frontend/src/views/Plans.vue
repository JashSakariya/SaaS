<template>
  <div class="plans-page">
    <div class="plans-container">
      <!-- Centered Welcome Header -->
      <div class="welcome-block">
        <div class="plan-eyebrow">
          <span class="status-dot"></span>
          <span>SUBSCRIPTION</span>
        </div>
        <h1>Plans &amp; Pricing</h1>
        <p class="subtitle">Select the plan that fits your business scale. Upgrade or change anytime.</p>
      </div>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="error-banner">
        <div class="error-content">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMsg }}</span>
        </div>
        <button class="retry-btn" @click="fetchPlans">Retry</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="plans-scroll-wrapper">
        <div class="plans-grid">
          <div v-for="i in 3" :key="i" class="skeleton-card">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line price"></div>
            <div class="skeleton-line button"></div>
            <div class="skeleton-divider"></div>
            <div class="skeleton-line full" v-for="j in 4" :key="j"></div>
          </div>
        </div>
      </div>

      <!-- Dynamic Plans Scrollable Grid -->
      <div v-else-if="plans.length > 0" class="plans-scroll-wrapper">
        <!-- Scroll Left Navigation Arrow -->
        <button 
          v-show="canScrollLeft"
          class="scroll-arrow-btn scroll-left"
          @click="scrollGrid('left')"
          title="Previous plans"
          aria-label="Scroll left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <!-- Plans Grid (Smooth horizontal scroll when more plans) -->
        <div 
          ref="plansGridRef" 
          class="plans-grid"
          @scroll="onScroll"
        >
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :loading="processingPlanId === plan.id"
            @select="onPlanSelected"
          />
        </div>

        <!-- Scroll Right Navigation Arrow -->
        <button 
          v-show="canScrollRight"
          class="scroll-arrow-btn scroll-right"
          @click="scrollGrid('right')"
          title="More plans"
          aria-label="Scroll right"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p class="ledger-label">No Plans Available</p>
        <p class="empty-desc">There are currently no active plans configured in the system.</p>
      </div>

      <!-- Subtle Trust Micro-Badges -->
      <div class="trust-footer">
        <span class="trust-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Secured by Razorpay
        </span>
        <span class="trust-bullet">•</span>
        <span class="trust-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
          </svg>
          Instant Activation
        </span>
        <span class="trust-bullet">•</span>
        <span class="trust-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          GST Invoices Available
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import api from '@/services/ApiService';
import PlanCard, { type PlanData } from '@/components/PlanCard.vue';

const plans = ref<PlanData[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const processingPlanId = ref<number | null>(null);

const plansGridRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateScrollButtons = () => {
  if (!plansGridRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = plansGridRef.value;
  canScrollLeft.value = scrollLeft > 10;
  // If content extends beyond visible viewport, enable right scroll
  canScrollRight.value = scrollWidth - (scrollLeft + clientWidth) > 10;
};

const onScroll = () => {
  updateScrollButtons();
};

const scrollGrid = (direction: 'left' | 'right') => {
  if (!plansGridRef.value) return;
  const cardWithGap = 255 + 16; // 271px (compact card width + gap)
  plansGridRef.value.scrollBy({
    left: direction === 'left' ? -cardWithGap : cardWithGap,
    behavior: 'smooth'
  });
};

const fetchPlans = async () => {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.get('/plans');
    if (res.data?.success && Array.isArray(res.data?.data)) {
      plans.value = res.data.data;
    } else {
      plans.value = [];
    }
  } catch (err: any) {
    console.error('Error loading plans:', err);
    errorMsg.value = err.response?.data?.message || err.message || 'Failed to load plans from server.';
  } finally {
    loading.value = false;
    await nextTick();
    updateScrollButtons();
  }
};

const onPlanSelected = (plan: PlanData) => {
  processingPlanId.value = plan.id;
  console.log('Selected Plan for Checkout:', plan);
  // Razorpay Checkout integration connects in Part 2!
  setTimeout(() => {
    processingPlanId.value = null;
    alert(`Selected plan: ${plan.name} (${plan.priceFormatted || '₹' + Math.round(plan.price / 100)}). Ready for Razorpay integration!`);
  }, 250);
};

onMounted(() => {
  fetchPlans();
  window.addEventListener('resize', updateScrollButtons);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons);
});
</script>

<style scoped>
.plans-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0;
}

.plans-container {
  width: 100%;
  max-width: 1240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
}

/* Header */
.welcome-block {
  text-align: center;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plan-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, monospace);
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  padding: 2.5px 8px;
  border-radius: var(--radius, 3px);
  margin-bottom: 6px;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--forest, #0e5c4a);
}

.welcome-block h1 {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 500;
  font-size: 24px;
  line-height: 1.2;
  margin: 0 0 3px;
  color: var(--ink, #14171c);
  letter-spacing: -0.01em;
}

.subtitle {
  color: var(--slate, #6b7280);
  font-size: 13px;
  line-height: 1.45;
  margin: 0;
  max-width: 440px;
  text-align: center;
}

/* Error Banner */
.error-banner {
  background: var(--danger-soft, #f6e9e7);
  border: 1px solid #f0cdc8;
  color: var(--danger, #a3372c);
  border-radius: var(--radius-md, 8px);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: var(--text-sm, 13px);
  max-width: 720px;
  width: 100%;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-btn {
  background: var(--surface, #ffffff);
  border: 1px solid #f0cdc8;
  color: var(--danger, #a3372c);
  font-family: var(--font-body, sans-serif);
  font-weight: 600;
  font-size: 11.5px;
  padding: 4px 12px;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--danger, #a3372c);
  color: #ffffff;
}

/* Scroll Wrapper with Arrow Navigation */
.plans-scroll-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

/* Scroll Arrows */
.scroll-arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  color: var(--ink, #14171c);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(20, 23, 28, 0.1);
  z-index: 25;
  transition: all 0.2s ease;
}

.scroll-arrow-btn:hover {
  background: var(--forest-soft, #e7f0ed);
  border-color: var(--forest, #0e5c4a);
  color: var(--forest, #0e5c4a);
  box-shadow: 0 6px 16px rgba(14, 92, 74, 0.18);
  transform: translateY(-50%) scale(1.06);
}

.scroll-arrow-btn.scroll-left {
  left: -4px;
}

.scroll-arrow-btn.scroll-right {
  right: -4px;
}

/* Plans Grid - centered when few plans, smoothly scrollable when more plans */
.plans-grid {
  display: flex;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 12px 14px 14px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--line, #e4e1d8) transparent;
}

/* Auto-centering trick: when total cards width < container width, cards center.
   When total cards width > container width, cards start at scrollLeft 0 and scroll smoothly without clipping! */
.plans-grid::before,
.plans-grid::after {
  content: '';
  margin: auto;
  flex: 0 0 0;
}

/* Custom scrollbar styling */
.plans-grid::-webkit-scrollbar {
  height: 5px;
}

.plans-grid::-webkit-scrollbar-track {
  background: transparent;
}

.plans-grid::-webkit-scrollbar-thumb {
  background: var(--line, #e4e1d8);
  border-radius: 999px;
}

.plans-grid::-webkit-scrollbar-thumb:hover {
  background: #c5c1b5;
}

/* Skeleton Loading */
.skeleton-card {
  flex: 0 0 255px;
  width: 255px;
  min-width: 255px;
  max-width: 265px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.skeleton-line {
  background: #f0ede6;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line.short {
  width: 60px;
  height: 10px;
}

.skeleton-line.medium {
  width: 120px;
  height: 22px;
}

.skeleton-line.price {
  width: 90px;
  height: 34px;
}

.skeleton-line.button {
  width: 100%;
  height: 36px;
  margin: 4px 0;
}

.skeleton-line.full {
  width: 90%;
  height: 14px;
}

.skeleton-divider {
  height: 1px;
  background: var(--line, #e4e1d8);
  margin: 6px 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Empty State */
.empty-state {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-xl);
  text-align: center;
  max-width: 460px;
}

.empty-desc {
  color: var(--slate, #6b7280);
  font-size: var(--text-sm);
  margin: 4px 0 0;
}

/* Trust Footer */
.trust-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 2px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--slate, #6b7280);
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.trust-bullet {
  color: var(--line, #e4e1d8);
}

@media (max-width: 768px) {
  .plans-grid {
    padding: 10px 12px 14px;
    gap: 12px;
  }

  .scroll-arrow-btn {
    display: none; /* Mobile users swipe with momentum touch */
  }

  .trust-footer {
    flex-direction: column;
    gap: 4px;
  }

  .trust-bullet {
    display: none;
  }
}
</style>
