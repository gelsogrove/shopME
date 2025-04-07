import { WhatsappConfig } from "../value-objects/whatsapp-config.vo"
import { WorkspaceName } from "../value-objects/workspace-name.vo"

export class Workspace {
  constructor(
    private readonly id: string,
    private name: WorkspaceName,
    private description: string | null,
    private whatsappConfig: WhatsappConfig,
    private isActive: boolean = true,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  // Getters
  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name.getValue()
  }

  getDescription(): string | null {
    return this.description
  }

  getWhatsappPhoneNumber(): string | null {
    return this.whatsappConfig.getPhoneNumber()
  }

  getWhatsappApiToken(): string | null {
    return this.whatsappConfig.getApiToken()
  }

  getWhatsappWebhookUrl(): string | null {
    return this.whatsappConfig.getWebhookUrl()
  }

  getIsActive(): boolean {
    return this.isActive
  }

  getCreatedAt(): Date {
    return this.createdAt
  }

  getUpdatedAt(): Date {
    return this.updatedAt
  }

  // Setters with business logic validation
  updateName(name: string): void {
    this.name = WorkspaceName.create(name)
    this.updateTimestamp()
  }

  updateDescription(description: string | null): void {
    this.description = description
    this.updateTimestamp()
  }

  updateWhatsappConfig(
    phoneNumber: string | null,
    apiToken: string | null,
    webhookUrl: string | null
  ): void {
    this.whatsappConfig = WhatsappConfig.create(
      phoneNumber,
      apiToken,
      webhookUrl
    )
    this.updateTimestamp()
  }

  activate(): void {
    this.isActive = true
    this.updateTimestamp()
  }

  deactivate(): void {
    this.isActive = false
    this.updateTimestamp()
  }

  private updateTimestamp(): void {
    this.updatedAt = new Date()
  }

  // Factory method
  static create(
    id: string,
    name: string,
    description?: string | null,
    whatsappPhoneNumber?: string | null,
    whatsappApiToken?: string | null,
    whatsappWebhookUrl?: string | null
  ): Workspace {
    return new Workspace(
      id,
      WorkspaceName.create(name),
      description || null,
      WhatsappConfig.create(
        whatsappPhoneNumber || null,
        whatsappApiToken || null,
        whatsappWebhookUrl || null
      )
    )
  }
}
