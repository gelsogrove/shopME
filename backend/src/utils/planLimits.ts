export type PlanType = "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE"

export interface PlanLimits {
  maxProducts: number
  maxServices: number
  maxDocuments: number
  maxFaqs: number
  maxCustomers: number
  maxOrders: number
  maxChatSessions: number
  maxUsagePerMonth: number
  features: string[]
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    maxProducts: 10,
    maxServices: 5,
    maxDocuments: 3,
    maxFaqs: 10,
    maxCustomers: 50,
    maxOrders: 100,
    maxChatSessions: 200,
    maxUsagePerMonth: 1000,
    features: ["Basic Chat", "Product Catalog", "Order Management"]
  },
  BASIC: {
    maxProducts: 50,
    maxServices: 20,
    maxDocuments: 10,
    maxFaqs: 50,
    maxCustomers: 200,
    maxOrders: 500,
    maxChatSessions: 1000,
    maxUsagePerMonth: 5000,
    features: ["Basic Chat", "Product Catalog", "Order Management", "Analytics"]
  },
  PREMIUM: {
    maxProducts: 200,
    maxServices: 100,
    maxDocuments: 50,
    maxFaqs: 200,
    maxCustomers: 1000,
    maxOrders: 2000,
    maxChatSessions: 5000,
    maxUsagePerMonth: 25000,
    features: ["Advanced Chat", "Product Catalog", "Order Management", "Analytics", "WhatsApp Integration"]
  },
  ENTERPRISE: {
    maxProducts: -1, // Unlimited
    maxServices: -1, // Unlimited
    maxDocuments: -1, // Unlimited
    maxFaqs: -1, // Unlimited
    maxCustomers: -1, // Unlimited
    maxOrders: -1, // Unlimited
    maxChatSessions: -1, // Unlimited
    maxUsagePerMonth: -1, // Unlimited
    features: ["Advanced Chat", "Product Catalog", "Order Management", "Analytics", "WhatsApp Integration", "Custom Features"]
  }
}

export const getPlanLimits = (planType: PlanType): PlanLimits => {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.FREE
}

export const isUnlimited = (limit: number): boolean => {
  return limit === -1
}

export const checkLimit = (current: number, limit: number): boolean => {
  if (isUnlimited(limit)) return true
  return current < limit
}

// Helper functions for controllers
export const canAddProduct = (planType: PlanType, currentCount: number): boolean => {
  const limits = getPlanLimits(planType)
  return checkLimit(currentCount, limits.maxProducts)
}

export const canAddService = (planType: PlanType, currentCount: number): boolean => {
  const limits = getPlanLimits(planType)
  return checkLimit(currentCount, limits.maxServices)
}

export const canAddDocument = (planType: PlanType, currentCount: number): boolean => {
  const limits = getPlanLimits(planType)
  return checkLimit(currentCount, limits.maxDocuments)
}

export const canAddFaq = (planType: PlanType, currentCount: number): boolean => {
  const limits = getPlanLimits(planType)
  return checkLimit(currentCount, limits.maxFaqs)
}

export const getPlanLimitErrorMessage = (planType: PlanType, resourceType: string): string => {
  const limits = getPlanLimits(planType)
  const limit = resourceType === "products" ? limits.maxProducts :
                resourceType === "services" ? limits.maxServices :
                resourceType === "documents" ? limits.maxDocuments :
                resourceType === "faqs" ? limits.maxFaqs : -1
  
  if (isUnlimited(limit)) {
    return `You have unlimited ${resourceType} in your ${planType} plan`
  }
  
  return `Plan limit reached: ${resourceType} limit is ${limit} for ${planType} plan`
}
