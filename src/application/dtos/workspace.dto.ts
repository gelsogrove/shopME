export interface CreateWorkspaceDto {
  name: string
  description?: string | null
  whatsappPhoneNumber?: string | null
  whatsappApiToken?: string | null
  whatsappWebhookUrl?: string | null
}

export interface UpdateWorkspaceDto {
  name?: string
  description?: string | null
  whatsappPhoneNumber?: string | null
  whatsappApiToken?: string | null
  whatsappWebhookUrl?: string | null
  isActive?: boolean
}

export interface WorkspaceResponseDto {
  id: string
  name: string
  description: string | null
  whatsappPhoneNumber: string | null
  whatsappApiToken: string | null
  whatsappWebhookUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
