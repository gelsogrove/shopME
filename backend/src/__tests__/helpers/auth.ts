import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../../app';

const prisma = new PrismaClient();

/**
 * Create a test user with a workspace for testing
 * @param prefix Prefix for the test user email
 */
export async function createTestUser(prefix: string = 'test') {
  const timestamp = Date.now();
  const email = `${prefix}-${timestamp}@example.com`;
  
  // Create test user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash('Password123!', 10),
      firstName: 'Test',
      lastName: 'User'
    }
  });
  
  // Create test workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      slug: `test-workspace-${timestamp}`,
      language: 'en',
      currency: 'EUR',
      isActive: true,
      users: {
        create: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });
  
  return { user, workspace };
}

/**
 * Get an auth token for a user
 * @param email User email
 */
export async function getAuthToken(email: string): Promise<string> {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email,
      password: 'Password123!'
    });
  
  // Extract token from cookie
  const cookies = loginResponse.headers['set-cookie'];
  if (cookies && cookies.length > 0) {
    const authCookie = cookies[0].split(';')[0];
    return authCookie.split('=')[1];
  }
  
  return '';
}

/**
 * Set appropriate headers for test authentication
 * This can be used in test requests to properly authenticate
 * 
 * @param req - The supertest request object
 * @param options - Authentication options
 * @returns The supertest request with authentication headers
 */
export function setupTestAuth(req: request.Test, options: {
  token?: string;                // Set a real auth token
  useTestAuth?: boolean;         // Use mock test authentication
  skipAuth?: boolean;            // Skip authentication check
  workspaceId?: string;          // Set workspace ID
} = {}): request.Test {
  if (options.token) {
    req.set('Cookie', [`auth_token=${options.token}`]);
  }
  
  if (options.useTestAuth) {
    req.set('X-Test-Auth', 'true');
  }
  
  if (options.skipAuth) {
    req.set('X-Test-Skip-Auth', 'true');
  }
  
  if (options.workspaceId) {
    req.set('X-Workspace-Id', options.workspaceId);
  }
  
  return req;
} 