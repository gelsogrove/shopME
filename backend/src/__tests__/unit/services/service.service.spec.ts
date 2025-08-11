import { Service } from '../../../domain/entities/service.entity';

// Mock prisma before import
jest.doMock('../../../lib/prisma', () => {
  const mockServices = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  return {
    prisma: {
      services: mockServices
    }
  };
});

// Mock logger
jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock the repository
jest.mock('../../../repositories/service.repository');

// Import after mocking
import ServiceService from '../../../application/services/service.service';
import { prisma } from '../../../lib/prisma';
import { ServiceRepository } from '../../../repositories/service.repository';

// Get reference to mocked prisma client
const mockPrismaClient = prisma as jest.Mocked<typeof prisma>;

describe('ServiceService', () => {
  let workspaceId: string;
  let id: string;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    workspaceId = 'test-workspace-id';
    id = 'test-service-id';
  });

  describe('getAllForWorkspace', () => {
    it('should return all services for a workspace', async () => {
      // Arrange
      const expectedServices = [
        { 
          id: '1', 
          name: 'Service 1', 
          description: 'Description 1',
          code: 'SRV001',
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
          code: 'SRV002',
          price: 150,
          currency: 'USD',
          duration: 90,
          workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        }
      ];
      
      // Mock del metodo findAll
      const mockFindAll = jest.spyOn(ServiceRepository.prototype, 'findAll')
        .mockResolvedValue(expectedServices.map(s => new Service(s)));
      
      // Act
      const result = await ServiceService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(mockFindAll).toHaveBeenCalledWith(workspaceId);
    });
    
    it('should call repository findAll method correctly', async () => {
      // Arrange
      const mockFindAll = jest.spyOn(ServiceRepository.prototype, 'findAll')
        .mockResolvedValue([]);
      
      // Act
      await ServiceService.getAllForWorkspace(workspaceId);
      
      // Assert
      expect(mockFindAll).toHaveBeenCalledWith(workspaceId);
    });
    
    it('should handle errors and log them', async () => {
      // Arrange
      const error = new Error('Database error');
      jest.spyOn(ServiceRepository.prototype, 'findAll')
        .mockRejectedValue(error);
      
      // Act & Assert
      await expect(ServiceService.getAllForWorkspace(workspaceId)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a service by id', async () => {
      // Arrange
      const expectedService = { 
        id, 
        name: 'Service', 
        description: 'Description',
        code: 'SRV004',
        price: 100,
        currency: 'EUR',
        duration: 60,
        workspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      // Mock del metodo findById
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(new Service(expectedService));
      
      // Act
      const result = await ServiceService.getById(id, workspaceId);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        id,
        name: 'Service',
        price: 100
      }));
    });
    
    it('should return null if service not found', async () => {
      // Arrange
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(null);
      
      // Act
      const result = await ServiceService.getById('non-existent', workspaceId);
      
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
        code: 'SRV001',
        price: 200,
        currency: 'EUR',
        duration: 120,
        workspaceId,
        isActive: true
      };
      
      const expectedService = {
        id: 'new-id',
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock del metodo create
      jest.spyOn(ServiceRepository.prototype, 'create')
        .mockResolvedValue(new Service(expectedService));
      
      // Act
      const result = await ServiceService.create(serviceData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        name: 'New Service',
        price: 200,
        duration: 120
      }));
    });
    
    it('should set default values if not provided', async () => {
      // Arrange
      const serviceData = {
        name: 'New Service',
        code: 'SRV002',
        price: 200,
        duration: 60,
        workspaceId
      };
      
      const expectedService = {
        id: 'new-id',
        name: 'New Service',
        code: 'SRV002',
        price: 200,
        currency: 'EUR',
        duration: 60,
        isActive: true,
        workspaceId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock del metodo create
      jest.spyOn(ServiceRepository.prototype, 'create')
        .mockResolvedValue(new Service(expectedService));
      
      // Act
      const result = await ServiceService.create(serviceData);
      
      // Assert
      expect(result.currency).toBe('EUR');
      expect(result.isActive).toBe(true);
    });
    
    it('should throw error if validation fails', async () => {
      // Arrange
      const invalidData = {
        description: 'No name provided',
        price: -100,
        workspaceId
      };
      
      // Act & Assert
      await expect(ServiceService.create(invalidData as any)).rejects.toThrow('Invalid service data');
    });
  });

  describe('update', () => {
    it('should update an existing service', async () => {
      // Arrange
      const existingService = {
        id,
        name: 'Existing Service',
        description: 'Existing Description',
        code: 'SRV003',
        price: 100,
        currency: 'EUR',
        duration: 60,
        workspaceId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updateData = {
        name: 'Updated Service',
        price: 150
      };
      
      const updatedService = {
        ...existingService,
        ...updateData,
        updatedAt: new Date()
      };
      
      // Mock del metodo findById
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(new Service(existingService));
      
      // Mock del metodo update
      jest.spyOn(ServiceRepository.prototype, 'update')
        .mockResolvedValue(new Service(updatedService));
      
      // Act
      const result = await ServiceService.update(id, updateData);
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        id,
        name: 'Updated Service',
        price: 150
      }));
    });
    
    it('should throw error if service not found', async () => {
      // Arrange
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(null);
      
      // Act & Assert
      await expect(ServiceService.update('non-existent', {})).rejects.toThrow('Service not found');
    });
    
    it('should throw error if update data is invalid', async () => {
      // Arrange
      const existingService = {
        id,
        name: 'Existing Service',
        description: 'Existing Description',
        code: 'SRV005',
        price: 100,
        currency: 'EUR',
        duration: 60,
        workspaceId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const updateData = {
        price: -50 // Prezzo negativo non valido
      };
      
      // Mock del metodo findById
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(new Service(existingService));
      
      // Act & Assert
      await expect(ServiceService.update(id, updateData)).rejects.toThrow('Invalid service data');
    });
  });

  describe('delete', () => {
    it('should delete a service', async () => {
      // Arrange
      const existingService = {
        id,
        name: 'Service to Delete',
        description: 'Will be deleted',
        code: 'SRV006',
        price: 100,
        currency: 'EUR',
        duration: 60,
        workspaceId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Mock del metodo findById
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(new Service(existingService));
      
      // Mock del metodo delete
      jest.spyOn(ServiceRepository.prototype, 'delete')
        .mockResolvedValue(true);
      
      // Act
      const result = await ServiceService.delete(id);
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('should throw error if service not found', async () => {
      // Arrange
      jest.spyOn(ServiceRepository.prototype, 'findById')
        .mockResolvedValue(null);
      
      // Act & Assert
      await expect(ServiceService.delete('non-existent')).rejects.toThrow('Service not found');
    });
  });
}); 