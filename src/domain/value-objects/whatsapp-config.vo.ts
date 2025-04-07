export class WhatsappConfig {
  constructor(
    private readonly phoneNumber: string | null,
    private readonly apiToken: string | null,
    private readonly webhookUrl: string | null
  ) {
    this.validate()
  }

  private validate(): void {
    if (
      (this.phoneNumber && !this.apiToken) ||
      (!this.phoneNumber && this.apiToken)
    ) {
      throw new Error(
        "WhatsApp phone number and API token must be provided together"
      )
    }
  }

  getPhoneNumber(): string | null {
    return this.phoneNumber
  }

  getApiToken(): string | null {
    return this.apiToken
  }

  getWebhookUrl(): string | null {
    return this.webhookUrl
  }

  isConfigured(): boolean {
    return this.phoneNumber !== null && this.apiToken !== null
  }

  equals(other: WhatsappConfig): boolean {
    return (
      this.phoneNumber === other.phoneNumber &&
      this.apiToken === other.apiToken &&
      this.webhookUrl === other.webhookUrl
    )
  }

  static create(
    phoneNumber: string | null,
    apiToken: string | null,
    webhookUrl: string | null
  ): WhatsappConfig {
    return new WhatsappConfig(phoneNumber, apiToken, webhookUrl)
  }
}
