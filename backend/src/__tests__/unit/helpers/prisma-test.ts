/**
 * Prisma test configuration
 * This creates a direct PrismaClient specifically for tests
 */
import { PrismaClient } from '@prisma/client';
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