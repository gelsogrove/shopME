import { v4 as uuidv4 } from "uuid"
import { Workspace } from "../workspace.entity"

describe("Workspace", () => {
  const validId = uuidv4()
  const validName = "Test Workspace"
  const validSlug = "test-workspace"
  const validDescription = "Test Description"
  const validPhoneNumber = "+1234567890"
  const validApiToken = "valid-token"
  const validWebhookUrl = "https://webhook.example.com"

  it("should create a valid workspace with all fields", () => {
    const workspace = Workspace.create(
      validId,
      validName,
      validSlug,
      validDescription,
      validPhoneNumber,
      validApiToken,
      validWebhookUrl
    )

    expect(workspace.getId()).toBe(validId)
    expect(workspace.getName()).toBe(validName)
    expect(workspace.getDescription()).toBe(validDescription)
    expect(workspace.getWhatsappPhoneNumber()).toBe(validPhoneNumber)
    expect(workspace.getWhatsappApiToken()).toBe(validApiToken)
    expect(workspace.getWhatsappWebhookUrl()).toBe(validWebhookUrl)
    expect(workspace.getIsActive()).toBe(true)
    expect(workspace.getCreatedAt()).toBeInstanceOf(Date)
    expect(workspace.getUpdatedAt()).toBeInstanceOf(Date)
  })

  it("should create a valid workspace with minimal fields", () => {
    const workspace = Workspace.create(validId, validName, validSlug)

    expect(workspace.getId()).toBe(validId)
    expect(workspace.getName()).toBe(validName)
    expect(workspace.getDescription()).toBeNull()
    expect(workspace.getWhatsappPhoneNumber()).toBeNull()
    expect(workspace.getWhatsappApiToken()).toBeNull()
    expect(workspace.getWhatsappWebhookUrl()).toBeNull()
    expect(workspace.getIsActive()).toBe(true)
  })

  it("should update name successfully", () => {
    const workspace = Workspace.create(validId, validName, validSlug)
    const newName = "New Workspace Name"

    workspace.updateName(newName)
    expect(workspace.getName()).toBe(newName)
  })

  it("should throw error when updating with invalid name", () => {
    const workspace = Workspace.create(validId, validName, validSlug)

    expect(() => workspace.updateName("")).toThrow(
      "Workspace name cannot be empty"
    )
    expect(() => workspace.updateName("   ")).toThrow(
      "Workspace name cannot be empty"
    )
  })

  it("should update WhatsApp config successfully", () => {
    const workspace = Workspace.create(validId, validName, validSlug)

    workspace.updateWhatsappConfig(
      validPhoneNumber,
      validApiToken,
      validWebhookUrl
    )

    expect(workspace.getWhatsappPhoneNumber()).toBe(validPhoneNumber)
    expect(workspace.getWhatsappApiToken()).toBe(validApiToken)
    expect(workspace.getWhatsappWebhookUrl()).toBe(validWebhookUrl)
  })

  it("should throw error when updating with invalid WhatsApp config", () => {
    const workspace = Workspace.create(validId, validName, validSlug)

    expect(() =>
      workspace.updateWhatsappConfig(validPhoneNumber, null, null)
    ).toThrow("WhatsApp phone number and API token must be provided together")

    expect(() =>
      workspace.updateWhatsappConfig(null, validApiToken, null)
    ).toThrow("WhatsApp phone number and API token must be provided together")
  })

  it("should activate and deactivate workspace", () => {
    const workspace = Workspace.create(validId, validName, validSlug)

    workspace.deactivate()
    expect(workspace.getIsActive()).toBe(false)

    workspace.activate()
    expect(workspace.getIsActive()).toBe(true)
  })

  it("should update timestamp on any modification", () => {
    const workspace = Workspace.create(validId, validName, validSlug)
    const createdAt = workspace.getCreatedAt()
    const initialUpdatedAt = workspace.getUpdatedAt()

    // Wait a small amount of time to ensure timestamp difference
    setTimeout(() => {
      workspace.updateName("New Name")
      expect(workspace.getCreatedAt()).toEqual(createdAt)
      expect(workspace.getUpdatedAt()).not.toEqual(initialUpdatedAt)
    }, 100)
  })
})
