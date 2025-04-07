export class WhatsappConfig {
  private constructor(
    private readonly phoneNumber: string | null,
    private readonly apiToken: string | null,
    private readonly webhookUrl: string | null
  ) {}

  public static create(
    phoneNumber: string | null,
    apiToken: string | null,
    webhookUrl: string | null
  ): WhatsappConfig {
    // Both phone number and API token must be provided together
    if ((phoneNumber && !apiToken) || (!phoneNumber && apiToken)) {
      throw new Error(
        "WhatsApp phone number and API token must be provided together"
      )
    }

    return new WhatsappConfig(phoneNumber, apiToken, webhookUrl)
  }

  public getPhoneNumber(): string | null {
    return this.phoneNumber
  }

  public getApiToken(): string | null {
    return this.apiToken
  }

  public getWebhookUrl(): string | null {
    return this.webhookUrl
  }

  public isConfigured(): boolean {
    return !!(this.phoneNumber && this.apiToken)
  }

  public equals(other: WhatsappConfig): boolean {
    return (
      this.phoneNumber === other.phoneNumber &&
      this.apiToken === other.apiToken &&
      this.webhookUrl === other.webhookUrl
    )
  }
}
