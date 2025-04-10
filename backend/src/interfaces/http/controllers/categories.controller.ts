import { Request, Response } from "express";
import { categoriesService } from "../../../services/categories.service";
import { AppError } from "../middlewares/error.middleware";

export class CategoriesController {
  async getCategoriesForWorkspace(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params
      console.log("Getting categories for workspace:", workspaceId);

      const categories = await categoriesService.getAllForWorkspace(workspaceId)
      console.log("Categories found:", categories);

      return res.status(200).json(categories)
    } catch (error) {
      console.error("Error getting categories:", error)
      throw new AppError(500, "Failed to get categories")
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params

      const category = await categoriesService.getById(id)

      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      return res.status(200).json(category)
    } catch (error) {
      console.error("Error getting category:", error)
      throw new AppError(500, "Failed to get category")
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params
      const { name, description, isActive } = req.body

      const result = await categoriesService.create({
        name,
        description,
        workspaceId,
        isActive
      })

      return res.status(201).json(result)
    } catch (error) {
      console.error("Error creating category:", error)
      if (error.message === 'A category with this name already exists') {
        return res.status(409).json({ message: error.message })
      }
      throw new AppError(500, "Failed to create category")
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { name, description, isActive } = req.body
      
      const result = await categoriesService.update(id, {
        name,
        description,
        isActive
      })

      return res.status(200).json(result)
    } catch (error) {
      console.error("Error updating category:", error)
      if (error.message === 'Category not found') {
        return res.status(404).json({ message: "Category not found" })
      }
      if (error.message === 'A category with this name already exists') {
        return res.status(409).json({ message: error.message })
      }
      throw new AppError(500, "Failed to update category")
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params

      const category = await categoriesService.getById(id)

      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      try {
        await categoriesService.delete(id)
        return res.status(204).send()
      } catch (error) {
        if (error.message === 'Cannot delete category that is used by products') {
          return res.status(409).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      throw new AppError(500, "Failed to delete category")
    }
  }
} 