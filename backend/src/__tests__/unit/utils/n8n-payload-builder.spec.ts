import 'jest'

// Mock PrismaClient BEFORE importing the module under test
const mockPrisma = {
  workspace: {
    findUnique: jest.fn().mockResolvedValue({
      id: 'ws-1',
      name: "L'Altra Italia(ESP)",
      businessType: 'ECOMMERCE',
      plan: 'PREMIUM',
      whatsappPhoneNumber: '+34654728753',
      url: 'https://laltroitalia.shop',
      notificationEmail: 'admin@laltroitalia.shop',
      description: 'Prodotti alimentari italiani di alta qualità',
    }),
  },
  customers: {
    findFirst: jest.fn().mockResolvedValue({
      id: 'cust-1',
      name: 'Mario Rossi',
      email: 'mario@example.com',
      phone: '+391234567890',
      language: 'it',
      isActive: true,
      isBlacklisted: false,
      activeChatbot: true,
      discount: 0,
      currency: 'EUR',
    }),
  },
  agentConfig: {
    findFirst: jest.fn().mockResolvedValue({
      id: 'agent-1',
      workspaceId: 'ws-1',
      model: 'openai/gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
      prompt: 'You are a helpful assistant',
      isActive: true,
    }),
  },
  chatSession: {
    findFirst: jest.fn().mockResolvedValue({ id: 'chat-1' }),
  },
  message: {
    findMany: jest.fn().mockResolvedValue([
      { id: 'm1', content: 'Ciao', direction: 'INBOUND', createdAt: new Date('2024-06-19T15:26:00.000Z') },
      { id: 'm2', content: 'Benvenuto', direction: 'OUTBOUND', createdAt: new Date('2024-06-19T15:27:00.000Z') },
    ]),
  },
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Import after mocks
import { N8nPayloadBuilder } from '../../../utils/n8n-payload-builder'

describe('N8nPayloadBuilder', () => {
  const workspaceId = 'ws-1'
  const phoneNumber = '+391234567890'
  const messageContent = 'Vorrei dei formaggi'
  const sessionToken = 'session-token-abc'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('buildSimplifiedPayload should include precompiled data and mapped messages', async () => {
    const payload = await N8nPayloadBuilder.buildSimplifiedPayload(
      workspaceId,
      phoneNumber,
      messageContent,
      sessionToken,
      'whatsapp'
    )

    expect(payload.workspaceId).toBe(workspaceId)
    expect(payload.phoneNumber).toBe(phoneNumber)
    expect(payload.messageContent).toBe(messageContent)

    // precompiledData.agentConfig must reflect DB values
    expect(payload.precompiledData.agentConfig).toEqual(
      expect.objectContaining({
        workspaceId,
        model: 'openai/gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 1000,
        isActive: true,
      })
    )

    // precompiledData.customer must merge business fields and conversation history
    expect(payload.precompiledData.customer).toEqual(
      expect.objectContaining({
        id: 'cust-1',
        phone: phoneNumber,
        isActive: true,
        isBlacklisted: false,
        activeChatbot: true,
        businessName: "L'Altra Italia(ESP)",
        plan: 'PREMIUM',
      })
    )

    // messages converted from conversation history roles
    expect(Array.isArray(payload.messages)).toBe(true)
    expect(payload.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: expect.any(String) }),
        expect.objectContaining({ role: 'assistant', content: expect.any(String) }),
      ])
    )
  })

  it('buildSimplifiedPayload should use fallback conversation history when none', async () => {
    ;(mockPrisma.customers.findFirst as jest.Mock).mockResolvedValueOnce(null)

    const payload = await N8nPayloadBuilder.buildSimplifiedPayload(
      workspaceId,
      phoneNumber,
      messageContent,
      sessionToken,
      'whatsapp'
    )

    expect(payload.precompiledData.customer).toBeDefined()
    // Fallback path sets language and defaults
    expect(payload.precompiledData.customer.language).toBeDefined()
    // Fallback conversation history is provided with at least one message
    expect(payload.messages.length).toBeGreaterThan(0)
  })

  it('sendToN8N should POST payload and parse array response', async () => {
    const mockJson = jest.fn().mockResolvedValue([{ message: 'ok' }])
    const mockFetch = jest.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK', json: mockJson })
    // @ts-ignore override global
    global.fetch = mockFetch

    const payload = await N8nPayloadBuilder.buildSimplifiedPayload(
      workspaceId,
      phoneNumber,
      messageContent,
      sessionToken,
      'whatsapp'
    )

    const response = await N8nPayloadBuilder.sendToN8N(payload as any, 'https://n8n.test/webhook', 'unit-test')

    expect(mockFetch).toHaveBeenCalledWith('https://n8n.test/webhook', expect.objectContaining({ method: 'POST' }))
    expect(response).toEqual(expect.objectContaining({ message: 'ok' }))
  })

  it('sendToN8N should throw on non-ok response and include status', async () => {
    const mockText = jest.fn().mockResolvedValue('Bad request')
    const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request', text: mockText })
    // @ts-ignore override global
    global.fetch = mockFetch

    const payload = await N8nPayloadBuilder.buildSimplifiedPayload(
      workspaceId,
      phoneNumber,
      messageContent,
      sessionToken,
      'whatsapp'
    )

    await expect(
      N8nPayloadBuilder.sendToN8N(payload as any, 'https://n8n.test/webhook', 'unit-test')
    ).rejects.toThrow(/N8N webhook failed with status: 400 Bad Request/i)
  })
})