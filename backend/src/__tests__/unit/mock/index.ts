/**
 * Shared mock data for unit tests
 * This file exports all mock data that can be reused across unit tests
 */

export * from './entity-mocks';
export * from './request-response-mocks';
export * from './service-mocks';

// Import and re-export integration test mocks for shared usage
// This allows unit tests to reuse integration test mocks
import * as categoryMocks from '../../integration/mock/mockCategories';
import * as clientMocks from '../../integration/mock/mockClients';
import * as offerMocks from '../../integration/mock/mockOffers';
import * as productMocks from '../../integration/mock/mockProducts';
import * as serviceMocks from '../../integration/mock/mockServices';
import * as settingsMocks from '../../integration/mock/mockSettings';
import * as userMocks from '../../integration/mock/mockUsers';
import * as workspaceMocks from '../../integration/mock/mockWorkspaces';

export {
  categoryMocks, clientMocks,
  offerMocks, productMocks,
  serviceMocks, settingsMocks, userMocks,
  workspaceMocks
};
