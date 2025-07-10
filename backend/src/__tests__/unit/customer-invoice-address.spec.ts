import { Customer, CustomerProps, InvoiceAddress } from '../../domain/entities/customer.entity';

describe('Customer Invoice Address Entity', () => {
  const mockCustomerProps: CustomerProps = {
    name: 'Mario Rossi',
    email: 'mario.rossi@test.com',
    phone: '+39123456789',
    address: 'Via Roma 123, Milano',
    company: 'Test Company SRL',
    language: 'IT',
    currency: 'EUR',
    workspaceId: 'workspace-123',
    isActive: true,
    activeChatbot: true,
  };

  describe('Constructor with Invoice Address', () => {
    it('should create customer with invoice address', () => {
      const invoiceAddress: InvoiceAddress = {
        firstName: 'Mario',
        lastName: 'Rossi',
        company: 'Test Company SRL',
        address: 'Via Fatturazione 456',
        city: 'Milano',
        postalCode: '20121',
        country: 'Italia',
        vatNumber: 'IT12345678901',
        phone: '+39 02 9876543'
      };

      const customerWithInvoice = new Customer({
        ...mockCustomerProps,
        invoiceAddress
      });

      expect(customerWithInvoice.invoiceAddress).toEqual(invoiceAddress);
      expect(customerWithInvoice.invoiceAddress?.firstName).toBe('Mario');
      expect(customerWithInvoice.invoiceAddress?.vatNumber).toBe('IT12345678901');
    });

    it('should create customer without invoice address', () => {
      const customerWithoutInvoice = new Customer(mockCustomerProps);

      expect(customerWithoutInvoice.invoiceAddress).toBeUndefined();
    });

    it('should handle partial invoice address', () => {
      const partialInvoiceAddress: InvoiceAddress = {
        firstName: 'Mario',
        lastName: 'Rossi',
        city: 'Milano',
        country: 'Italia'
      };

      const customer = new Customer({
        ...mockCustomerProps,
        invoiceAddress: partialInvoiceAddress
      });

      expect(customer.invoiceAddress?.firstName).toBe('Mario');
      expect(customer.invoiceAddress?.address).toBeUndefined();
      expect(customer.invoiceAddress?.vatNumber).toBeUndefined();
    });
  });

  describe('Invoice Address Validation', () => {
    it('should handle empty invoice address object', () => {
      const emptyInvoiceAddress: InvoiceAddress = {};

      const customer = new Customer({
        ...mockCustomerProps,
        invoiceAddress: emptyInvoiceAddress
      });

      expect(customer.invoiceAddress).toEqual({});
    });

    it('should preserve all invoice address fields', () => {
      const fullInvoiceAddress: InvoiceAddress = {
        firstName: 'Mario',
        lastName: 'Rossi',
        company: 'Test Company SRL',
        address: 'Via Fatturazione 456',
        city: 'Milano',
        postalCode: '20121',
        country: 'Italia',
        vatNumber: 'IT12345678901',
        phone: '+39 02 9876543'
      };

      const customer = new Customer({
        ...mockCustomerProps,
        invoiceAddress: fullInvoiceAddress
      });

      // Verify all fields are preserved
      expect(customer.invoiceAddress).toEqual(fullInvoiceAddress);
      expect(Object.keys(customer.invoiceAddress!)).toHaveLength(9);
    });
  });
}); 