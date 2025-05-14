import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';

// Definizione delle interfacce basate sul workspaceService reale
interface WorkspaceDTO {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  whatsappPhoneNumber?: string;
  whatsappApiKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  isDelete?: boolean;
  currency?: string;
  language?: string;
  messageLimit?: number;
  challengeStatus?: boolean;
  wipMessages?: any;
  blocklist?: string;
  url?: string;
  welcomeMessages?: any;
}

interface CreateWorkspaceData {
  name: string;
  slug: string;
  description?: string;
}

interface UpdateWorkspaceData {
  name?: string;
  slug?: string;
  description?: string;
}

// Prima definiamo il mock con i tipi corretti
const mockWorkspaceService = {
  // @ts-ignore: Mock type definitions
  getAll: jest.fn(),
  // @ts-ignore: Mock type definitions
  getById: jest.fn(),
  // @ts-ignore: Mock type definitions
  create: jest.fn(),
  // @ts-ignore: Mock type definitions
  update: jest.fn(),
  // @ts-ignore: Mock type definitions
  delete: jest.fn()
};

// Poi lo registriamo
jest.mock('../../../services/workspace.service', () => ({
  workspaceService: mockWorkspaceService
}));

// E infine importiamo il controller che usa il servizio mockato
import { workspaceController } from '../../../controllers/workspace.controller';

describe('Workspace Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset dei mock prima di ogni test
    mockWorkspaceService.getAll.mockClear();
    mockWorkspaceService.getById.mockClear();
    mockWorkspaceService.create.mockClear();
    mockWorkspaceService.update.mockClear();
    mockWorkspaceService.delete.mockClear();

    // Mock per request, response e next
    mockRequest = {
      params: {
        id: 'workspace-test-id'
      },
      body: {
        name: 'Test Workspace',
        slug: 'test-workspace',
        description: 'Test workspace description'
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    } as unknown as Response;

    mockNext = jest.fn() as unknown as NextFunction;
  });

  describe('getAll', () => {
    it('should return all workspaces', async () => {
      // Setup
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.getAll.mockResolvedValueOnce([
        {
          id: 'workspace-test-id',
          name: 'Test Workspace'
        }
      ]);

      await workspaceController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockWorkspaceService.getAll).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'workspace-test-id',
            name: 'Test Workspace'
          })
        ])
      );
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      // @ts-ignore: Mock error typing
      mockWorkspaceService.getAll.mockRejectedValueOnce(error);

      await workspaceController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return the workspace by ID', async () => {
      // Setup
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.getById.mockResolvedValueOnce({
        id: 'workspace-test-id',
        name: 'Test Workspace'
      });

      await workspaceController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockWorkspaceService.getById).toHaveBeenCalledWith('workspace-test-id');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'workspace-test-id',
          name: 'Test Workspace'
        })
      );
    });

    it('should return 404 if workspace not found', async () => {
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.getById.mockResolvedValueOnce(null);

      await workspaceController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace not found'
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      // @ts-ignore: Mock error typing
      mockWorkspaceService.getById.mockRejectedValueOnce(error);

      await workspaceController.getById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should create and return a new workspace', async () => {
      // Setup
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.create.mockResolvedValueOnce({
        id: 'new-workspace-id',
        name: 'New Workspace'
      });

      await workspaceController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockWorkspaceService.create).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-workspace-id',
          name: 'New Workspace'
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      // @ts-ignore: Mock error typing
      mockWorkspaceService.create.mockRejectedValueOnce(error);

      await workspaceController.create(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update and return the workspace', async () => {
      // Setup
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.update.mockResolvedValueOnce({
        id: 'workspace-test-id',
        name: 'Updated Workspace'
      });

      await workspaceController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockWorkspaceService.update).toHaveBeenCalledWith('workspace-test-id', mockRequest.body);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'workspace-test-id',
          name: 'Updated Workspace'
        })
      );
    });

    it('should return 404 if workspace not found', async () => {
      // @ts-ignore: Mock return value typing
      mockWorkspaceService.update.mockResolvedValueOnce(null);

      await workspaceController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Workspace not found'
        })
      );
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      // @ts-ignore: Mock error typing
      mockWorkspaceService.update.mockRejectedValueOnce(error);

      await workspaceController.update(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete the workspace and return 204', async () => {
      await workspaceController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockWorkspaceService.delete).toHaveBeenCalledWith('workspace-test-id');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      const error = new Error('Test error');
      // @ts-ignore: Mock error typing
      mockWorkspaceService.delete.mockRejectedValueOnce(error);

      await workspaceController.delete(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 