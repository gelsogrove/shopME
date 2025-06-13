import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { workspaceValidationMiddleware } from '../../../interfaces/http/middlewares/workspace-validation.middleware';
import { prisma } from '../../../lib/prisma';

// Mock Prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    workspace: {
      findUnique: jest.fn()
    }
  }
}));

// Mock logger
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

describe('Workspace Validation Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      query: {},
      headers: {},
      originalUrl: '/test-url',
      method: 'GET'
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
    mockPrisma = prisma as any;
    
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Workspace ID Extraction', () => {
    it('should extract workspace ID from URL params', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'test-workspace-123' };
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'test-workspace-123',
        name: 'Test Workspace',
        isActive: true,
        isDelete: false
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-workspace-123' },
        select: { id: true, name: true, isActive: true, isDelete: true }
      });
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should extract workspace ID from query parameters', async () => {
      // Arrange
      mockRequest.query = { workspaceId: 'query-workspace-456' };
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'query-workspace-456',
        name: 'Query Workspace',
        isActive: true,
        isDelete: false
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'query-workspace-456' },
        select: { id: true, name: true, isActive: true, isDelete: true }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract workspace ID from headers', async () => {
      // Arrange
      mockRequest.headers = { 'x-workspace-id': 'header-workspace-789' };
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'header-workspace-789',
        name: 'Header Workspace',
        isActive: true,
        isDelete: false
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'header-workspace-789' },
        select: { id: true, name: true, isActive: true, isDelete: true }
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should prioritize URL params over query and headers', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'url-workspace' };
      mockRequest.query = { workspaceId: 'query-workspace' };
      mockRequest.headers = { 'x-workspace-id': 'header-workspace' };
      
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'url-workspace',
        name: 'URL Workspace',
        isActive: true,
        isDelete: false
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith({
        where: { id: 'url-workspace' },
        select: { id: true, name: true, isActive: true, isDelete: true }
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 400 when workspace ID is missing', async () => {
      // Arrange - no workspace ID in any source
      
      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Workspace ID is required",
        debug: expect.objectContaining({
          url: '/test-url',
          method: 'GET',
          finalWorkspaceId: undefined
        }),
        sqlQuery: "No SQL query executed - workspace ID missing"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when workspace ID is empty string', async () => {
      // Arrange
      mockRequest.params = { workspaceId: '' };
      
      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Workspace ID is required"
        })
      );
    });

    it('should return 404 when workspace does not exist', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'non-existent-workspace' };
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Workspace not found",
        debug: {
          workspaceId: 'non-existent-workspace',
          url: '/test-url',
          method: 'GET'
        },
        sqlQuery: "SELECT id, name, isActive, isDelete FROM workspace WHERE id = 'non-existent-workspace'"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when workspace is deleted', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'deleted-workspace' };
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'deleted-workspace',
        name: 'Deleted Workspace',
        isActive: true,
        isDelete: true
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Workspace is not available",
        debug: expect.objectContaining({
          workspaceId: 'deleted-workspace',
          workspace: expect.objectContaining({
            isDelete: true
          })
        }),
        sqlQuery: "SELECT id, name, isActive, isDelete FROM workspace WHERE id = 'deleted-workspace'"
      });
    });

    it('should return 403 when workspace is inactive', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'inactive-workspace' };
      mockPrisma.workspace.findUnique.mockResolvedValue({
        id: 'inactive-workspace',
        name: 'Inactive Workspace',
        isActive: false,
        isDelete: false
      });

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Workspace is not available",
        debug: expect.objectContaining({
          workspace: expect.objectContaining({
            isActive: false
          })
        }),
        sqlQuery: "SELECT id, name, isActive, isDelete FROM workspace WHERE id = 'inactive-workspace'"
      });
    });

    it('should return 500 when database error occurs', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'test-workspace' };
      const dbError = new Error('Database connection failed');
      mockPrisma.workspace.findUnique.mockRejectedValue(dbError);

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Workspace validation failed",
        debug: expect.objectContaining({
          error: 'Database connection failed',
          url: '/test-url',
          method: 'GET'
        }),
        sqlQuery: "Error occurred before SQL execution"
      });
    });
  });

  describe('Success Cases', () => {
    it('should set workspace info in request and call next() for valid workspace', async () => {
      // Arrange
      const validWorkspace = {
        id: 'valid-workspace',
        name: 'Valid Workspace',
        isActive: true,
        isDelete: false
      };
      
      mockRequest.params = { workspaceId: 'valid-workspace' };
      mockPrisma.workspace.findUnique.mockResolvedValue(validWorkspace);

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect((mockRequest as any).workspace).toEqual(validWorkspace);
      expect((mockRequest as any).workspaceId).toBe('valid-workspace');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('Response Format Consistency', () => {
    it('should always include debug information in error responses', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'test-workspace' };
      mockRequest.originalUrl = '/api/workspaces/test-workspace/products';
      mockRequest.method = 'POST';
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      const calledWith = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(calledWith).toHaveProperty('message');
      expect(calledWith).toHaveProperty('debug');
      expect(calledWith).toHaveProperty('sqlQuery');
      expect(calledWith.debug).toHaveProperty('url');
      expect(calledWith.debug).toHaveProperty('method');
      expect(calledWith.debug.url).toBe('/api/workspaces/test-workspace/products');
      expect(calledWith.debug.method).toBe('POST');
    });

    it('should include SQL query in debug response', async () => {
      // Arrange
      mockRequest.params = { workspaceId: 'sql-test-workspace' };
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      // Act
      await workspaceValidationMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      const calledWith = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(calledWith.sqlQuery).toBe(
        "SELECT id, name, isActive, isDelete FROM workspace WHERE id = 'sql-test-workspace'"
      );
    });
  });
}); 