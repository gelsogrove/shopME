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
    mockedCustomerRepository.blockCustomer = jest.fn().mockResolvedValue({ 
      id: customerId, 
      isBlocked: true 
    });
    
    // Inject mocked repository
    customerService = new CustomerService();
    (customerService as any).customerRepository = mockedCustomerRepository;
  });
  
  it('should block a customer successfully', async () => {
    const result = await customerService.blockCustomer(workspaceId, customerId);
    
    expect(result).toBeDefined();
    expect(result.id).toBe(customerId);
    expect(result.isBlocked).toBe(true);
    
    expect(mockedCustomerRepository.blockCustomer).toHaveBeenCalledWith(workspaceId, customerId);
    expect(mockedCustomerRepository.blockCustomer).toHaveBeenCalledTimes(1);
  });
}); 