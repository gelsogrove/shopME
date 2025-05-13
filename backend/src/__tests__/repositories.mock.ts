/**
 * Mock per i repository
 * Questo file contiene mock di tutti i repository utilizzati nel progetto
 */

import * as repoMocks from './utils/repository-mocks';

describe('Repository Mocks', () => {
  test('createRepositoryMock returns expected structure', () => {
    const mock = repoMocks.createRepositoryMock();
    expect(mock).toHaveProperty('findAll');
    expect(mock).toHaveProperty('findById');
    expect(mock).toHaveProperty('create');
    expect(mock).toHaveProperty('update');
    expect(mock).toHaveProperty('delete');
    expect(mock).toHaveProperty('findActiveByWorkspaceId');
  });
});

// Funzione generica per creare mock di repository
const createRepositoryMock = (name: string) => ({
  findAll: jest.fn().mockResolvedValue([{ id: `${name}-1`, name: `Test ${name} 1` }]),
  findById: jest.fn().mockResolvedValue({ id: `${name}-1`, name: `Test ${name} 1` }),
  findByWorkspaceId: jest.fn().mockResolvedValue([{ id: `${name}-1`, name: `Test ${name} 1`, workspaceId: 'test-workspace-id' }]),
  create: jest.fn().mockResolvedValue({ id: `${name}-created`, name: `Created ${name}`, workspaceId: 'test-workspace-id' }),
  update: jest.fn().mockResolvedValue({ id: `${name}-1`, name: `Updated ${name}`, workspaceId: 'test-workspace-id' }),
  delete: jest.fn().mockResolvedValue(true),
  // Metodi aggiuntivi 
  findActiveByWorkspaceId: jest.fn().mockResolvedValue([{ id: `${name}-1`, name: `Active ${name}`, workspaceId: 'test-workspace-id', isActive: true }]),
  findFirst: jest.fn().mockResolvedValue({ id: `${name}-1`, name: `Test ${name} 1` }),
  count: jest.fn().mockResolvedValue(1),
});

// Esporta mock dei vari repository
export const mockCategoryRepository = createRepositoryMock('category');
export const mockProductRepository = createRepositoryMock('product');
export const mockServiceRepository = createRepositoryMock('service');
export const mockFaqRepository = createRepositoryMock('faq');
export const mockEventRepository = createRepositoryMock('event');
export const mockSupplierRepository = createRepositoryMock('supplier');
export const mockSettingRepository = createRepositoryMock('setting');
export const mockUserRepository = createRepositoryMock('user');
export const mockWorkspaceRepository = createRepositoryMock('workspace');
export const mockMessageRepository = createRepositoryMock('message');
export const mockAgentConfigurationRepository = createRepositoryMock('agentConfiguration');
export const mockOfferRepository = createRepositoryMock('offer');
export const mockGdprSettingRepository = createRepositoryMock('gdprSetting');

// Mock delle classi dei repository
export const CategoryRepositoryMock = jest.fn().mockImplementation(() => mockCategoryRepository);
export const ProductRepositoryMock = jest.fn().mockImplementation(() => mockProductRepository);
export const ServiceRepositoryMock = jest.fn().mockImplementation(() => mockServiceRepository);
export const FaqRepositoryMock = jest.fn().mockImplementation(() => mockFaqRepository);
export const EventRepositoryMock = jest.fn().mockImplementation(() => mockEventRepository);
export const SupplierRepositoryMock = jest.fn().mockImplementation(() => mockSupplierRepository);
export const SettingRepositoryMock = jest.fn().mockImplementation(() => mockSettingRepository);
export const UserRepositoryMock = jest.fn().mockImplementation(() => mockUserRepository);
export const WorkspaceRepositoryMock = jest.fn().mockImplementation(() => mockWorkspaceRepository);
export const MessageRepositoryMock = jest.fn().mockImplementation(() => mockMessageRepository);
export const AgentConfigurationRepositoryMock = jest.fn().mockImplementation(() => mockAgentConfigurationRepository);
export const OfferRepositoryMock = jest.fn().mockImplementation(() => mockOfferRepository);
export const GdprSettingRepositoryMock = jest.fn().mockImplementation(() => mockGdprSettingRepository); 