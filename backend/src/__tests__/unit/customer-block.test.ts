// @ts-nocheck - Jest types not configured in TypeScript, needs @types/jest setup
import { CustomerService } from '../../application/services/customer.service';
import { CustomerRepository } from '../../repositories/customer.repository';

// Mock del repository
jest.mock('../../repositories/customer.repository');

describe('Customer Block Tests', () => {
  const workspaceId = 'cm9hjgq9v00014qk8fsdy4ujv';
  const customerId = '3d1201d4-c78b-4007-9c5c-39081185188e';
  
  let customerService: CustomerService;
  let mockedCustomerRepository: jest.Mocked<CustomerRepository>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mocks
    mockedCustomerRepository = new CustomerRepository() as jest.Mocked<CustomerRepository>;
    mockedCustomerRepository.findById = jest.fn().mockResolvedValue({
      id: customerId,
      name: 'Test Customer',
      isBlocked: false
    });
    mockedCustomerRepository.update = jest.fn().mockResolvedValue({ 
      id: customerId, 
      isBlocked: true 
    });
    mockedCustomerRepository.blockCustomer = jest.fn().mockResolvedValue({ 
      id: customerId, 
      isBlocked: true 
    });
    
    // Inject mocked repository
    customerService = new CustomerService();
    (customerService as any).customerRepository = mockedCustomerRepository;
  });
  
  it('should block a customer successfully', async () => {
    const result = await customerService.blockCustomer(customerId, workspaceId);
    
    expect(result).toBeDefined();
    expect(result.id).toBe(customerId);
    expect(result.isBlocked).toBe(true);
    
    expect(mockedCustomerRepository.update).toHaveBeenCalledWith(customerId, workspaceId, { isBlacklisted: true });
    expect(mockedCustomerRepository.update).toHaveBeenCalledTimes(1);
  });
}); 