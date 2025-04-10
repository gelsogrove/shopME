import { PrismaClient } from "@prisma/client"
import { slugify } from "../utils/slug"

const prisma = new PrismaClient()

type CreateCategoryParams = {
  name: string
  description: string
  workspaceId: string
  isActive?: boolean
}

type UpdateCategoryParams = {
  name?: string
  description?: string
  isActive?: boolean
}

class CategoriesService {
  async getAllForWorkspace(workspaceId: string) {
    return prisma.categories.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  async getById(id: string) {
    return prisma.categories.findUnique({
      where: {
        id,
      },
    })
  }

  async create(params: CreateCategoryParams) {
    const { name, description, workspaceId, isActive = true } = params

    // Generate a slug from the name
    const slug = slugify(name)

    // Check if the slug already exists in this workspace
    const existingCategory = await prisma.categories.findFirst({
      where: {
        slug,
        workspaceId
      },
    })

    if (existingCategory) {
      throw new Error('A category with this name already exists')
    }

    return prisma.categories.create({
      data: {
        name,
        description,
        slug,
        isActive,
        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      },
    })
  }

  async update(id: string, params: UpdateCategoryParams) {
    const { name, description, isActive } = params

    // Get the existing category
    const existingCategory = await this.getById(id)
    if (!existingCategory) {
      throw new Error('Category not found')
    }

    // Prepare update data
    const updateData: any = {}
    
    if (description !== undefined) {
      updateData.description = description
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    // If name is provided, update name and slug
    if (name !== undefined) {
      updateData.name = name
      // Generate a slug from the name
      const slug = slugify(name)
      
      // Check if the slug already exists and is not the current category
      // Also consider the workspace context
      const categoryWithSlug = await prisma.categories.findFirst({
        where: {
          slug,
          workspaceId: existingCategory.workspaceId,
          NOT: {
            id
          }
        },
      })
      
      if (categoryWithSlug) {
        throw new Error('A category with this name already exists')
      }
      
      updateData.slug = slug
    }

    return prisma.categories.update({
      where: {
        id,
      },
      data: updateData,
    })
  }

  async delete(id: string) {
    // Check if the category exists
    const category = await this.getById(id)
    if (!category) {
      throw new Error('Category not found')
    }

    // Check if category is used by any products
    const products = await prisma.products.findMany({
      where: {
        categoryId: id,
      },
    })

    if (products.length > 0) {
      throw new Error('Cannot delete category that is used by products')
    }

    return prisma.categories.delete({
      where: {
        id,
      },
    })
  }
}

export const categoriesService = new CategoriesService() 