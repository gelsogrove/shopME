/**
 * Mock data for offers in integration tests
 */
import { timestamp } from './mockUsers';

export const mockOffer = {
  name: `Test Offer ${timestamp}`,
  description: 'This is a test offer',
  discountPercent: 15,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
  status: 'ACTIVE',
  isActive: true
};

export const mockOfferWithWorkspace = (workspaceId: string) => ({
  ...mockOffer,
  workspaceId
});

export const mockOfferWithProducts = (workspaceId: string, productIds: string[]) => ({
  ...mockOffer,
  workspaceId,
  products: productIds.map(id => ({ productId: id }))
});

export const mockOfferWithServices = (workspaceId: string, serviceIds: string[]) => ({
  ...mockOffer,
  workspaceId,
  services: serviceIds.map(id => ({ serviceId: id }))
});

export const generateTestOffer = (prefix: string, workspaceId?: string) => ({
  name: `${prefix} Offer ${timestamp}`,
  description: `${prefix} offer description for testing`,
  discountPercent: 20,
  startDate: new Date(),
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days in the future
  status: 'ACTIVE',
  isActive: true,
  ...(workspaceId && { workspaceId })
});

export const invalidOffer = {
  // Missing required fields
  description: 'Invalid offer without required fields'
}; 