/**
 * Mock data for clients in integration tests
 */
import { timestamp } from './mockUsers';

export const mockClient = {
  name: 'Test Client',
  email: `client-${timestamp}@example.com`,
  phone: `+39123456${timestamp.toString().substring(8, 14)}`,
  address: JSON.stringify({
    street: '123 Test Street',
    city: 'Test City',
    zip: '12345',
    country: 'Test Country'
  }),
  company: 'Test Company',
  discount: 0,
  language: 'English',
  notes: 'Test client notes',
  isActive: true
};

export const mockClientWithWorkspace = (workspaceId: string) => ({
  ...mockClient,
  workspaceId
});

export const generateTestClient = (prefix: string, workspaceId?: string) => ({
  name: `${prefix} Client`,
  email: `${prefix.toLowerCase()}-client-${timestamp}@example.com`,
  phone: `+39123456${timestamp.toString().substring(8, 14)}`,
  address: JSON.stringify({
    street: `${prefix} Street 123`,
    city: `${prefix} City`,
    zip: '54321',
    country: `${prefix} Country`
  }),
  company: `${prefix} Company`,
  discount: 0,
  language: 'English',
  notes: `${prefix} client notes for testing`,
  isActive: true,
  ...(workspaceId && { workspaceId })
});

export const invalidClient = {
  // Missing required fields
  notes: 'Invalid client without required fields'
}; 