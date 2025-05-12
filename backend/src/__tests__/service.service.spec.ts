import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { ServiceService } from '../application/services/service.service';

// Mock Prisma Client
jest.mock('../lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

import { prisma } from '../lib/prisma';
const mockPrisma = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('ServiceService', () => {
  let serviceService: ServiceService;
  
  beforeEach(() => {
    mockReset(mockPrisma);
    serviceService = new ServiceService();
  });

  describe('getAllForWorkspace', () => {
    it('should return all services for a workspace', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const expectedServices = [
        { 
          id: '1', 
          name: 'Service 1', 
          description: 'Description 1',
          price: 100,
          currency: 'EUR',
          duration: 60,
          workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        },
        { 
          id: '2', 
          name: 'Service 2', 
          description: 'Description 2',
          price: 150,
          currency: 'USD',
          duration: 90,
          workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      ];
      
      mockPrisma.services.findMany.mockResolvedValue(expectedServices as any);
      
      // Act
      const result = await serviceService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(mockPrisma.services.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId }
        })
      );
    });
    
    it('should filter services by active status', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const activeStatus = true;
      
      mockPrisma.services.findMany.mockResolvedValue([]);
      
      // Act
      await serviceService.getAllForWorkspace(workspaceId, activeStatus);
      
      // Assert
      expect(mockPrisma.services.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { 
            workspaceId,
            isActive: activeStatus
          }
        })
      );
    });
    
    it('should handle errors and log them', async () => {
      // Arrange
      const workspaceId = 'test-workspace-id';
      const error = new Error('Database error');
      mockPrisma.services.findMany.mockRejectedValue(error);
      
      // Act & Assert
      await expect(serviceService.getAllForWorkspace(workspaceId)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a service by id', async () => {
      // Arrange
      const id = 'service-id';
      const expectedService = { 
        id, 
        name: 'Service', 
        description: 'Description',
        price: 100,
        currency: 'EUR',
        duration: 60,
        workspaceId: 'test-workspace-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      mockPrisma.services.findUnique.mockResolvedValue(expectedService as any);
      
      // Act
      const result = await serviceService.getById(id);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        id,
        name: 'Service',
        price: 100
      }));
      expect(mockPrisma.services.findUnique).toHaveBeenCalledWith({
        where: { id }
      });
    });
    
    it('should return null if service not found', async () => {
      // Arrange
      mockPrisma.services.findUnique.mockResolvedValue(null);
      
      // Act
      const result = await serviceService.getById('non-existent');
      
      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      // Arrange
      const serviceData = {
        name: 'New Service',
        description: 'New Description',
        price: 200,
        currency: 'EUR',
        duration: 120,
        workspaceId: 'test-workspace-id',
        isActive: true
      };
      
      const expectedService = {
        id: 'new-id',
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.services.create.mockResolvedValue(expectedService as any);
      
      // Act
      const result = await serviceService.create(serviceData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'New Service',
        price: 200,
        duration: 120
      }));
      expect(mockPrisma.services.create).toHaveBeenCalled();
    });
    
    it('should set default values if not provided', async () => {
      // Arrange
      const serviceData = {
        name: 'New Service',
        price: 200,
        duration: 60,
        workspaceId: 'test-workspace-id'
      };
      
      const expectedService = {
        id: 'new-id',
        name: 'New Service',
        price: 200,
        currency: 'EUR',
        duration: 60,
        isActive: true,
        workspaceId: 'test-workspace-id',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.services.create.mockResolvedValue(expectedService as any);
      
      // Act
      const result = await serviceService.create(serviceData);
      
      // Assert
      expect(result.currency).toBe('EUR');
      expect(result.isActive).toBe(true);
    });
    
    it('should throw error if validation fails', async () => {
      // Arrange
      const invalidData = {
        description: 'No name provided',
        price: -100,
        workspaceId: 'test-workspace-id'
      };
      
      // Act & Assert
      await expect(serviceService.create(invalidData as any)).rejects.toThrow('Invalid service data');
    });
  });

  describe('update', () => {
    it('should update an existing service', async () => {
      // Arrange
      const id = 'service-id';
      const updateData = {
        name: 'Updated Service',
        price: 250
      };
      
      const existingService = {
        id,
        name: 'Original Service',
        description: 'Original Description',
        price: 200,
        currency: 'EUR',
        duration: 60,
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updatedService = {
        ...existingService,
        name: updateData.name,
        price: updateData.price
      };
      
      mockPrisma.services.findUnique.mockResolvedValue(existingService as any);
      mockPrisma.services.update.mockResolvedValue(updatedService as any);
      
      // Act
      const result = await serviceService.update(id, updateData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'Updated Service',
        price: 250
      }));
      expect(mockPrisma.services.update).toHaveBeenCalledWith({
        where: { id },
        data: updateData
      });
    });
    
    it('should throw error if service not found', async () => {
      // Arrange
      mockPrisma.services.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(serviceService.update('non-existent', {})).rejects.toThrow('Service not found');
    });
    
    it('should throw error if update data is invalid', async () => {
      // Arrange
      const id = 'service-id';
      const updateData = {
        price: -50
      };
      
      const existingService = {
        id,
        name: 'Original Service',
        description: 'Original Description',
        price: 200,
        currency: 'EUR',
        duration: 60,
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.services.findUnique.mockResolvedValue(existingService as any);
      
      // Act & Assert
      await expect(serviceService.update(id, updateData)).rejects.toThrow('Invalid service data');
    });
  });

  describe('delete', () => {
    it('should delete a service', async () => {
      // Arrange
      const id = 'service-id';
      
      const service = {
        id,
        name: 'Service to Delete',
        description: 'To be deleted',
        price: 200,
        currency: 'EUR',
        duration: 60,
        workspaceId: 'test-workspace-id',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPrisma.services.findUnique.mockResolvedValue(service as any);
      mockPrisma.services.delete.mockResolvedValue({} as any);
      
      // Act
      const result = await serviceService.delete(id);
      
      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.services.delete).toHaveBeenCalledWith({
        where: { id }
      });
    });
    
    it('should throw error if service not found', async () => {
      // Arrange
      mockPrisma.services.findUnique.mockResolvedValue(null);
      
      // Act & Assert
      await expect(serviceService.delete('non-existent')).rejects.toThrow('Service not found');
    });
  });
}); 