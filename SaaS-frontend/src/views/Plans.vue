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

        <!-- Plans Grid -->
        <div 
          ref="plansGridRef" 
          class="plans-grid"
          @scroll="onScroll"
        >
          <PlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :isCurrentPlan="currentActivePlanId === plan.id"
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

    <!-- Success Celebration Modal -->
    <div v-if="activatedSubscription" class="success-modal-overlay" @click.self="activatedSubscription = null">
      <div class="success-modal-card">
        <div class="success-icon-badge">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h3 class="success-title">Subscription Activated!</h3>
        <p class="success-subtitle">
          Your payment was securely verified by Razorpay and your plan has been activated.
        </p>

        <div class="success-details-card">
          <div class="detail-row">
            <span class="detail-label">Plan Tier</span>
            <span class="detail-value highlight">{{ activatedSubscription.planName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value status-badge">● Active</span>
          </div>
          <div class="detail-row" v-if="activatedSubscription.currentPeriodEnd">
            <span class="detail-label">Valid Until</span>
            <span class="detail-value">{{ formatDate(activatedSubscription.currentPeriodEnd) }}</span>
          </div>
          <div class="detail-row" v-if="activatedSubscription.paymentId">
            <span class="detail-label">Payment ID</span>
            <span class="detail-value mono">{{ activatedSubscription.paymentId }}</span>
          </div>
        </div>

        <div class="success-modal-actions">
          <button class="btn-success-close" @click="activatedSubscription = null">
            Close
          </button>
          <button class="btn-success-dashboard" @click="goToDashboard">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/ApiService';
import { loadRazorpay } from '@/services/RazorpayLoader';
import PlanCard, { type PlanData } from '@/components/PlanCard.vue';

const router = useRouter();
const plans = ref<PlanData[]>([]);
const loading = ref(true);
const errorMsg = ref('');
const processingPlanId = ref<number | null>(null);
const currentActivePlanId = ref<number | null>(null);
const activatedSubscription = ref<{
  planName: string;
  paymentId?: string;
  currentPeriodEnd?: string;
} | null>(null);

const plansGridRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateScrollButtons = () => {
  if (!plansGridRef.value) return;
  const { scrollLeft, scrollWidth, clientWidth } = plansGridRef.value;
  canScrollLeft.value = scrollLeft > 10;
  canScrollRight.value = scrollWidth - (scrollLeft + clientWidth) > 10;
};

const onScroll = () => {
  updateScrollButtons();
};

const scrollGrid = (direction: 'left' | 'right') => {
  if (!plansGridRef.value) return;
  const cardWithGap = 255 + 16;
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

/**
 * Handle user clicking "Choose Plan"
 */
const onPlanSelected = async (plan: PlanData) => {
  if (processingPlanId.value !== null) return;
  errorMsg.value = '';
  processingPlanId.value = plan.id;

  try {
    // 1. Ensure Razorpay Checkout SDK is injected
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      errorMsg.value = 'Failed to load Razorpay Checkout SDK. Please check your internet connection.';
      processingPlanId.value = null;
      return;
    }

    // 2. Call backend to create Razorpay order
    const res = await api.post('/payments/create-order', {
      planId: plan.id,
    });

    if (!res.data?.success || !res.data?.data) {
      throw new Error(res.data?.message || 'Failed to initialize payment order');
    }

    const orderData = res.data.data;

    // 3. Configure Razorpay Standard Checkout options
    const options = {
      key: orderData.keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || 'INR',
      name: 'Handle',
      description: `${plan.name} Plan Subscription`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.user?.name || localStorage.getItem('userName') || '',
        email: orderData.user?.email || '',
      },
      theme: {
        color: '#0e5c4a', // Forest green matching Ledger theme
      },
      modal: {
        ondismiss: () => {
          processingPlanId.value = null;
          console.log('Payment modal dismissed by user');
        },
      },
      handler: async (response: any) => {
        // Called by Razorpay when customer completes payment
        await verifyPayment(response, plan);
      },
    };

    // 4. Open Razorpay Checkout modal
    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (failResponse: any) => {
      processingPlanId.value = null;
      errorMsg.value = `Payment failed: ${failResponse.error?.description || 'Transaction was declined'}`;
    });

    rzp.open();
  } catch (err: any) {
    console.error('Error starting checkout:', err);
    errorMsg.value = err.response?.data?.message || err.message || 'Payment initiation failed';
    processingPlanId.value = null;
  }
};

/**
 * Send payment credentials to backend for HMAC-SHA256 signature verification
 */
const verifyPayment = async (rzpResponse: any, plan: PlanData) => {
  try {
    const res = await api.post('/payments/verify', {
      razorpay_order_id: rzpResponse.razorpay_order_id,
      razorpay_payment_id: rzpResponse.razorpay_payment_id,
      razorpay_signature: rzpResponse.razorpay_signature,
    });

    if (res.data?.success) {
      currentActivePlanId.value = plan.id;
      activatedSubscription.value = {
        planName: plan.name,
        paymentId: rzpResponse.razorpay_payment_id,
        currentPeriodEnd: res.data.data?.currentPeriodEnd,
      };
    } else {
      errorMsg.value = res.data?.message || 'Payment verification failed';
    }
  } catch (err: any) {
    console.error('Payment verification error:', err);
    errorMsg.value = err.response?.data?.message || 'Payment verification failed on server';
  } finally {
    processingPlanId.value = null;
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const goToDashboard = () => {
  activatedSubscription.value = null;
  router.push('/dashboard');
};

const fetchCurrentSubscription = async () => {
  try {
    const res = await api.get('/payments/subscription/current');
    if (res.data?.success && res.data?.data) {
      currentActivePlanId.value = res.data.data.planId || res.data.data.plan_id || null;
    }
  } catch (err) {
    console.warn('Could not fetch active subscription:', err);
  }
};

onMounted(() => {
  fetchPlans();
  fetchCurrentSubscription();
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
  position: relative;
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

/* Plans Grid */
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

/* ========================================================
   SUCCESS CELEBRATION MODAL STYLES
   ======================================================== */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(20, 23, 28, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

.success-modal-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 12px;
  width: 100%;
  max-width: 440px;
  padding: 32px 28px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.16);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(14, 92, 74, 0.15);
}

.success-title {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0 0 6px;
}

.success-subtitle {
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  color: var(--slate, #6b7280);
  line-height: 1.5;
  margin: 0 0 20px;
}

.success-details-card {
  width: 100%;
  background: #faf9f5;
  border: 1px solid var(--line, #e4e1d8);
  border-radius: 8px;
  padding: 14px 18px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12.5px;
}

.detail-label {
  color: var(--slate, #6b7280);
}

.detail-value {
  color: var(--ink, #14171c);
  font-weight: 600;
}

.detail-value.highlight {
  color: var(--forest, #0e5c4a);
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 14px;
}

.detail-value.status-badge {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
  font-family: var(--font-mono, monospace);
  font-size: 10.5px;
  padding: 2px 8px;
  border-radius: 999px;
}

.detail-value.mono {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--slate, #6b7280);
}

.success-modal-actions {
  display: flex;
  width: 100%;
  gap: 12px;
}

.btn-success-close {
  flex: 1;
  background: var(--surface, #ffffff);
  border: 1px solid var(--line, #e4e1d8);
  color: var(--slate, #6b7280);
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-success-close:hover {
  background: #f4f2eb;
  color: var(--ink, #14171c);
}

.btn-success-dashboard {
  flex: 1;
  background: var(--forest, #0e5c4a);
  border: 1px solid var(--forest, #0e5c4a);
  color: #ffffff;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-success-dashboard:hover {
  background: var(--forest-dark, #0a4638);
  border-color: var(--forest-dark, #0a4638);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .plans-grid {
    padding: 10px 12px 14px;
    gap: 12px;
  }

  .scroll-arrow-btn {
    display: none;
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
