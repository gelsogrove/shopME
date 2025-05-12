import { Request, Response } from "express";
import { SupplierService } from "../../../application/services/supplier.service";
import logger from "../../../utils/logger";
import { AppError } from "../middlewares/error.middleware";

export class SuppliersController {
  private supplierService: SupplierService;
  
  constructor() {
    this.supplierService = new SupplierService();
  }

  async getSuppliersForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      logger.info(`Getting suppliers for workspace: ${workspaceId}`);
      
      const suppliers = await this.supplierService.getAllForWorkspace(workspaceId);
      
      return res.status(200).json(suppliers);
    } catch (error) {
      logger.error("Error getting suppliers:", error);
      throw new AppError(500, "Failed to get suppliers");
    }
  }

  async getActiveSuppliersForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;

      const suppliers = await this.supplierService.getActiveForWorkspace(workspaceId);

      return res.status(200).json(suppliers);
    } catch (error) {
      logger.error("Error getting active suppliers:", error);
      throw new AppError(500, "Failed to get active suppliers");
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params;

      const supplier = await this.supplierService.getById(id, workspaceId);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json(supplier);
    } catch (error) {
      logger.error("Error getting supplier:", error);
      throw new AppError(500, "Failed to get supplier");
    }
  }

  async createSupplier(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const { 
        name, 
        description, 
        address, 
        website, 
        phone, 
        email, 
        contactPerson, 
        notes, 
        isActive 
      } = req.body;

      const result = await this.supplierService.create({
        name,
        description,
        address,
        website,
        phone,
        email,
        contactPerson,
        notes,
        workspaceId,
        isActive
      });

      return res.status(201).json(result);
    } catch (error: any) {
      logger.error("Error creating supplier:", error);
      if (error.message === 'A supplier with this name already exists') {
        return res.status(409).json({ message: error.message });
      }
      throw new AppError(500, "Failed to create supplier");
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params;
      const { 
        name, 
        description, 
        address, 
        website, 
        phone, 
        email, 
        contactPerson, 
        notes, 
        isActive 
      } = req.body;
      
      const result = await this.supplierService.update(id, workspaceId, {
        name,
        description,
        address,
        website,
        phone,
        email,
        contactPerson,
        notes,
        isActive
      });

      if (!result) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Error updating supplier:", error);
      if (error.message === 'Supplier not found') {
        return res.status(404).json({ message: "Supplier not found" });
      }
      if (error.message === 'A supplier with this name already exists') {
        return res.status(409).json({ message: error.message });
      }
      throw new AppError(500, "Failed to update supplier");
    }
  }

  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params;

      try {
        await this.supplierService.delete(id, workspaceId);
        return res.status(204).send();
      } catch (error: any) {
        if (error.message === 'Supplier not found') {
          return res.status(404).json({ message: "Supplier not found" });
        }
        if (error.message === 'Cannot delete supplier that is used by products') {
          return res.status(409).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error deleting supplier:", error);
      throw new AppError(500, "Failed to delete supplier");
    }
  }
} 