import { WhatsappConfig } from "../whatsapp-config.vo"

describe("WhatsappConfig", () => {
  const validPhoneNumber = "+1234567890"
  const validApiToken = "valid-token"
  const validWebhookUrl = "https://webhook.example.com"

  it("should create a valid WhatsApp config with all fields", () => {
    const config = WhatsappConfig.create(
      validPhoneNumber,
      validApiToken,
      validWebhookUrl
    )

    expect(config.getPhoneNumber()).toBe(validPhoneNumber)
    expect(config.getApiToken()).toBe(validApiToken)
    expect(config.getWebhookUrl()).toBe(validWebhookUrl)
    expect(config.isConfigured()).toBe(true)
  })

  it("should create a valid WhatsApp config with null values", () => {
    const config = WhatsappConfig.create(null, null, null)

    expect(config.getPhoneNumber()).toBeNull()
    expect(config.getApiToken()).toBeNull()
    expect(config.getWebhookUrl()).toBeNull()
    expect(config.isConfigured()).toBe(false)
  })

  it("should throw error when only phone number is provided", () => {
    expect(() => WhatsappConfig.create(validPhoneNumber, null, null)).toThrow(
      "WhatsApp phone number and API token must be provided together"
    )
  })

  it("should throw error when only API token is provided", () => {
    expect(() => WhatsappConfig.create(null, validApiToken, null)).toThrow(
      "WhatsApp phone number and API token must be provided together"
    )
  })

  it("should correctly compare two WhatsApp configs", () => {
    const config1 = WhatsappConfig.create(
      validPhoneNumber,
      validApiToken,
      validWebhookUrl
    )
    const config2 = WhatsappConfig.create(
      validPhoneNumber,
      validApiToken,
      validWebhookUrl
    )
    const config3 = WhatsappConfig.create(null, null, null)

    expect(config1.equals(config2)).toBe(true)
    expect(config1.equals(config3)).toBe(false)
  })
})
