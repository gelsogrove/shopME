# Test Structure

This directory contains the tests for the application. The tests are organized into the following categories:

- `integration`: Tests that verify the interaction between different parts of the application
- `unit`: Tests that verify the functionality of individual units (e.g. functions, classes)
- `helpers`: Helper functions for tests

## Mock Data Structure

To improve the maintainability and reuse of test data, we've organized mock data into dedicated directories:

```
__tests__/
├── integration/
│   ├── mock/
│   │   ├── index.ts          # Exports all mock data for integration tests
│   │   ├── mockUsers.ts      # User mock data
│   │   ├── mockWorkspaces.ts # Workspace mock data
│   │   ├── mockCategories.ts # Category mock data
│   │   ├── mockProducts.ts   # Product mock data
│   │   ├── mockServices.ts   # Service mock data
│   │   ├── mockClients.ts    # Client mock data
│   │   ├── mockOffers.ts     # Offer mock data
│   │   └── mockSettings.ts   # Settings mock data
│   └── ...
├── unit/
│   ├── mock/
│   │   ├── index.ts               # Exports all mock data for unit tests
│   │   ├── entity-mocks.ts        # Entity mock data
│   │   ├── service-mocks.ts       # Service mock data
│   │   └── request-response-mocks.ts # Request/Response mock data
│   └── ...
└── ...
```

## Using Mock Data

### In Integration Tests

Import mock data directly from the mock folder:

```typescript
import { mockAdminUser, generateTestUser } from './mock/mockUsers';
import { mockWorkspaceWithUser } from './mock/mockWorkspaces';

describe('Users API Integration Tests', () => {
  // Use mock data directly
  const testUser = mockAdminUser;
  
  // Or generate custom mock data
  const customUser = generateTestUser('CustomPrefix');
  
  // Use mock data with dynamic parameters
  const workspace = mockWorkspaceWithUser(userId);
  
  // ... rest of the test
});
```

### In Unit Tests

Import mock data from the unit mock index:

```typescript
import { userMocks, workspaceMocks } from '../mock';
// Or import specific mock functions from entity-mocks, service-mocks, etc.
import { mockEntity, generateMockEntity } from '../mock';

describe('Some Unit Test', () => {
  // Use mock data from integration tests via unit test index
  const testUser = userMocks.mockAdminUser;
  
  // Or use unit test specific mocks
  const mockEntityData = mockEntity();
  
  // ... rest of the test
});
```

## Benefits

- **Reduced duplication**: Mock data is defined once and reused across tests
- **Improved maintainability**: Changes to mock data only need to be made in one place
- **Better organization**: Clear separation of mock data from test logic
- **Flexibility**: Mock data can be customized for specific tests using generator functions 