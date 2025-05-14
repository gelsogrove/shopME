/**
 * Test setup file for integration tests
 * This file is used to set up the test environment for integration tests
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import logger, { enableLogsForTests } from '../../utils/logger';

// Enable logs for tests
enableLogsForTests();

// Log the database URL for debugging (solo in modalità debug)
if (process.env.DEBUG_TESTS) {
  logger.debug('DATABASE_URL:', process.env.DATABASE_URL);
}

// Create a global instance of Prisma for tests
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/shop_test'
    }
  }
});

// Log connection info solo in modalità debug
if (process.env.DEBUG_TESTS) {
  console.log('Prisma client created with test database configuration');
}

/**
 * Seeds the test database with initial data
 */
export const seedTestDatabase = async () => {
  // Solo in modalità debug
  if (process.env.DEBUG_TESTS) {
    console.log('Seeding test database...');
  }
  
  try {
    // Clean up existing data
    await cleanupTestDatabase();
    
    // Generare un timestamp per rendere l'email unica ogni volta
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    
    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: await bcrypt.hash('Password123!', 10),
        firstName: 'Test',
        lastName: 'User',
        status: 'ACTIVE',
      }
    });
    
    // Create a test workspace
    const testWorkspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
        slug: `test-workspace-${timestamp}`,
        language: 'en',
        currency: 'EUR',
        isActive: true,
        url: 'http://localhost:3000',
      }
    });
    
    // Create test categories
    const category = await prisma.categories.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'A test category',
        workspaceId: testWorkspace.id
      }
    });
    
    // Create test products
    const product = await prisma.products.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        description: 'A test product',
        price: 9.99,
        stock: 10,
        workspaceId: testWorkspace.id,
        categoryId: category.id
      }
    });
    
    if (process.env.DEBUG_TESTS) {
      console.log('Test database seeded successfully');
    }
    return { testUser, testWorkspace };
  } catch (error) {
    console.error('Error seeding test database:', error);
    throw error;
  }
};

/**
 * Cleans up the test database by removing all data
 */
export const cleanupTestDatabase = async () => {
  if (process.env.DEBUG_TESTS) {
    console.log('Cleaning up test database...');
  }
  
  try {
    // Verifichiamo quali tabelle esistono nel database
    const existingTables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    
    if (process.env.DEBUG_TESTS) {
      console.log('Existing tables:', existingTables);
    }
    
    // Mappiamo i risultati in un array di nomi di tabelle
    const tableNames = Array.isArray(existingTables) 
      ? existingTables.map(table => table.tablename) 
      : [];
    
    if (process.env.DEBUG_TESTS) {
      console.log('Table names to check:', tableNames);
    }
    
    // Eliminiamo solo le tabelle che esistono
    // Ordine approssimativo basato sulle dipendenze (da più dipendenti a meno dipendenti)
    const tablesToCleanup = [
      'cartItems', 'carts',
      'orderItems', 'paymentDetails', 'orders',
      'message', 'chatSession',
      'products', 'categories',
      'userWorkspace', 'customers', 'services', 'prompts',
      'user', 'workspace'
    ];
    
    for (const table of tablesToCleanup) {
      if (tableNames.includes(table)) {
        try {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
          if (process.env.DEBUG_TESTS) {
            console.log(`Cleaned up table: ${table}`);
          }
        } catch (err) {
          console.error(`Error cleaning table ${table}:`, err);
        }
      } else if (process.env.DEBUG_TESTS) {
        console.log(`Table ${table} does not exist, skipping`);
      }
    }
    
    if (process.env.DEBUG_TESTS) {
      console.log('Test database cleaned up');
    }
  } catch (error) {
    console.error(`Error cleaning up test database:`, error);
  }
};

// Setup function for Jest (beforeAll)
export const setupJest = async () => {
  if (process.env.DEBUG_TESTS) {
    console.log('Setting up Jest test environment...');
  }
  
  try {
    // Connect to database
    await prisma.$connect();
    if (process.env.DEBUG_TESTS) {
      console.log('Connected to test database');
    }
    
    // Seed the test database
    const testData = await seedTestDatabase();
    if (process.env.DEBUG_TESTS) {
      console.log('Test database seeded successfully:', testData ? 'Data created' : 'No data created');
    }
    
    // Force database available to true for testing
    return true;
  } catch (error) {
    console.error('Error in test setup:', error);
    throw error;
  }
};

// Teardown function for Jest (afterAll)
export const teardownJest = async () => {
  if (process.env.DEBUG_TESTS) {
    console.log('Cleaning up Jest test environment...');
  }
  
  try {
    // Clean up the database
    await cleanupTestDatabase();
    
    // Disconnect Prisma client
    await prisma.$disconnect();
    if (process.env.DEBUG_TESTS) {
      console.log('Disconnected from test database');
    }
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    // Ensure disconnect is attempted even if there was an error
    await prisma.$disconnect().catch(console.error);
  }
}; 