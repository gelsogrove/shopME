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
      const { name, email, phone, address, company, discount, language, notes, serviceIds } = req.body;
      
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
      const { name, email, phone, address, isActive, company, discount, language, notes, serviceIds } = req.body;
      
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
      
      await prisma.customers.update({
        where: {
          id,
          workspaceId
        },
        data: {
          isActive: false
        }
      });
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 