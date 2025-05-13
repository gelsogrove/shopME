/**
 * Common repository mocks for tests
 */

export const createRepositoryMock = () => ({
  findAll: jest.fn().mockResolvedValue([{ id: 'test-id', name: 'Test Resource' }]),
  findById: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Test Resource' }),
  findByWorkspaceId: jest.fn().mockResolvedValue([{ id: 'test-id', name: 'Test Resource' }]),
  create: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Test Resource' }),
  update: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Updated Resource' }),
  delete: jest.fn().mockResolvedValue(true),
  findFirst: jest.fn().mockResolvedValue({ id: 'test-id', name: 'Test Resource' }),
  findMany: jest.fn().mockResolvedValue([{ id: 'test-id', name: 'Test Resource' }]),
  findActiveByWorkspaceId: jest.fn().mockResolvedValue([{ id: 'test-id', name: 'Test Resource' }])
});

export const workspaceId = 'test-workspace-id';
export const mockAuthToken = 'mocked-auth-token';
export const mockUserId = 'test-user-id';

// Questo è cruciale per il test WorkspaceContextDTO
export const mockWorkspaceContextDTO = (workspaceId: string) => ({
  workspaceId,
  isValid: () => true
});

// Aggiungiamo un test per evitare l'errore "Your test suite must contain at least one test"
describe('Repository Mocks', () => {
  test('createRepositoryMock returns expected structure', () => {
    const mock = createRepositoryMock();
    expect(mock).toHaveProperty('findAll');
    expect(mock).toHaveProperty('findById');
    expect(mock).toHaveProperty('create');
    expect(mock).toHaveProperty('update');
    expect(mock).toHaveProperty('delete');
  });
}); 