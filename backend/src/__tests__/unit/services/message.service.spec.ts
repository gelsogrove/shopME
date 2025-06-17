import { MessageService } from '../../../application/services/message.service'

// Mock dependencies
const mockMessageRepository = {
  findCustomerByPhone: jest.fn(),
      getWorkspaceSettings: jest.fn(),
      isCustomerBlacklisted: jest.fn(),
  saveMessage: jest.fn(),
      hasRecentActivity: jest.fn(),
  getWipMessage: jest.fn(),
  getWelcomeMessage: jest.fn(),
      getWelcomeBackMessage: jest.fn(),
  getWorkspaceUrl: jest.fn(),
  getAgentConfig: jest.fn(),
  getResponseFromRag: jest.fn(),
  getErrorMessage: jest.fn(),
      updateCustomerLanguage: jest.fn(),
}

const mockTokenService = {
  createRegistrationToken: jest.fn(),
}

const mockCheckoutService = {
  detectCheckoutIntent: jest.fn(),
  createCheckoutLink: jest.fn(),
  getCheckoutMessage: jest.fn(),
}

const mockApiLimitService = {
      checkApiLimit: jest.fn(),
  incrementApiUsage: jest.fn(),
}

// Helper function to create complete workspace settings mock
const createWorkspaceSettingsMock = (overrides: any = {}) => ({
  id: 'workspace-1',
  name: 'Test Workspace',
  isActive: true,
  challengeStatus: false,
  welcomeMessages: { en: 'Welcome!', it: 'Benvenuto!' },
  wipMessages: { en: 'Work in progress', it: 'Lavori in corso' },
  afterRegistrationMessages: { en: 'Hello [nome]!', it: 'Ciao [nome]!' },
  ...overrides
})

describe('MessageService - Flow Implementation', () => {
  let messageService: MessageService

  beforeEach(() => {
    jest.clearAllMocks()
    messageService = new MessageService(
      mockMessageRepository as any,
      mockTokenService as any,
      mockCheckoutService as any,
      mockApiLimitService as any
    )
  })

  describe('STEP 1: API Limit Check', () => {
    it('should return null when API limit is exceeded', async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: true,
        currentUsage: 150,
        limit: 100,
        remaining: 0,
        resetTime: new Date()
      })

      // Act
      const result = await messageService.processMessage('Hello', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toBeNull()
      expect(mockApiLimitService.checkApiLimit).toHaveBeenCalledWith('workspace-1')
    })
  })

  describe('STEP 2: Spam Detection', () => {
    it('should auto-blacklist and return null when spam is detected', async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      })

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({
        isSpam: true,
        messageCount: 15
      })

      jest.spyOn(messageService as any, 'addToAutoBlacklist').mockResolvedValue(undefined)

      // Act
      const result = await messageService.processMessage('Spam message', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('STEP 3: Canale Attivo Check', () => {
    it('should return null when workspace is not active', async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      })

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({
        isSpam: false,
        messageCount: 1
      })

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(
        createWorkspaceSettingsMock({ isActive: false })
      )

      // Act
      const result = await messageService.processMessage('Hello', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('STEP 6: WIP Check', () => {
    it('should send WIP message and block dialog when workspace is in WIP', async () => {
      // Arrange
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      })

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({
        isSpam: false,
        messageCount: 1
      })

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(
        createWorkspaceSettingsMock({ 
          isActive: true,
          challengeStatus: true // WIP mode
        })
      )

      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: 'customer-1',
        activeChatbot: true
      })

      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
      mockMessageRepository.getWipMessage.mockResolvedValue('Service temporarily unavailable')

      // Act
      const result = await messageService.processMessage('Hello', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toBe('Service temporarily unavailable')
      expect(mockMessageRepository.getWipMessage).toHaveBeenCalledWith('workspace-1', 'en')
      expect(mockApiLimitService.incrementApiUsage).toHaveBeenCalledWith('workspace-1', 'whatsapp_message')
    })
  })

  describe('STEP 7: User Flow - New User', () => {
    it('should send welcome message with registration link for new user with greeting', async () => {
      // Arrange - Setup all previous steps to pass
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      })

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({
        isSpam: false,
        messageCount: 1
      })

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(
        createWorkspaceSettingsMock({ 
          isActive: true,
          challengeStatus: false
        })
      )

      mockMessageRepository.findCustomerByPhone.mockResolvedValue(null) // New user
      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
      mockMessageRepository.getWelcomeMessage.mockResolvedValue('Welcome! Please register:')
      mockTokenService.createRegistrationToken.mockResolvedValue('token123')
      mockMessageRepository.getWorkspaceUrl.mockResolvedValue('https://example.com')

      // Act
      const result = await messageService.processMessage('Hello', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toContain('Welcome! Please register:')
      expect(result).toContain('https://example.com/register')
      expect(result).toContain('token123')
      expect(mockApiLimitService.incrementApiUsage).toHaveBeenCalledWith('workspace-1', 'whatsapp_message')
    })
  })

  describe('STEP 9: Chat Libera RAG', () => {
    it('should return RAG response for normal chat', async () => {
      // Arrange - Setup all previous steps to pass
      mockApiLimitService.checkApiLimit.mockResolvedValue({
        exceeded: false,
        currentUsage: 50,
        limit: 100,
        remaining: 50,
        resetTime: new Date()
      })

      jest.spyOn(messageService as any, 'checkSpamBehavior').mockResolvedValue({
        isSpam: false,
        messageCount: 1
      })

      mockMessageRepository.getWorkspaceSettings.mockResolvedValue(
        createWorkspaceSettingsMock({ 
          isActive: true,
          challengeStatus: false
        })
      )

      mockMessageRepository.findCustomerByPhone.mockResolvedValue({
        id: 'customer-1',
        name: 'John Doe',
        language: 'en',
        activeChatbot: true
      })

      mockMessageRepository.isCustomerBlacklisted.mockResolvedValue(false)
      mockMessageRepository.hasRecentActivity.mockResolvedValue(true) // Has recent activity
      mockCheckoutService.detectCheckoutIntent.mockReturnValue(false) // No checkout intent

      mockMessageRepository.getAgentConfig.mockResolvedValue({
        prompt: 'You are a helpful assistant',
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1000
      })

      mockMessageRepository.getResponseFromRag.mockResolvedValue('This is a RAG response')

      // Act
      const result = await messageService.processMessage('What products do you have?', '+1234567890', 'workspace-1')

      // Assert
      expect(result).toBe('This is a RAG response')
      expect(mockMessageRepository.getAgentConfig).toHaveBeenCalledWith('workspace-1')
      expect(mockApiLimitService.incrementApiUsage).toHaveBeenCalledWith('workspace-1', 'whatsapp_message')
    })
  })
}) 