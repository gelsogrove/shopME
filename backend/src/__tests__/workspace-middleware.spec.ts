import { Request, Response } from 'express';
import { WorkspaceContextDTO } from '../application/dtos/workspace-context.dto';
import { workspaceContextMiddleware } from '../interfaces/http/middlewares/workspace-context.middleware';

// Mock the logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Workspace Context Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      body: {},
      headers: {},
      header: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction.mockClear();
  });

  test('should extract workspaceId from URL path parameter', () => {
    // Arrange
    mockRequest.params = { workspaceId: 'abc123-test-uuid-456' };
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).workspaceContext).toBeTruthy();
    expect((mockRequest as any).workspaceContext.workspaceId).toBe('abc123-test-uuid-456');
  });

  test('should extract workspaceId from query parameter', () => {
    // Arrange
    mockRequest.query = { workspaceId: 'query-test-uuid-789' };
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).workspaceContext).toBeTruthy();
    expect((mockRequest as any).workspaceContext.workspaceId).toBe('query-test-uuid-789');
  });

  test('should extract workspaceId from request body', () => {
    // Arrange
    mockRequest.body = { workspaceId: 'body-test-uuid-012' };
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).workspaceContext).toBeTruthy();
    expect((mockRequest as any).workspaceContext.workspaceId).toBe('body-test-uuid-012');
  });

  test('should extract workspaceId from x-workspace-id header', () => {
    // Arrange
    const workspaceId = 'header-test-uuid-345';
    (mockRequest.header as jest.Mock).mockImplementation((header) => {
      if (header === 'x-workspace-id') return workspaceId;
      return null;
    });
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).workspaceContext).toBeTruthy();
    expect((mockRequest as any).workspaceContext.workspaceId).toBe(workspaceId);
  });

  test('should return 400 when no workspaceId is provided', () => {
    // Arrange - empty request
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Workspace ID is required' });
  });

  test('should properly handle error during validation', () => {
    // Arrange
    jest.spyOn(WorkspaceContextDTO, 'fromRequest').mockImplementationOnce(() => {
      throw new Error('Validation error');
    });
    
    // Act
    workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ 
      error: 'Server error processing workspace context' 
    });
  });
}); 