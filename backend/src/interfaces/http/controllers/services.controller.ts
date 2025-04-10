import { Request, Response } from "express";
import { servicesService } from "../../../services/services.service";
import { AppError } from "../middlewares/error.middleware";

export class ServicesController {
  async getServicesForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params
      console.log("Getting services for workspace:", workspaceId);

      const services = await servicesService.getAllForWorkspace(workspaceId)
      console.log("Services found:", services);

      return res.status(200).json(services)
    } catch (error) {
      console.error("Error getting services:", error)
      throw new AppError(500, "Failed to get services")
    }
  }

  async getServiceById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const service = await servicesService.getById(id)

      if (!service || (service as any[]).length === 0) {
        return res.status(404).json({ message: "Service not found" })
      }

      return res.status(200).json((service as any[])[0])
    } catch (error) {
      console.error("Error getting service:", error)
      throw new AppError(500, "Failed to get service")
    }
  }

  async createService(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params
      const { name, description, price, currency, isActive } = req.body

      const result = await servicesService.create({
        name,
        description,
        price: parseFloat(price),
        workspaceId,
        currency,
        isActive
      })

      return res.status(201).json((result as any[])[0])
    } catch (error) {
      console.error("Error creating service:", error)
      throw new AppError(500, "Failed to create service")
    }
  }

  async updateService(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, description, price, currency, isActive } = req.body

      const priceValue = price !== undefined ? parseFloat(price) : undefined
      
      const result = await servicesService.update(id, {
        name,
        description,
        price: priceValue,
        currency,
        isActive
      })

      return res.status(200).json((result as any[])[0])
    } catch (error) {
      console.error("Error updating service:", error)
      if (error.message === "Service not found") {
        return res.status(404).json({ message: "Service not found" })
      }
      throw new AppError(500, "Failed to update service")
    }
  }

  async deleteService(req: Request, res: Response) {
    try {
      const { id } = req.params

      const service = await servicesService.getById(id)

      if (!service || (service as any[]).length === 0) {
        return res.status(404).json({ message: "Service not found" })
      }

      await servicesService.delete(id)

      return res.status(204).send()
    } catch (error) {
      console.error("Error deleting service:", error)
      throw new AppError(500, "Failed to delete service")
    }
  }
} 