/**
 * Prisma test configuration
 * This creates a direct PrismaClient specifically for tests
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../../../utils/logger';

// Create a test-specific PrismaClient
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Connect to the database
export const connectTestDatabase = async () => {
  try {
    logger.info('Connecting to test database...');
    await testPrisma.$connect();
    logger.info('Connected to test database');
    return true;
  } catch (error) {
    logger.error('Failed to connect to test database:', error);
    throw error;
  }
};

// Disconnect from the database
export const disconnectTestDatabase = async () => {
  try {
    logger.info('Disconnecting from test database...');
    await testPrisma.$disconnect();
    logger.info('Disconnected from test database');
    return true;
  } catch (error) {
    logger.error('Failed to disconnect from test database:', error);
    throw error;
  }
};

// Helper function to create test workspace
export const createTestWorkspace = async (name: string) => {
  return await testPrisma.workspace.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      isActive: true,
      isDelete: false,
      businessType: 'ECOMMERCE'
    }
  });
};

// Helper function to create test customer
export const createTestCustomer = async (workspaceId: string, customerData: {
  name: string;
  email: string;
  phone: string;
}) => {
  return await testPrisma.customers.create({
    data: {
      ...customerData,
      workspaceId,
      isActive: true,
      language: 'IT',
      activeChatbot: true,
      isBlacklisted: false
    }
  });
};

// Helper function to create test user
export const createTestUser = async (workspaceId: string, userData: {
  email: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const user = await testPrisma.user.create({
    data: {
      email: userData.email,
      passwordHash: hashedPassword,
      status: 'ACTIVE'
    }
  });

  // Create UserWorkspace association
  await testPrisma.userWorkspace.create({
    data: {
      userId: user.id,
      workspaceId,
      role: 'OWNER'
    }
  });

  return user;
}; 