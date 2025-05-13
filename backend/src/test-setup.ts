/**
 * Test setup file for integration tests
 * This file is used to set up the test environment for integration tests
 */

import { PrismaClient } from '@prisma/client';

// Create a global instance of Prisma for tests
export const prisma = new PrismaClient();

// Setup function for Jest (beforeAll)
export const setupJest = async () => {
  console.log('Setting up Jest test environment...');
  
  try {
    // Connect to database
    await prisma.$connect();
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

// Teardown function for Jest (afterAll)
export const teardownJest = async () => {
  console.log('Cleaning up Jest test environment...');
  
  try {
    // Disconnect Prisma client
    await prisma.$disconnect();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    // Ensure disconnect is attempted even if there was an error
    await prisma.$disconnect().catch(console.error);
  }
}; 