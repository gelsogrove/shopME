import "@jest/globals";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CustomerService } from "../../../application/services/customer.service";
import { Customer } from "../../../domain/entities/customer.entity";
import { CustomerRepository } from "../../../repositories/customer.repository";

// Mock dependencies
jest.mock("../../../repositories/customer.repository");
jest.mock("../../../utils/logger");

describe("CustomerService", () => {
  let customerService: CustomerService;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of the service before each test
    customerService = new CustomerService();

    // Get the mocked repository instance that was created in the service constructor
    mockCustomerRepository = (
      CustomerRepository as jest.MockedClass<typeof CustomerRepository>
    ).mock.instances[0] as jest.Mocked<CustomerRepository>;
  });

  describe("delete", () => {
    const customerId = "test-customer-id";
    const workspaceId = "test-workspace-id";
    const mockCustomer = {
      id: customerId,
      name: "Test Customer",
      email: "test@example.com",
      workspaceId: workspaceId,
      isActive: true,
      validate: () => true
    } as Customer;

    it("should delete a customer and all related records including chat sessions", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockCustomerRepository.hasRelatedRecords.mockResolvedValue(true);
      mockCustomerRepository.deleteRelatedRecords.mockResolvedValue();
      mockCustomerRepository.hardDelete.mockResolvedValue(true);

      // Execute the delete operation
      const result = await customerService.delete(customerId, workspaceId);

      // Verify the customer was found
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(
        customerId,
        workspaceId
      );

      // Verify related records were checked
      expect(mockCustomerRepository.hasRelatedRecords).toHaveBeenCalledWith(
        customerId
      );

      // Verify related records were deleted
      expect(mockCustomerRepository.deleteRelatedRecords).toHaveBeenCalledWith(
        customerId
      );

      // Verify the customer was hard deleted
      expect(mockCustomerRepository.hardDelete).toHaveBeenCalledWith(
        customerId,
        workspaceId
      );

      // Verify the result
      expect(result).toBe(true);
    });

    it("should delete a customer without related records", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockCustomerRepository.hasRelatedRecords.mockResolvedValue(false);
      mockCustomerRepository.hardDelete.mockResolvedValue(true);

      // Execute the delete operation
      const result = await customerService.delete(customerId, workspaceId);

      // Verify the customer was found
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(
        customerId,
        workspaceId
      );

      // Verify related records were checked
      expect(mockCustomerRepository.hasRelatedRecords).toHaveBeenCalledWith(
        customerId
      );

      // Verify related records were NOT deleted
      expect(mockCustomerRepository.deleteRelatedRecords).not.toHaveBeenCalled();

      // Verify the customer was hard deleted
      expect(mockCustomerRepository.hardDelete).toHaveBeenCalledWith(
        customerId,
        workspaceId
      );

      // Verify the result
      expect(result).toBe(true);
    });

    it("should throw an error if customer not found", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(null);

      // Execute & verify
      await expect(customerService.delete(customerId, workspaceId)).rejects.toThrow(
        "Customer not found"
      );

      // Verify we don't proceed with deletion
      expect(mockCustomerRepository.hasRelatedRecords).not.toHaveBeenCalled();
      expect(mockCustomerRepository.deleteRelatedRecords).not.toHaveBeenCalled();
      expect(mockCustomerRepository.hardDelete).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const customerId = "test-customer-id";
    const workspaceId = "test-workspace-id";
    const mockCustomer = {
      id: customerId,
      name: "Test Customer",
      email: "test@example.com",
      phone: "1234567890",
      workspaceId: workspaceId,
      isActive: true,
      validate: () => true
    } as Customer;

    it("should update a customer with valid data", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      mockCustomerRepository.findByPhone.mockResolvedValue(null);
      
      const updatedCustomer = {
        ...mockCustomer,
        name: "Updated Customer",
        phone: "0987654321"
      };
      mockCustomerRepository.update.mockResolvedValue(updatedCustomer as Customer);

      const updateData = {
        name: "Updated Customer",
        phone: "0987654321"
      };

      // Execute the update operation
      const result = await customerService.update(customerId, workspaceId, updateData);

      // Verify the customer was found
      expect(mockCustomerRepository.findById).toHaveBeenCalledWith(
        customerId,
        workspaceId
      );

      // Verify the phone uniqueness was checked
      expect(mockCustomerRepository.findByPhone).toHaveBeenCalledWith(
        updateData.phone,
        workspaceId
      );

      // Verify the customer was updated
      expect(mockCustomerRepository.update).toHaveBeenCalledWith(
        customerId,
        workspaceId,
        updateData
      );

      // Verify the result
      expect(result).toEqual(updatedCustomer);
    });

    it("should throw an error if customer not found", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(null);

      const updateData = {
        name: "Updated Customer"
      };

      // Execute & verify
      await expect(customerService.update(customerId, workspaceId, updateData)).rejects.toThrow(
        "Customer not found"
      );

      // Verify we don't proceed with update
      expect(mockCustomerRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error if email is already in use by another customer", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      
      const anotherCustomer = {
        id: "another-customer-id",
        email: "new@example.com"
      };
      mockCustomerRepository.findByEmail.mockResolvedValue(anotherCustomer as Customer);

      const updateData = {
        email: "new@example.com"
      };

      // Execute & verify
      await expect(customerService.update(customerId, workspaceId, updateData)).rejects.toThrow(
        "Email is already in use by another customer"
      );

      // Verify we don't proceed with update
      expect(mockCustomerRepository.update).not.toHaveBeenCalled();
    });

    it("should throw an error if phone is already in use by another customer", async () => {
      // Setup mocks
      mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
      mockCustomerRepository.findByEmail.mockResolvedValue(null);
      
      const anotherCustomer = {
        id: "another-customer-id",
        phone: "9999999999"
      };
      mockCustomerRepository.findByPhone.mockResolvedValue(anotherCustomer as Customer);

      const updateData = {
        phone: "9999999999"
      };

      // Execute & verify
      await expect(customerService.update(customerId, workspaceId, updateData)).rejects.toThrow(
        "Phone number is already in use by another customer"
      );

      // Verify we don't proceed with update
      expect(mockCustomerRepository.update).not.toHaveBeenCalled();
    });
  });
}); 