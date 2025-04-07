export interface CreateWorkspaceDTO {
  name: string
  slug: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiToken?: string
  whatsappWebhookUrl?: string
  isActive?: boolean
}

export interface UpdateWorkspaceDTO {
  name?: string
  slug?: string
  description?: string
  whatsappPhoneNumber?: string
  whatsappApiToken?: string
  whatsappWebhookUrl?: string
  isActive?: boolean
}

export interface WorkspaceResponseDTO {
  id: string
  name: string
  slug: string
  description: string | null
  whatsappPhoneNumber: string | null
  whatsappApiToken: string | null
  whatsappWebhookUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
