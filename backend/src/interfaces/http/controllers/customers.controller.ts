import { NextFunction, Request, Response } from "express";
import { CustomerService } from "../../../application/services/customer.service";
import logger from "../../../utils/logger";

export class CustomersController {
  private customerService: CustomerService;
  
  constructor() {
    this.customerService = new CustomerService();
  }

  async getCustomersForWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const customers = await this.customerService.getActiveForWorkspace(workspaceId);
      
      res.json(customers);
    } catch (error) {
      logger.error("Error getting customers:", error);
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      
      const customer = await this.customerService.getById(id, workspaceId);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      const id = req.params.id;
      logger.error(`Error getting customer ${id}:`, error);
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      const { 
        name, 
        email, 
        phone, 
        address, 
        company, 
        discount, 
        language, 
        notes, 
        serviceIds,
        last_privacy_version_accepted,
        push_notifications_consent
      } = req.body;
      
      const customerData = {
        name,
        email,
        phone,
        address,
        company,
        discount,
        language,
        notes,
        serviceIds,
        workspaceId,
        last_privacy_version_accepted,
        push_notifications_consent: push_notifications_consent || false,
        push_notifications_consent_at: push_notifications_consent ? new Date() : undefined,
        privacy_accepted_at: last_privacy_version_accepted ? new Date() : undefined
      };
      
      const customer = await this.customerService.create(customerData);
      
      res.status(201).json(customer);
    } catch (error: any) {
      logger.error("Error creating customer:", error);
      if (error.message === 'A customer with this email already exists' || 
          error.message === 'A customer with this phone number already exists' ||
          error.message === 'Invalid customer data') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      const { 
        name, 
        email, 
        phone, 
        address, 
        isActive, 
        company, 
        discount, 
        language, 
        notes, 
        serviceIds,
        last_privacy_version_accepted,
        push_notifications_consent,
        activeChatbot
      } = req.body;
      
      // Prepare update data with only defined values
      const customerData: any = {};
      
      if (name !== undefined) customerData.name = name;
      if (email !== undefined) customerData.email = email;
      if (phone !== undefined) customerData.phone = phone;
      if (address !== undefined) customerData.address = address;
      if (isActive !== undefined) customerData.isActive = isActive;
      if (company !== undefined) customerData.company = company;
      if (discount !== undefined) customerData.discount = discount;
      if (language !== undefined) customerData.language = language;
      if (notes !== undefined) customerData.notes = notes;
      if (serviceIds !== undefined) customerData.serviceIds = serviceIds;
      if (last_privacy_version_accepted !== undefined) {
        customerData.last_privacy_version_accepted = last_privacy_version_accepted;
        customerData.privacy_accepted_at = new Date();
      }
      if (push_notifications_consent !== undefined) {
        customerData.push_notifications_consent = push_notifications_consent;
        if (push_notifications_consent) {
          customerData.push_notifications_consent_at = new Date();
        }
      }
      if (activeChatbot !== undefined) customerData.activeChatbot = activeChatbot;
      
      logger.info('Updating customer with data:', { id, workspaceId, ...customerData });
      
      try {
        const customer = await this.customerService.update(id, workspaceId, customerData);
        res.json(customer);
      } catch (error: any) {
        if (error.message === 'Customer not found') {
          return res.status(404).json({ message: 'Customer not found' });
        }
        if (error.message === 'Email is already in use by another customer' ||
            error.message === 'Phone number is already in use by another customer' ||
            error.message === 'Invalid customer data') {
          return res.status(400).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error updating customer:', error);
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      
      logger.info('Starting customer deletion process:', { id, workspaceId });

      try {
        const success = await this.customerService.delete(id, workspaceId);
        
        if (!success) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        
        logger.info('Customer deletion completed successfully');
        return res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Customer not found') {
          return res.status(404).json({ message: 'Customer not found' });
        }
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting customer:', error);
      // Send a more detailed error response
      res.status(500).json({
        message: 'Failed to delete customer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Count all "Unknown Customer" records in a workspace
   */
  async countUnknownCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const count = await this.customerService.countUnknownCustomers(workspaceId);
      
      res.json({ count });
    } catch (error) {
      logger.error('Error counting unknown customers:', error);
      next(error);
    }
  }
}