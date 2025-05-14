/**
 * Mock data for services in integration tests
 */
import { timestamp } from './mockUsers';

export const mockService = {
  name: `Test Service ${timestamp}`,
  description: 'This is a test service',
  price: 149.99,
  duration: 60, // in minutes
  status: 'ACTIVE',
  slug: `test-service-${timestamp}`,
  isActive: true
};

export const mockServiceWithCategory = (categoryId: string, workspaceId?: string) => ({
  ...mockService,
  categoryId,
  ...(workspaceId && { workspaceId })
});

export const generateTestService = (prefix: string, categoryId?: string, workspaceId?: string) => ({
  name: `${prefix} Service ${timestamp}`,
  description: `${prefix} service description for testing`,
  price: 199.99,
  duration: 90, // in minutes
  status: 'ACTIVE',
  slug: `${prefix.toLowerCase()}-service-${timestamp}`,
  isActive: true,
  ...(categoryId && { categoryId }),
  ...(workspaceId && { workspaceId })
});

export const invalidService = {
  // Missing required fields
  description: 'Invalid service without required fields'
}; 