import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { login } from '../../../controllers/auth.controller';

// Mock di bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn()
}));

// Mock di jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-token')
}));

// Mock di prisma
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUser: any;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Save original console.error
    originalConsoleError = console.error;
    
    // Reset dei mock prima di ogni test
    jest.clearAllMocks();

    // Mock per request e response
    mockRequest = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };

    // Usiamo @ts-ignore per evitare errori di tipizzazione
    mockResponse = {
      // @ts-ignore: Mock function type
      status: jest.fn().mockReturnThis(),
      // @ts-ignore: Mock function type
      json: jest.fn(),
      // @ts-ignore: Mock function type
      cookie: jest.fn()
    };

    // Mock user data
    mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'hashed-password',
      role: 'ADMIN',
      workspaces: [
        {
          role: 'OWNER',
          workspace: {
            id: 'workspace-id',
            name: 'Test Workspace'
          }
        }
      ]
    };
  });

  afterEach(() => {
    // Restore original console.error after each test
    console.error = originalConsoleError;
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      mockRequest.body = {};

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Email and password are required'
        })
      );
    });

    it('should return 401 if user is not found', async () => {
      require('../../../lib/prisma').prisma.user.findUnique.mockResolvedValueOnce(null);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid credentials'
        })
      );
    });

    it('should return 401 if password is invalid', async () => {
      require('../../../lib/prisma').prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      // @ts-ignore: Mock return type
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid credentials'
        })
      );
    });

    it('should return user data and set cookie if credentials are valid', async () => {
      require('../../../lib/prisma').prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      // @ts-ignore: Mock return type
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      await login(mockRequest as Request, mockResponse as Response);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }),
        expect.any(String),
        expect.objectContaining({
          expiresIn: '24h'
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'auth_token',
        'mocked-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: expect.any(Number)
        })
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          workspaces: expect.arrayContaining([
            expect.objectContaining({
              id: 'workspace-id',
              name: 'Test Workspace',
              role: 'OWNER'
            })
          ])
        })
      });
    });

    it('should return 500 if an error occurs', async () => {
      // Temporarily replace console.error with a no-op function for this test
      console.error = jest.fn();
      
      require('../../../lib/prisma').prisma.user.findUnique.mockRejectedValueOnce(new Error('Test error'));

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error'
        })
      );
      
      // Verify that console.error was called with expected arguments
      expect(console.error).toHaveBeenCalledWith('Login error:', expect.any(Error));
    });
  });
}); 