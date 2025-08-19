import { PrismaClient } from "@prisma/client"
import { confirmOrderFromConversation } from "../../../chatbot/calling-functions/confirmOrderFromConversation"
import logger from "../../../utils/logger"

// Mock Prisma
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(),
}))

// Mock logger
jest.mock("../../../utils/logger", () => ({
  error: jest.fn(),
  info: jest.fn(),
}))

describe("confirmOrderFromConversation", () => {
  let prisma: jest.Mocked<PrismaClient>

  const mockCustomer = {
    id: "customer-123",
    name: "Test Customer",
    email: "test@example.com",
    phone: "1234567890",
    workspaceId: "workspace-123",
  }

  const mockWorkspace = {
    id: "workspace-123",
    name: "Test Workspace",
  }

  const mockProduct = {
    id: "product-123",
    name: "maglietta rossa",
    price: 29.99,
    stock: 10,
    workspaceId: "workspace-123",
  }

  const validParams = {
    customerId: "customer-123",
    workspaceId: "workspace-123",
    prodottiSelezionati: [
      {
        nome: "maglietta rossa",
        quantità: 2,
      },
    ],
  }

  beforeEach(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>
    ;(PrismaClient as jest.Mock).mockImplementation(() => prisma)

    // Mock all Prisma methods
    prisma.customers.findFirst = jest.fn()
    prisma.workspace.findUnique = jest.fn()
    prisma.products.findFirst = jest.fn()
    prisma.orders.create = jest.fn()
    prisma.secureToken.create = jest.fn()
    prisma.carts.findUnique = jest.fn()
    prisma.cartItems.create = jest.fn()
    prisma.cartItems.update = jest.fn()
    prisma.cartItems.delete = jest.fn()
    prisma.carts.create = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Order confirmation", () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.orders.create as jest.Mock).mockResolvedValue({
        id: "order-123",
        totalAmount: 59.98,
      })
      ;(prisma.carts.findUnique as jest.Mock).mockResolvedValue({
        id: "cart-123",
        items: [],
      })
    })

    it("should successfully confirm an order", async () => {
      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: true,
        response: expect.stringContaining("Order confirmed successfully"),
        orderId: "order-123",
        totalAmount: 59.98,
      })

      expect(prisma.orders.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: "customer-123",
          workspaceId: "workspace-123",
          totalAmount: 59.98,
        }),
      })
    })

    it("should fail when customerId is missing", async () => {
      const invalidParams = { ...validParams, customerId: "" }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: "An error occurred during order creation. Please try again or contact support.",
        error: "Missing required parameters: customerId or workspaceId",
      })
    })

    it("should fail when workspaceId is missing", async () => {
      const invalidParams = { ...validParams, workspaceId: "" }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: "An error occurred during order creation. Please try again or contact support.",
        error: "Missing required parameters: customerId or workspaceId",
      })
    })

    it("should fail when no products are selected", async () => {
      const invalidParams = { ...validParams, prodottiSelezionati: [] }

      const result = await confirmOrderFromConversation(invalidParams)

      expect(result).toEqual({
        success: false,
        response: "I haven't identified any products in our conversation. Can you specify what you want to order?",
        error: "No products identified in conversation",
      })
    })

    it("should fail when customer is not found", async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: "An error occurred during order creation. Please try again or contact support.",
        error: "Customer customer-123 not found in workspace workspace-123",
      })
    })

    it("should fail when workspace is not found", async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: "An error occurred during order creation. Please try again or contact support.",
        error: "Workspace workspace-123 not found",
      })
    })

    it("should fail when product is not found", async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: "I can't find the product 'maglietta rossa' in the catalog. Can you verify the name?",
        error: "Product not found: maglietta rossa",
      })
    })

    it("should handle database errors gracefully", async () => {
      ;(prisma.customers.findFirst as jest.Mock).mockRejectedValue(new Error("Database connection failed"))

      const result = await confirmOrderFromConversation(validParams)

      expect(result).toEqual({
        success: false,
        response: "An error occurred during order creation. Please try again or contact support.",
        error: "Database connection failed",
      })

      expect(logger.error).toHaveBeenCalledWith(
        "[CONFIRM_ORDER_CONVERSATION] Error confirming order from conversation:",
        expect.any(Error)
      )
    })
  })

  describe("Token generation", () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.secureToken.create as jest.Mock).mockResolvedValue({
        id: "token-123",
        token: "mockedhashedtoken123456789012",
      })
    })

    it("should generate a secure token for order access", async () => {
      const result = await confirmOrderFromConversation(validParams)

      expect(prisma.secureToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: "customer-123",
          workspaceId: "workspace-123",
          action: "orders",
          expiresAt: expect.any(Date),
        }),
      })

      expect(result.success).toBe(true)
    })
  })

  describe("Cart management", () => {
    beforeEach(() => {
      ;(prisma.customers.findFirst as jest.Mock).mockResolvedValue(mockCustomer)
      ;(prisma.workspace.findUnique as jest.Mock).mockResolvedValue(mockWorkspace)
      ;(prisma.products.findFirst as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.orders.create as jest.Mock).mockResolvedValue({
        id: "order-123",
        totalAmount: 59.98,
      })
    })

    it("should clear cart after successful order", async () => {
      const mockCart = {
        id: "cart-123",
        items: [
          {
            id: "item-123",
            productId: "product-123",
            quantity: 2,
          },
        ],
      }

      ;(prisma.carts.findUnique as jest.Mock).mockResolvedValue(mockCart)

      await confirmOrderFromConversation(validParams)

      expect(prisma.cartItems.delete).toHaveBeenCalledWith({
        where: { id: "item-123" },
      })
    })

    it("should create cart if it doesn't exist", async () => {
      ;(prisma.carts.findUnique as jest.Mock).mockResolvedValue(null)

      await confirmOrderFromConversation(validParams)

      expect(prisma.carts.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          customerId: "customer-123",
          workspaceId: "workspace-123",
        }),
      })
    })
  })
})