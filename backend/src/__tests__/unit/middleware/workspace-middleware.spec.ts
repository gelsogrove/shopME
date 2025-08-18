import { Request, Response } from 'express';
import { WorkspaceContextDTO } from '../../../application/dtos/workspace-context.dto';
import { workspaceContextMiddleware } from '../../../interfaces/http/middlewares/workspace-context.middleware';

// Mock the logger to prevent console output during tests
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

// Mock WorkspaceContextDTO class
jest.mock('../../../application/dtos/workspace-context.dto', () => ({
  WorkspaceContextDTO: {
    fromRequest: jest.fn()
  }
}));

describe('Test environment setup', () => {
  it('Jest is properly configured', () => {
    expect(1 + 1).toBe(2);
  });
});

describe('Workspace Context Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
    jest.clearAllMocks();
    
    // Setup request and response mocks
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();

    // Reset WorkspaceContextDTO mock implementation
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReset();
  });

  it('should extract workspaceId from URL path parameter', async () => {
    // Arrange
    mockRequest = {
      params: { workspaceId: 'abc123-test-uuid-456' }
    };

    // Mock WorkspaceContextDTO.fromRequest
    const mockDto = { workspaceId: 'abc123-test-uuid-456', isValid: jest.fn().mockReturnValue(true) };
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(mockDto);

    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.workspaceContext).toBe(mockDto);
    expect(mockRequest.workspaceContext?.workspaceId).toBe('abc123-test-uuid-456');
  });

  it('should extract workspaceId from query parameter', async () => {
    // Arrange
    mockRequest = {
      query: { workspaceId: 'query-test-uuid-789' }
    };

    // Mock WorkspaceContextDTO.fromRequest
    const mockDto = { workspaceId: 'query-test-uuid-789', isValid: jest.fn().mockReturnValue(true) };
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(mockDto);

    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.workspaceContext).toBe(mockDto);
    expect(mockRequest.workspaceContext?.workspaceId).toBe('query-test-uuid-789');
  });

  it('should extract workspaceId from request body', async () => {
    // Arrange
    mockRequest = {
      body: { workspaceId: 'body-test-uuid-012' }
    };

    // Mock WorkspaceContextDTO.fromRequest
    const mockDto = { workspaceId: 'body-test-uuid-012', isValid: jest.fn().mockReturnValue(true) };
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(mockDto);

    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.workspaceContext).toBe(mockDto);
    expect(mockRequest.workspaceContext?.workspaceId).toBe('body-test-uuid-012');
  });

  it('should extract workspaceId from x-workspace-id header', async () => {
    // Arrange
    const workspaceId = 'header-test-uuid-345';
    mockRequest = {
      headers: { 'x-workspace-id': workspaceId },
      header: jest.fn().mockImplementation((name) => {
        if (name.toLowerCase() === 'x-workspace-id') {
          return workspaceId;
        }
        return null;
      })
    };

    // Mock WorkspaceContextDTO.fromRequest
    const mockDto = { workspaceId: 'header-test-uuid-345', isValid: jest.fn().mockReturnValue(true) };
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(mockDto);

    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.workspaceContext).toBe(mockDto);
    expect(mockRequest.workspaceContext?.workspaceId).toBe(workspaceId);
  });

  it('should return 400 when no workspaceId is provided', async () => {
    // Arrange
    mockRequest = {};
    
    // Mock WorkspaceContextDTO.fromRequest to return null
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(null);

    logger.info('Before middleware call - null workspaceId');
    
    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    logger.info('After middleware call - null workspaceId');
    logger.info('Status called with:', (mockResponse.status as jest.Mock).mock.calls);
    logger.info('JSON called with:', (mockResponse.json as jest.Mock).mock.calls);
    
    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Invalid workspace ID format" });
  });

  it('should return 400 when workspaceId is invalid', async () => {
    // Arrange
    mockRequest = {
      params: { workspaceId: 'invalid-workspace-id' }
    };

    // Mock WorkspaceContextDTO with invalid workspaceId
    const mockDto = { workspaceId: 'invalid-workspace-id', isValid: jest.fn().mockReturnValue(false) };
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockReturnValue(mockDto);

    logger.info('Before middleware call - invalid workspaceId');
    
    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    logger.info('After middleware call - invalid workspaceId');
    logger.info('Status called with:', (mockResponse.status as jest.Mock).mock.calls);
    logger.info('JSON called with:', (mockResponse.json as jest.Mock).mock.calls);
    
    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Invalid workspace ID format" });
  });

  it('should properly handle error during validation', async () => {
    // Arrange
    mockRequest = {
      params: { workspaceId: 'test-workspace-id' }
    };

    // Mock WorkspaceContextDTO.fromRequest to throw an error
    (WorkspaceContextDTO.fromRequest as jest.Mock).mockImplementation(() => {
      throw new Error('Test validation error');
    });

    // Act
    await workspaceContextMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    
    // Assert
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
}); 