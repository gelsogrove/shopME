import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface CreateWorkspaceData {
  name: string
  slug: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  isDelete?: boolean
  isActive?: boolean
  currency?: string
  language?: string
  messageLimit?: number
  challengeStatus?: boolean
  wipMessage?: string
  blocklist?: string
}

interface UpdateWorkspaceData {
  name?: string
  slug?: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiKey?: string
  isActive?: boolean
  isDelete?: boolean
  currency?: string
  language?: string
  messageLimit?: number
  challengeStatus?: boolean
  wipMessage?: string
  blocklist?: string
}

export const workspaceService = {
  async getAll() {
    return prisma.workspace.findMany({
      where: {
        isDelete: false
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
        currency: true,
        language: true,
        messageLimit: true,
        challengeStatus: true,
        wipMessage: true,
        blocklist: true
      },
    })
  },

  async getById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
        currency: true,
        language: true,
        messageLimit: true,
        challengeStatus: true,
        wipMessage: true,
        blocklist: true
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
        slug: true,
        description: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
        currency: true,
        language: true,
        messageLimit: true,
        challengeStatus: true,
        wipMessage: true,
        blocklist: true
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
        slug: true,
        description: true,
        whatsappPhoneNumber: true,
        whatsappApiKey: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        isDelete: true,
        currency: true,
        language: true,
        messageLimit: true,
        challengeStatus: true,
        wipMessage: true,
        blocklist: true
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
