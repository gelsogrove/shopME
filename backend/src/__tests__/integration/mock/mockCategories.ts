/**
 * Mock data for categories in integration tests
 */
import { timestamp } from './mockUsers';

export const mockCategory = {
  name: `Test Category ${timestamp}`,
  slug: `test-category-${timestamp}`,
  description: 'Test category description',
  isActive: true
};

export const mockCategoryWithWorkspace = (workspaceId: string) => ({
  ...mockCategory,
  workspaceId
});

export const generateTestCategory = (prefix: string, workspaceId?: string) => ({
  name: `${prefix} Category ${timestamp}`,
  slug: `${prefix.toLowerCase()}-category-${timestamp}`,
  description: `${prefix} category description for testing`,
  isActive: true,
  ...(workspaceId && { workspaceId })
}); 