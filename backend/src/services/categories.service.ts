import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

// Funzione interna per generare uno slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    // Execute query
    const categories = await prisma.categories.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return categories;
  }

  async getById(id: string, workspaceId: string) {
    return prisma.categories.findFirst({
      where: {
        id,
        workspaceId
      }
    });
  }

  async create(params: CreateCategoryParams) {
    const { name, description, workspaceId, isActive = true } = params

    // Generate a slug from the name
    const slug = generateSlug(name)

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
        workspaceId
      },
    })
  }

  async update(id: string, workspaceId: string, params: UpdateCategoryParams) {
    const { name, description, isActive } = params

    // Get the existing category
    const existingCategory = await this.getById(id, workspaceId)
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
      const slug = generateSlug(name)
      
      // Check if the slug already exists and is not the current category
      // Also consider the workspace context
      const categoryWithSlug = await prisma.categories.findFirst({
        where: {
          slug,
          workspaceId,
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

    return prisma.categories.updateMany({
      where: {
        id,
        workspaceId
      },
      data: updateData,
    }).then(() => this.getById(id, workspaceId))
  }

  async delete(id: string, workspaceId: string) {
    // Check if the category exists
    const category = await this.getById(id, workspaceId)
    if (!category) {
      throw new Error('Category not found')
    }

    // Check if category is used by any products
    const products = await prisma.products.findMany({
      where: {
        categoryId: id,
        workspaceId
      },
    })

    if (products.length > 0) {
      throw new Error('Cannot delete category that is used by products')
    }

    return prisma.categories.deleteMany({
      where: {
        id,
        workspaceId
      },
    })
  }
}

export const categoriesService = new CategoriesService() 