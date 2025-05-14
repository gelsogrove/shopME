/**
 * Mock data for users in integration tests
 */
import { UserRole } from '@prisma/client';

export const timestamp = Date.now();

export const mockAdminUser = {
  email: `admin-user-${timestamp}@example.com`,
  password: 'StrongPassword123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as UserRole,
  gdprAccepted: new Date()
};

export const mockRegularUser = {
  email: `regular-user-${timestamp}@example.com`,
  password: 'Password123!',
  firstName: 'Regular',
  lastName: 'User',
  role: 'MEMBER' as UserRole,
  gdprAccepted: new Date()
};

export const mockNewUser = {
  email: `new-user-${timestamp}@example.com`,
  password: 'NewPassword123!',
  firstName: 'New',
  lastName: 'User',
  role: 'MEMBER' as UserRole,
  gdprAccepted: new Date()
};

export const generateTestUser = (prefix: string) => ({
  email: `${prefix}-${timestamp}@example.com`,
  password: 'TestPassword123!',
  firstName: prefix,
  lastName: 'TestUser',
  role: 'MEMBER' as UserRole,
  gdprAccepted: new Date()
}); 