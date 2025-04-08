import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const workspaceService = {
  async getAll() {
    return prisma.workspace.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
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
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    })
  },

  async create(data: { name: string; whatsappPhoneNumber?: string }) {
    return prisma.workspace.create({
      data: {
        ...data,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      },
      select: {
        id: true,
        name: true,
        whatsappPhoneNumber: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    })
  },

  async update(
    id: string,
    data: {
      name?: string
      whatsappPhoneNumber?: string
      isActive?: boolean
    }
  ) {
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
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    })
  },

  async delete(id: string) {
    return prisma.workspace.update({
      where: { id },
      data: { isActive: false },
    })
  },
}
