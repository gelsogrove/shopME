import { Request, Response } from "express";
import { supplierService } from "../../../services/supplier.service";
import { AppError } from "../middlewares/error.middleware";

export class SuppliersController {
  async getSuppliersForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      console.log("=== Suppliers Request ===");
      console.log("WorkspaceId:", workspaceId);
      console.log("Headers:", req.headers);
      console.log("User:", req.user);
      console.log("======================");

      const suppliers = await supplierService.getAllForWorkspace(workspaceId);
      console.log("=== Suppliers Response ===");
      console.log("Suppliers found:", suppliers);
      console.log("======================");

      return res.status(200).json(suppliers);
    } catch (error) {
      console.error("=== Suppliers Error ===");
      console.error("Error getting suppliers:", error);
      console.error("======================");
      throw new AppError(500, "Failed to get suppliers");
    }
  }

  async getActiveSuppliersForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;

      const suppliers = await supplierService.getActiveForWorkspace(workspaceId);

      return res.status(200).json(suppliers);
    } catch (error) {
      console.error("Error getting active suppliers:", error);
      throw new AppError(500, "Failed to get active suppliers");
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const { id, workspaceId } = req.params;

      const supplier = await supplierService.getById(id, workspaceId);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      return res.status(200).json(supplier);
    } catch (error) {
      console.error("Error getting supplier:", error);
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

      const result = await supplierService.create({
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
    } catch (error) {
      console.error("Error creating supplier:", error);
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
      
      const result = await supplierService.update(id, workspaceId, {
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
    } catch (error) {
      console.error("Error updating supplier:", error);
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

      const supplier = await supplierService.getById(id, workspaceId);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      try {
        await supplierService.delete(id, workspaceId);
        return res.status(204).send();
      } catch (error) {
        if (error.message === 'Cannot delete supplier that is used by products') {
          return res.status(409).json({ message: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw new AppError(500, "Failed to delete supplier");
    }
  }
} 