/**
 * Plan limits utility functions
 * Defines limits for each subscription plan and provides validation functions
 */

export enum PlanType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL'
}

interface PlanLimits {
  maxProducts: number; // -1 for unlimited
  maxServices: number; // -1 for unlimited
  maxAIMessages: number; // -1 for unlimited
  maxWhatsAppChannels: number; // -1 for unlimited
}

/**
 * Define limits for each plan type
 */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    maxProducts: 3,
    maxServices: 3,
    maxAIMessages: 100,
    maxWhatsAppChannels: 1
  },
  [PlanType.BASIC]: {
    maxProducts: 5,
    maxServices: 5,
    maxAIMessages: 1000,
    maxWhatsAppChannels: 1
  },
  [PlanType.PROFESSIONAL]: {
    maxProducts: 100,
    maxServices: 100,
    maxAIMessages: 5000,
    maxWhatsAppChannels: 3
  }
};

/**
 * Get plan limits for a given plan type
 */
export function getPlanLimits(planType: PlanType): PlanLimits {
  return PLAN_LIMITS[planType];
}

/**
 * Check if adding a new product would exceed the plan limit
 */
export function canAddProduct(planType: PlanType, currentCount: number): boolean {
  const limits = getPlanLimits(planType);
  if (limits.maxProducts === -1) return true; // Unlimited
  return currentCount < limits.maxProducts;
}

/**
 * Check if adding a new service would exceed the plan limit
 */
export function canAddService(planType: PlanType, currentCount: number): boolean {
  const limits = getPlanLimits(planType);
  if (limits.maxServices === -1) return true; // Unlimited
  return currentCount < limits.maxServices;
}

/**
 * Get the maximum allowed products for a plan
 */
export function getMaxProducts(planType: PlanType): number | string {
  const limits = getPlanLimits(planType);
  return limits.maxProducts === -1 ? 'Unlimited' : limits.maxProducts;
}

/**
 * Get the maximum allowed services for a plan
 */
export function getMaxServices(planType: PlanType): number | string {
  const limits = getPlanLimits(planType);
  return limits.maxServices === -1 ? 'Unlimited' : limits.maxServices;
}

/**
 * Get a user-friendly error message for plan limits
 */
export function getPlanLimitErrorMessage(planType: PlanType, limitType: 'products' | 'services'): string {
  const limits = getPlanLimits(planType);
  const maxItems = limitType === 'products' ? limits.maxProducts : limits.maxServices;
  
  if (maxItems === -1) {
    return 'You have unlimited access to this feature.';
  }
  
  return `Your ${planType} plan allows a maximum of ${maxItems} ${limitType}. Please upgrade your plan to add more ${limitType}.`;
} 