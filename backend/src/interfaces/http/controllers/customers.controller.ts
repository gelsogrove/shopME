import { NextFunction, Request, Response } from "express";
import { prisma } from "../../../lib/prisma";

export class CustomersController {
  async getCustomersForWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      
      const customers = await prisma.customers.findMany({
        where: {
          workspaceId,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(customers);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      
      const customer = await prisma.customers.findFirst({
        where: {
          id,
          workspaceId,
          isActive: true
        }
      });
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
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
      
      const customerData: any = {
        name,
        email,
        phone,
        address,
        isActive: true,
        workspace: {
          connect: {
            id: workspaceId
          }
        }
      };
      
      if (company !== undefined) customerData.company = company;
      if (discount !== undefined) customerData.discount = discount;
      if (language !== undefined) customerData.language = language;
      if (notes !== undefined) customerData.notes = notes;
      if (serviceIds !== undefined) customerData.serviceIds = serviceIds;
      if (last_privacy_version_accepted !== undefined) customerData.last_privacy_version_accepted = last_privacy_version_accepted;
      if (push_notifications_consent !== undefined) customerData.push_notifications_consent = push_notifications_consent;
      
      const customer = await prisma.customers.create({
        data: customerData
      });
      
      res.status(201).json(customer);
    } catch (error) {
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
        push_notifications_consent
      } = req.body;
      
      const customerData: any = {
        name,
        email,
        phone,
        address,
        isActive
      };
      
      if (company !== undefined) customerData.company = company;
      if (discount !== undefined) customerData.discount = discount;
      if (language !== undefined) customerData.language = language;
      if (notes !== undefined) customerData.notes = notes;
      if (serviceIds !== undefined) customerData.serviceIds = serviceIds;
      if (last_privacy_version_accepted !== undefined) customerData.last_privacy_version_accepted = last_privacy_version_accepted;
      if (push_notifications_consent !== undefined) customerData.push_notifications_consent = push_notifications_consent;
      
      console.log('Updating customer with data:', customerData);
      
      const customer = await prisma.customers.update({
        where: {
          id,
          workspaceId
        },
        data: customerData
      });
      
      res.json(customer);
    } catch (error) {
      console.error('Error updating customer:', error);
      next(error);
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      
      console.log('Starting customer deletion process:', { id, workspaceId });

      try {
        // First check if the customer exists
        const customer = await prisma.customers.findFirst({
          where: {
            id,
            workspaceId
          }
        });

        if (!customer) {
          console.log('Customer not found:', { id, workspaceId });
          return res.status(404).json({ message: 'Customer not found' });
        }

        console.log('Found customer:', customer);

        // Delete related records one by one with error handling
        try {
          console.log('Deleting messages...');
          await prisma.message.deleteMany({
            where: {
              chatSession: {
                customerId: id
              }
            }
          });
        } catch (error) {
          console.error('Error deleting messages:', error);
          throw error;
        }

        try {
          console.log('Deleting chat sessions...');
          await prisma.chatSession.deleteMany({
            where: {
              customerId: id
            }
          });
        } catch (error) {
          console.error('Error deleting chat sessions:', error);
          throw error;
        }

        try {
          console.log('Deleting orders...');
          await prisma.orders.deleteMany({
            where: {
              customerId: id
            }
          });
        } catch (error) {
          console.error('Error deleting orders:', error);
          throw error;
        }

        try {
          console.log('Finally deleting customer...');
          await prisma.customers.deleteMany({
            where: {
              id,
              workspaceId
            }
          });
        } catch (error) {
          console.error('Error deleting customer:', error);
          throw error;
        }

        console.log('Customer deletion completed successfully');
        res.status(204).send();
      } catch (error) {
        console.error('Error during deletion process:', error);
        throw error;
      }
    } catch (error) {
      console.error('Top level error in deleteCustomer:', error);
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
      
      const count = await prisma.customers.count({
        where: {
          workspaceId,
          isActive: true,
          name: 'Unknown Customer'
        }
      });
      
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
} 