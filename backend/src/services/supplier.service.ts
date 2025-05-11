import { prisma } from '../lib/prisma';

// Function to generate a slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type CreateSupplierParams = {
  name: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isActive?: boolean;
  workspaceId: string;
};

type UpdateSupplierParams = {
  name?: string;
  description?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isActive?: boolean;
};

class SupplierService {
  async getAllForWorkspace(workspaceId: string) {
    console.log("=== Suppliers Query ===");
    console.log("WorkspaceId:", workspaceId);
    
    try {
      // Execute query
      // @ts-ignore - Prisma types are not correctly generated
      const suppliers = await prisma.suppliers.findMany({
        where: {
          workspaceId,
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      console.log("Raw Database Response:", suppliers);
      console.log("======================");
      
      return suppliers;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  }

  async getActiveForWorkspace(workspaceId: string) {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      return prisma.suppliers.findMany({
        where: {
          workspaceId,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error("Error fetching active suppliers:", error);
      throw error;
    }
  }

  async getById(id: string, workspaceId: string) {
    try {
      // @ts-ignore - Prisma types are not correctly generated
      return prisma.suppliers.findFirst({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw error;
    }
  }

  async create(params: CreateSupplierParams) {
    const { 
      name, 
      description, 
      address, 
      website, 
      phone, 
      email, 
      contactPerson, 
      notes, 
      workspaceId, 
      isActive = true 
    } = params;

    try {
      // Generate a slug from the name
      const slug = generateSlug(name);

      // Check if the slug already exists in this workspace
      // @ts-ignore - Prisma types are not correctly generated
      const existingSupplier = await prisma.suppliers.findFirst({
        where: {
          slug,
          workspaceId,
        },
      });

      if (existingSupplier) {
        throw new Error('A supplier with this name already exists');
      }

      // @ts-ignore - Prisma types are not correctly generated
      return prisma.suppliers.create({
        data: {
          name,
          description,
          address,
          website,
          phone,
          email,
          contactPerson,
          notes,
          slug,
          isActive,
          workspaceId,
        },
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  }

  async update(id: string, workspaceId: string, params: UpdateSupplierParams) {
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
    } = params;

    try {
      // Get the existing supplier
      const existingSupplier = await this.getById(id, workspaceId);
      if (!existingSupplier) {
        throw new Error('Supplier not found');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (description !== undefined) {
        updateData.description = description;
      }
      
      if (address !== undefined) {
        updateData.address = address;
      }
      
      if (website !== undefined) {
        updateData.website = website;
      }
      
      if (phone !== undefined) {
        updateData.phone = phone;
      }
      
      if (email !== undefined) {
        updateData.email = email;
      }
      
      if (contactPerson !== undefined) {
        updateData.contactPerson = contactPerson;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }
      
      // If name is provided, update name and slug
      if (name !== undefined) {
        updateData.name = name;
        // Generate a slug from the name
        const slug = generateSlug(name);
        
        // Check if the slug already exists and is not the current supplier
        // @ts-ignore - Prisma types are not correctly generated
        const supplierWithSlug = await prisma.suppliers.findFirst({
          where: {
            slug,
            workspaceId,
            NOT: {
              id,
            },
          },
        });
        
        if (supplierWithSlug) {
          throw new Error('A supplier with this name already exists');
        }
        
        updateData.slug = slug;
      }

      // @ts-ignore - Prisma types are not correctly generated
      return prisma.suppliers.updateMany({
        where: {
          id,
          workspaceId,
        },
        data: updateData,
      }).then(() => this.getById(id, workspaceId));
    } catch (error) {
      console.error(`Error updating supplier ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string, workspaceId: string) {
    try {
      // Check if the supplier exists
      const supplier = await this.getById(id, workspaceId);
      if (!supplier) {
        throw new Error('Supplier not found');
      }

      // Check if supplier is used by any products
      // @ts-ignore - Prisma types are not correctly generated
      const products = await prisma.products.findMany({
        where: {
          // @ts-ignore - supplierId is defined in the schema but not in the generated types
          supplierId: id,
          workspaceId,
        },
      });

      if (products.length > 0) {
        throw new Error('Cannot delete supplier that is used by products');
      }

      // @ts-ignore - Prisma types are not correctly generated
      return prisma.suppliers.deleteMany({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      console.error(`Error deleting supplier ${id}:`, error);
      throw error;
    }
  }
}

export const supplierService = new SupplierService(); 