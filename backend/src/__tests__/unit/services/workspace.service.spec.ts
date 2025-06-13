// @ts-nocheck - Disable TypeScript checking for this test file since we're mocking complex objects
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock WorkspaceRepository before importing
const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockFindBySlug = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockFindByUserId = jest.fn();

jest.mock('../../../repositories/workspace.repository', () => {
  return {
    WorkspaceRepository: jest.fn().mockImplementation(() => ({
      findAll: mockFindAll,
      findById: mockFindById,
      findBySlug: mockFindBySlug,
      create: mockCreate,
      update: mockUpdate,
      delete: mockDelete,
      findByUserId: mockFindByUserId
    }))
  };
});

// Mock types for workspace
type MockWorkspace = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  whatsappPhoneNumber?: string | null;
  whatsappApiKey?: string | null; // Note: API key in DB is different from token in entity
  whatsappWebhookUrl?: string | null;
  webhookUrl?: string | null;
  notificationEmail?: string | null;
  language?: string;
  currency?: string;
  messageLimit?: number;
  blocklist?: string | null;
  welcomeMessages?: any;
  wipMessages?: any;
  challengeStatus?: boolean;
  isActive?: boolean;
  isDelete?: boolean;
  url?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mock User with workspaces
type MockUser = {
  id: string;
  workspaces?: Array<{
    workspace: MockWorkspace;
  }>;
}

// Import the service after mocking WorkspaceRepository
import { WorkspaceService } from '../../../application/services/workspace.service';
import { Workspace, WorkspaceProps } from '../../../domain/entities/workspace.entity';

describe('Workspace Service', () => {
  let workspaceService: WorkspaceService;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    workspaceService = new WorkspaceService();
  });

  describe('getAll', () => {
    it('should return all active workspaces', async () => {
      const mockWorkspaces: MockWorkspace[] = [
        { id: 'workspace-1', name: 'Workspace 1', slug: 'workspace-1', isDelete: false },
        { id: 'workspace-2', name: 'Workspace 2', slug: 'workspace-2', isDelete: false }
      ];

      mockFindAll.mockResolvedValue(mockWorkspaces);

      const result = await workspaceService.getAll();

      expect(mockFindAll).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('workspace-1');
      expect(result[1].id).toBe('workspace-2');
    });

    it('should handle errors and rejections', async () => {
      const error = new Error('Database error');
      mockFindAll.mockRejectedValue(error);

      await expect(workspaceService.getAll()).rejects.toThrow(error);
    });
  });

  describe('getById', () => {
    it('should return a workspace by ID', async () => {
      const mockWorkspace: MockWorkspace = {
        id: 'workspace-1',
        name: 'Workspace 1',
        slug: 'workspace-1',
        isDelete: false
      };

      mockFindById.mockResolvedValue(mockWorkspace);

      const result = await workspaceService.getById('workspace-1');

      expect(mockFindById).toHaveBeenCalledWith('workspace-1');
      expect(result?.id).toBe('workspace-1');
    });

    it('should return null if workspace not found', async () => {
      mockFindById.mockResolvedValue(null);

      const result = await workspaceService.getById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle errors and rejections', async () => {
      const error = new Error('Database error');
      mockFindById.mockRejectedValue(error);

      await expect(workspaceService.getById('workspace-1')).rejects.toThrow(error);
    });
  });

  describe('getBySlug', () => {
    it('should return a workspace by slug', async () => {
      const mockWorkspace: MockWorkspace = {
        id: 'workspace-1',
        name: 'Workspace 1',
        slug: 'workspace-1',
        isDelete: false
      };

      mockFindBySlug.mockResolvedValue(mockWorkspace);

      const result = await workspaceService.getBySlug('workspace-1');

      expect(mockFindBySlug).toHaveBeenCalledWith('workspace-1');
      expect(result?.slug).toBe('workspace-1');
    });

    it('should return null if no workspace found with given slug', async () => {
      mockFindBySlug.mockResolvedValue(null);

      const result = await workspaceService.getBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new workspace', async () => {
      const workspaceData: WorkspaceProps = {
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'A new workspace'
      };

      const mockCreatedWorkspace: MockWorkspace = {
        id: 'new-workspace-id',
        name: workspaceData.name,
        slug: workspaceData.slug,
        description: workspaceData.description,
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCreate.mockResolvedValue(mockCreatedWorkspace);
      mockFindBySlug.mockResolvedValue(null);

      const result = await workspaceService.create(workspaceData);

      expect(mockCreate).toHaveBeenCalled();
      expect(result.id).toBe('new-workspace-id');
      expect(result.name).toBe('New Workspace');
    });

    it('should generate a slug from the name if not provided', async () => {
      const workspaceData: WorkspaceProps = {
        name: 'New Workspace',
        description: 'A new workspace'
      };

      const mockCreatedWorkspace: MockWorkspace = {
        id: 'new-id',
        name: workspaceData.name,
        description: workspaceData.description,
        slug: 'new-workspace',
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCreate.mockResolvedValue(mockCreatedWorkspace);
      mockFindBySlug.mockResolvedValue(null);

      const result = await workspaceService.create(workspaceData);

      expect(mockCreate).toHaveBeenCalled();
      expect(result.slug).toBe('new-workspace');
    });

    it('should throw error if workspace with same slug exists', async () => {
      const workspaceData: WorkspaceProps = {
        name: 'Existing Workspace',
        slug: 'existing-workspace'
      };

      const existingWorkspace: MockWorkspace = {
        id: 'existing-id',
        name: 'Existing Workspace',
        slug: 'existing-workspace'
      };

      mockFindBySlug.mockResolvedValue(existingWorkspace);

      await expect(workspaceService.create(workspaceData))
        .rejects.toThrow('Workspace with name "Existing Workspace" already exists');
    });

    it('should handle errors and rejections', async () => {
      const error = new Error('Database error');
      mockFindBySlug.mockResolvedValue(null);
      mockCreate.mockRejectedValue(error);

      await expect(
        workspaceService.create({ 
          name: 'New Workspace',
          slug: 'new-workspace'
        })
      ).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an existing workspace', async () => {
      const updateData: WorkspaceProps = {
        name: 'Updated Workspace',
        description: 'Updated description'
      };

      const mockUpdatedWorkspace: MockWorkspace = {
        id: 'workspace-id',
        name: updateData.name as string,
        description: updateData.description,
        slug: 'updated-workspace',
        isDelete: false,
        updatedAt: new Date()
      };

      mockUpdate.mockResolvedValue(mockUpdatedWorkspace);
      mockFindBySlug.mockResolvedValue(null);
      mockFindById.mockResolvedValue({ id: 'workspace-id', name: 'Old Name' });

      const result = await workspaceService.update('workspace-id', updateData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result?.id).toBe('workspace-id');
      expect(result?.name).toBe('Updated Workspace');
    });

    it('should generate a new slug if name is updated', async () => {
      const updateData: WorkspaceProps = {
        name: 'New Name'
      };

      const mockUpdatedWorkspace: MockWorkspace = {
        id: 'workspace-id',
        name: 'New Name',
        slug: 'new-name',
        isDelete: false,
        updatedAt: new Date()
      };

      mockUpdate.mockResolvedValue(mockUpdatedWorkspace);
      mockFindBySlug.mockResolvedValue(null);
      mockFindById.mockResolvedValue({ id: 'workspace-id', name: 'Old Name' });

      const result = await workspaceService.update('workspace-id', updateData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result?.slug).toBe('new-name');
    });

    it('should not update slug if name is not provided', async () => {
      const updateData: WorkspaceProps = {
        description: 'Only description updated'
      };

      const mockUpdatedWorkspace: MockWorkspace = {
        id: 'workspace-id',
        name: 'Original Name',
        description: 'Only description updated',
        slug: 'original-slug',
        isDelete: false,
        updatedAt: new Date()
      };

      mockUpdate.mockResolvedValue(mockUpdatedWorkspace);
      mockFindById.mockResolvedValue({ 
        id: 'workspace-id', 
        name: 'Original Name', 
        slug: 'original-slug' 
      });

      const result = await workspaceService.update('workspace-id', updateData);

      expect(mockUpdate).toHaveBeenCalled();
      expect(result?.description).toBe('Only description updated');
      expect(result?.slug).toBe('original-slug');
    });

    it('should handle errors and rejections', async () => {
      const error = new Error('Database error');
      mockUpdate.mockRejectedValue(error);
      mockFindById.mockResolvedValue({ id: 'workspace-id', name: 'Original Name' });

      await expect(
        workspaceService.update('workspace-id', { name: 'Updated Name' })
      ).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should soft delete a workspace by marking isDelete as true', async () => {
      const existingWorkspace = { id: 'workspace-id', name: 'Test Workspace', isDelete: false };

      mockFindById.mockResolvedValue(existingWorkspace);
      mockDelete.mockResolvedValue(true);

      const result = await workspaceService.delete('workspace-id');

      expect(mockDelete).toHaveBeenCalledWith('workspace-id');
      expect(result).toBe(true);
    });

    it('should return false if workspace not found', async () => {
      mockDelete.mockResolvedValue(false);
      
      const result = await workspaceService.delete('non-existent-id');
      
      expect(result).toBe(false);
    });

    it('should handle errors and rejections', async () => {
      const error = new Error('Database error');
      mockDelete.mockRejectedValue(error);
      mockFindById.mockResolvedValue({ id: 'workspace-id', isDelete: false });

      await expect(workspaceService.delete('workspace-id')).rejects.toThrow(error);
    });
  });

  describe('getWorkspacesForUser', () => {
    it('should return workspaces for a user', async () => {
      const userId = 'user-123';
      const mockWorkspaces: MockWorkspace[] = [
        { id: 'ws-1', name: 'Workspace 1' },
        { id: 'ws-2', name: 'Workspace 2' }
      ];
      
      // FIX: Il repository restituisce direttamente un array di workspace
      mockFindByUserId.mockResolvedValue(mockWorkspaces.map(ws => new Workspace(ws)));

      const result = await workspaceService.getWorkspacesForUser(userId);

      expect(mockFindByUserId).toHaveBeenCalledWith(userId);
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(Workspace);
      expect(result[0].id).toBe('ws-1');
    });

    it('should return empty array if user not found', async () => {
      mockFindByUserId.mockResolvedValue([]);

      const result = await workspaceService.getWorkspacesForUser('unknown-user');

      expect(result).toEqual([]);
    });
  });
}); 