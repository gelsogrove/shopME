import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreateWorkspaceData {
  name: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  isDelete?: boolean
  isActive?: boolean
}

interface UpdateWorkspaceData {
  name?: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  isActive?: boolean
  isDelete?: boolean
}

export const workspaceService = {
  async getAll() {
    return prisma.workspace.findMany({
      where: { 
        isActive: true,
        isDelete: false 
      },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
      },
    })
  },

  async getById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
      },
    })
  },

  async create(data: CreateWorkspaceData) {
    return prisma.workspace.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        isDelete: false,
      },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
      },
    })
  },

  async update(id: string, data: UpdateWorkspaceData) {
    return prisma.workspace.update({
      where: { id },
      data: {
        ...data,
        slug: data.name
          ? data.name.toLowerCase().replace(/\s+/g, "-")
          : undefined,
      },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
      },
    })
  },

  async delete(id: string) {
    return prisma.workspace.update({
      where: { id },
      data: { isDelete: true },
    })
  },
}
