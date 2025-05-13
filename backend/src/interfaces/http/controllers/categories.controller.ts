import { Request, Response } from "express";
import { categoriesService } from "../../../services/categories.service";
import { AppError } from "../middlewares/error.middleware";

// Funzione di utilità per ottenere il workspaceId
const getWorkspaceId = (req: Request): string | undefined => {
  return req.params.workspaceId || req.query.workspaceId as string;
};

export class CategoriesController {
  async getCategoriesForWorkspace(req: Request, res: Response) {
    try {
      const workspaceId = getWorkspaceId(req);
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const categories = await categoriesService.getAllForWorkspace(workspaceId)

      return res.status(200).json(categories)
    } catch (error) {
      throw new AppError(500, "Failed to get categories")
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = getWorkspaceId(req);

      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const category = await categoriesService.getById(id, workspaceId)

      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      return res.status(200).json(category)
    } catch (error) {
      throw new AppError(500, "Failed to get category")
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const workspaceId = getWorkspaceId(req);
      const { name, description, isActive } = req.body

      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const result = await categoriesService.create({
        name,
        description,
        workspaceId,
        isActive
      })

      return res.status(201).json(result)
    } catch (error) {
      if (error.message === 'A category with this name already exists') {
        return res.status(409).json({ message: error.message })
      }
      throw new AppError(500, "Failed to create category")
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspaceId = getWorkspaceId(req);
      const { name, description, isActive } = req.body
      
      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const result = await categoriesService.update(id, workspaceId, {
        name,
        description,
        isActive
      })

      if (!result) {
        return res.status(404).json({ message: "Category not found" })
      }

      return res.status(200).json(result)
    } catch (error) {
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
      const { id } = req.params;
      const workspaceId = getWorkspaceId(req);

      if (!workspaceId) {
        return res.status(400).json({ 
          message: 'WorkspaceId is required',
          error: 'Missing workspaceId parameter' 
        });
      }

      const category = await categoriesService.getById(id, workspaceId)

      if (!category) {
        return res.status(404).json({ message: "Category not found" })
      }

      try {
        await categoriesService.delete(id, workspaceId)
        return res.status(204).send()
      } catch (error) {
        if (error.message === 'Cannot delete category that is used by products') {
          return res.status(409).json({ message: error.message })
        }
        throw error
      }
    } catch (error) {
      throw new AppError(500, "Failed to delete category")
    }
  }
} 