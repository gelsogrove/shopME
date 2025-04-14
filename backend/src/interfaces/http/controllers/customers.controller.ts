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
      const { name, email, phone, address } = req.body;
      
      const customer = await prisma.customers.create({
        data: {
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
        }
      });
      
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params;
      const { name, email, phone, address, isActive } = req.body;
      
      const customer = await prisma.customers.update({
        where: {
          id,
          workspaceId
        },
        data: {
          name,
          email,
          phone,
          address,
          isActive
        }
      });
      
      res.json(customer);
    } catch (error) {
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