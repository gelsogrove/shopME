/**
 * Mock data for workspaces in integration tests
 */
import { UserRole } from '@prisma/client';
import { timestamp } from './mockUsers';

export const mockWorkspace = {
  name: `Test Workspace ${timestamp}`,
  slug: `test-workspace-${timestamp}`,
  language: 'ENG',
  currency: 'EUR',
  isActive: true
};

export const mockWorkspaceWithUser = (userId: string) => ({
  name: `Test Workspace With User ${timestamp}`,
  slug: `test-workspace-with-user-${timestamp}`,
  users: {
    create: {
      userId: userId,
      role: 'OWNER' as UserRole
    }
  }
});

export const generateTestWorkspace = (prefix: string) => ({
  name: `${prefix} Workspace ${timestamp}`,
  slug: `${prefix.toLowerCase()}-workspace-${timestamp}`,
  language: 'ENG',
  currency: 'EUR',
  isActive: true
}); 