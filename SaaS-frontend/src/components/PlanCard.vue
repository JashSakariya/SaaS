<template>
  <div 
    class="plan-card" 
    :class="{ 'is-popular': plan.is_popular || plan.isPopular }"
  >
    <!-- Popular ribbon badge -->
    <div v-if="plan.is_popular || plan.isPopular" class="popular-badge">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      MOST POPULAR
    </div>

    <!-- Card Header -->
    <div class="card-header">
      <p class="plan-billing-tag">{{ plan.billingCycle || plan.billing_cycle || 'monthly' }} plan</p>
      <h3 class="plan-name">{{ plan.name }}</h3>
      <p class="plan-desc">{{ plan.description || 'Access all essential tools to grow your business.' }}</p>
    </div>

    <!-- Price Block -->
    <div class="price-block">
      <div class="price-row">
        <span class="currency-symbol">₹</span>
        <span class="price-value" :class="priceFontSizeClass">{{ formattedPrice }}</span>
        <span class="billing-period">/{{ plan.billingCycle || plan.billing_cycle || 'month' }}</span>
      </div>
      <p class="tax-note">Billed {{ plan.durationDays || plan.duration_days || 30 }} days access</p>
    </div>

    <!-- Action Button -->
    <button 
      class="select-plan-btn"
      :class="{ 'btn-popular': plan.is_popular || plan.isPopular, 'btn-current': isCurrentPlan }"
      :disabled="isCurrentPlan || loading"
      @click="$emit('select', plan)"
    >
      <span v-if="loading" class="spinner"></span>
      <span v-else-if="isCurrentPlan">Current Plan</span>
      <span v-else>Choose {{ plan.name }}</span>
    </button>

    <div class="card-divider"></div>

    <!-- Features Section -->
    <div class="features-section">
      <p class="features-title">WHAT'S INCLUDED:</p>
      <ul class="feature-list">
        <li v-for="(feature, idx) in parsedFeatures" :key="idx" class="feature-item">
          <span class="check-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
          <span class="feature-text">{{ feature }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface PlanData {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  priceInRupees?: number;
  priceFormatted?: string;
  currency?: string;
  billingCycle?: string;
  billing_cycle?: string;
  durationDays?: number;
  duration_days?: number;
  features: string[] | string;
  isPopular?: boolean;
  is_popular?: boolean | number;
  isActive?: boolean;
  is_active?: boolean | number;
}

const props = withDefaults(
  defineProps<{
    plan: PlanData;
    isCurrentPlan?: boolean;
    loading?: boolean;
  }>(),
  {
    isCurrentPlan: false,
    loading: false,
  }
);

defineEmits<{
  (e: 'select', plan: PlanData): void;
}>();

const formattedPrice = computed(() => {
  const rupees = props.plan.priceInRupees || Math.round(props.plan.price / 100);
  return Number(rupees).toLocaleString('en-IN');
});

const priceFontSizeClass = computed(() => {
  const len = formattedPrice.value.length;
  if (len > 9) return 'price-compact'; // e.g. 1,00,00,000 (8+ digits)
  if (len > 6) return 'price-medium';  // e.g. 50,00,000 (6-7 digits)
  return 'price-regular';              // e.g. 1,499
});

const parsedFeatures = computed(() => {
  if (Array.isArray(props.plan.features)) {
    return props.plan.features;
  }
  if (typeof props.plan.features === 'string') {
    try {
      return JSON.parse(props.plan.features);
    } catch {
      return [props.plan.features];
    }
  }
  return [];
});
</script>

<style scoped>
.plan-card {
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
  position: relative;
  box-shadow: 0 1px 3px rgba(20, 23, 28, 0.04);
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  scroll-snap-align: center;
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(20, 23, 28, 0.06);
  border-color: #d1cdbf;
}

.plan-card.is-popular {
  border-color: var(--forest, #0e5c4a);
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(14, 92, 74, 0.08);
}

/* Popular ribbon badge */
.popular-badge {
  position: absolute;
  top: -10px;
  right: 14px;
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  font-family: var(--font-mono, monospace);
  font-size: 9.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(14, 92, 74, 0.22);
  white-space: nowrap;
}

/* Card Header */
.card-header {
  margin-bottom: 12px;
}

.plan-billing-tag {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--slate, #6b7280);
  margin: 0 0 4px;
}

.plan-name {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 21px;
  font-weight: 600;
  color: var(--ink, #14171c);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
  min-height: 26px;
}

.plan-desc {
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  color: var(--slate, #6b7280);
  line-height: 1.45;
  margin: 0;
  min-height: 35px;
}

/* Price Block */
.price-block {
  margin-bottom: 14px;
  min-height: 52px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-wrap: nowrap;
}

.currency-symbol {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-size: 19px;
  font-weight: 500;
  color: var(--ink, #14171c);
}

.price-value {
  font-family: var(--font-display, 'Fraunces', Georgia, serif);
  font-weight: 600;
  color: var(--ink, #14171c);
  line-height: 1;
  white-space: nowrap;
}

.price-value.price-regular {
  font-size: 30px;
}

.price-value.price-medium {
  font-size: 24px;
}

.price-value.price-compact {
  font-size: 19px;
}

.billing-period {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--slate, #6b7280);
  margin-left: 3px;
}

.tax-note {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  color: #9ca3af;
  margin: 4px 0 0;
}

/* Action Button */
.select-plan-btn {
  width: 100%;
  font-family: var(--font-body, sans-serif);
  font-weight: 600;
  font-size: 12.5px;
  padding: 8.5px 14px;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: var(--surface, #ffffff);
  color: var(--forest, #0e5c4a);
  border: 1.5px solid var(--forest, #0e5c4a);
}

.select-plan-btn:hover:not(:disabled):not(.btn-popular) {
  background: var(--forest-soft, #e7f0ed);
}

.select-plan-btn.btn-popular {
  background: var(--forest, #0e5c4a);
  color: #ffffff;
  border-color: var(--forest, #0e5c4a);
}

.select-plan-btn.btn-popular:hover:not(:disabled) {
  background: var(--forest-dark, #0a4638);
  border-color: var(--forest-dark, #0a4638);
}

.select-plan-btn.btn-current {
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest-dark, #0a4638);
  border-color: transparent;
  cursor: default;
}

.select-plan-btn:disabled {
  opacity: 0.85;
}

/* Divider */
.card-divider {
  height: 1px;
  background: var(--line, #e4e1d8);
  margin: 14px 0;
}

/* Features Section */
.features-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.features-title {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--slate, #6b7280);
  margin: 0 0 10px;
  font-weight: 600;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: var(--font-body, sans-serif);
  font-size: 12px;
  color: var(--ink, #14171c);
  line-height: 1.35;
}

.check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  background: var(--forest-soft, #e7f0ed);
  color: var(--forest, #0e5c4a);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 1px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
