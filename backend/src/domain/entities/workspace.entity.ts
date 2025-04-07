export class Workspace {
  constructor(
    public readonly id: string,
    public name: string,
    public slug: string,
    public description: string | null,
    public whatsappPhoneNumber: string | null,
    public whatsappApiToken: string | null,
    public whatsappWebhookUrl: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(
    id: string,
    name: string,
    slug: string,
    description?: string | null,
    whatsappPhoneNumber?: string | null,
    whatsappApiToken?: string | null,
    whatsappWebhookUrl?: string | null,
    isActive: boolean = true
  ): Workspace {
    return new Workspace(
      id,
      name,
      slug,
      description || null,
      whatsappPhoneNumber || null,
      whatsappApiToken || null,
      whatsappWebhookUrl || null,
      isActive,
      new Date(),
      new Date()
    )
  }

  update(data: Partial<Workspace>): void {
    Object.assign(this, data)
    this.updatedAt = new Date()
  }

  public getId(): string {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getDescription(): string | null {
    return this.description
  }

  public getWhatsappPhoneNumber(): string | null {
    return this.whatsappPhoneNumber
  }

  public getWhatsappApiToken(): string | null {
    return this.whatsappApiToken
  }

  public getWhatsappWebhookUrl(): string | null {
    return this.whatsappWebhookUrl
  }

  public getIsActive(): boolean {
    return this.isActive
  }

  public getCreatedAt(): Date {
    return this.createdAt
  }

  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  public updateName(name: string): void {
    this.name = name
    this.updatedAt = new Date()
  }

  public updateDescription(description: string | null): void {
    this.description = description
    this.updatedAt = new Date()
  }

  public updateWhatsappConfig(
    phoneNumber: string | null,
    apiToken: string | null,
    webhookUrl: string | null
  ): void {
    this.whatsappPhoneNumber = phoneNumber
    this.whatsappApiToken = apiToken
    this.whatsappWebhookUrl = webhookUrl
    this.updatedAt = new Date()
  }

  public activate(): void {
    this.isActive = true
    this.updatedAt = new Date()
  }

  public deactivate(): void {
    this.isActive = false
    this.updatedAt = new Date()
  }
}
