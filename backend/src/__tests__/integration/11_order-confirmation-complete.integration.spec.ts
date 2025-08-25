import { prisma } from "../../../lib/prisma"
import { cleanupTestData, setupTestCustomer, setupTestProduct } from "./common-test-helpers"

describe("Order Confirmation Complete Flow - Sequential Tests", () => {
  // Use the same test customer as other integration tests
  const testCustomer = {
    id: "test-customer-123",
    phone: "+34666777888", // Maria Garcia - same as other tests
    name: "Maria Garcia",
    workspaceId: "cm9hjgq9v00014qk8fsdy4ujv"
  }

  const mozzarellaProduct = {
    name: "Mozzarella di Bufala Campana DOP",
    price: 8.50,
    stock: 20,
    sku: "MOZ001",
    productCode: "MOZ001" // Codice prodotto per aggancio database
  }

  const parmigianoProduct = {
    name: "Parmigiano Reggiano DOP 24 mesi",
    price: 12.00,
    stock: 15,
    sku: "PAR001",
    productCode: "PAR001"
  }

  beforeAll(async () => {
    await setupTestCustomer(testCustomer)
    await setupTestProduct(mozzarellaProduct, testCustomer.workspaceId)
    await setupTestProduct(parmigianoProduct, testCustomer.workspaceId)
  })

  afterAll(async () => {
    await cleanupTestData(testCustomer.workspaceId)
  })

  // ============================================================================
  // 1. BACKEND ORDER CONFIRMATION - 4 MOZZARELLE
  // ============================================================================
  describe("1. Backend Order Confirmation - 4 Mozzarelle", () => {
    it("Backend: confirmOrderFromConversation generates valid checkout token", async () => {
      // 1. Simula conversazione WhatsApp
      const conversationContext = `
        Cliente: Metti 4 mozzarelle
        AI: Ho aggiunto 4 Mozzarella di Bufala Campana DOP al tuo carrello! 🧀
        Cliente: Confermo
      `

      // 2. Chiama API confirmOrderFromConversation
      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: conversationContext,
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 4,
            codice: "MOZ001"
          }
        ]
      }

      console.log("📞 Calling confirmOrderFromConversation API...")
      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      expect(response.status).toBe(200)
      const result = await response.json()

      expect(result.success).toBe(true)
      expect(result.checkoutToken).toBeDefined()
      expect(result.checkoutUrl).toContain("http://localhost:3000/checkout-public?token=")
      expect(result.totalAmount).toBe(34.00) // 4 × €8.50
      expect(result.expiresAt).toBeDefined()

      console.log(`✅ Token generated: ${result.checkoutToken}`)
      console.log(`🔗 URL: ${result.checkoutUrl}`)
      console.log(`💰 Total: €${result.totalAmount}`)
    })

    it("Backend: Token validation works correctly", async () => {
      // 1. Genera token
      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify({
          customerId: testCustomer.id,
          workspaceId: testCustomer.workspaceId,
          conversationContext: "Cliente: Metti 4 mozzarelle\nCliente: Confermo",
          prodottiSelezionati: [
            {
              nome: "Mozzarella di Bufala Campana DOP",
              quantita: 4,
              codice: "MOZ001"
            }
          ]
        })
      })

      const result = await response.json()
      expect(result.success).toBe(true)

      // 2. Valida token
      const validationResponse = await fetch(`http://localhost:3001/api/checkout/validate?token=${result.checkoutToken}`)
      expect(validationResponse.status).toBe(200)
      const validationResult = await validationResponse.json()

      expect(validationResult.success).toBe(true)
      expect(validationResult.valid).toBe(true)

      expect(result.checkoutUrl).toMatch(/^http:\/\/localhost:3000\/checkout-public\?token=[a-f0-9]{32}$/)

      console.log("✅ Backend test completato!")
      console.log(`📋 Token generato: ${result.checkoutToken}`)
      console.log(`🔗 URL: ${result.checkoutUrl}`)
      console.log(`💰 Totale: €${result.totalAmount}`)
    })

    it("Backend: Invalid token returns error", async () => {
      // Test con token invalido
      const validationResponse = await fetch("http://localhost:3001/api/checkout/validate?token=invalid-token")
      expect(validationResponse.status).toBe(200)
      const validationResult = await validationResponse.json()

      expect(validationResult.success).toBe(false)
      expect(validationResult.valid).toBe(false)
      expect(validationResult.error).toContain("Token expired or invalid")

      console.log("✅ Invalid token test completato!")
    })
  })

  // ============================================================================
  // 2. CHECKOUT LINK CONSISTENCY - DETERMINISTIC SYSTEM
  // ============================================================================
  describe("2. Checkout Link Consistency - Deterministic System", () => {
    it("Same conversation should always generate same token and URL", async () => {
      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Metti 4 mozzarelle\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 4,
            codice: "MOZ001"
          }
        ]
      }

      // Prima chiamata
      const response1 = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      const result1 = await response1.json()
      expect(result1.success).toBe(true)

      // Seconda chiamata (stesso input)
      const response2 = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      const result2 = await response2.json()
      expect(result2.success).toBe(true)

      // Verifica consistenza
      expect(result1.checkoutToken).toBe(result2.checkoutToken)
      expect(result1.checkoutUrl).toBe(result2.checkoutUrl)
      expect(result1.totalAmount).toBe(result2.totalAmount)

      console.log("✅ Consistency test completato!")
      console.log(`📋 Token 1: ${result1.checkoutToken}`)
      console.log(`📋 Token 2: ${result2.checkoutToken}`)
      console.log(`🔗 URL 1: ${result1.checkoutUrl}`)
      console.log(`🔗 URL 2: ${result2.checkoutUrl}`)
    })

    it("Different conversations should generate different tokens", async () => {
      const payload1 = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Metti 4 mozzarelle\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 4,
            codice: "MOZ001"
          }
        ]
      }

      const payload2 = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Metti 2 mozzarelle\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 2,
            codice: "MOZ001"
          }
        ]
      }

      // Prima conversazione
      const response1 = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload1)
      })

      const result1 = await response1.json()
      expect(result1.success).toBe(true)

      // Seconda conversazione (diversa)
      const response2 = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload2)
      })

      const result2 = await response2.json()
      expect(result2.success).toBe(true)

      // Verifica diversità
      expect(result1.checkoutToken).not.toBe(result2.checkoutToken)
      expect(result1.checkoutUrl).not.toBe(result2.checkoutUrl)
      expect(result1.totalAmount).not.toBe(result2.totalAmount)

      console.log("✅ Diversity test completato!")
      console.log(`📋 Token 1 (4 mozzarelle): ${result1.checkoutToken}`)
      console.log(`📋 Token 2 (2 mozzarelle): ${result2.checkoutToken}`)
      console.log(`💰 Totale 1: €${result1.totalAmount}`)
      console.log(`💰 Totale 2: €${result2.totalAmount}`)
    })

    it("Token should be valid and contain correct data (carrello + indirizzo)", async () => {
      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Metti 4 mozzarelle\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 4,
            codice: "MOZ001"
          }
        ]
      }

      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verifica token nel database
      const tokenRecord = await prisma.secureToken.findFirst({
        where: {
          token: result.checkoutToken,
          type: "checkout",
          isActive: true
        }
      })

      expect(tokenRecord).toBeDefined()
      expect(tokenRecord?.customerId).toBe(testCustomer.id)
      expect(tokenRecord?.workspaceId).toBe(testCustomer.workspaceId)

      // Verifica payload del token
      const tokenPayload = JSON.parse(tokenRecord?.payload || "{}")
      
      // ✅ Verifica customer data
      expect(tokenPayload.customer.id).toBe(testCustomer.id)
      expect(tokenPayload.customer.name).toBe(testCustomer.name)
      expect(tokenPayload.customer.phone).toBe(testCustomer.phone)
      
      // ✅ Verifica carrello (prodotti)
      expect(tokenPayload.prodotti).toHaveLength(1)
      expect(tokenPayload.prodotti[0].codice).toBe("MOZ001")
      expect(tokenPayload.prodotti[0].qty).toBe(4)
      expect(tokenPayload.prodotti[0].prezzo).toBe(8.50)
      expect(tokenPayload.prodotti[0].descrizione).toBe("Mozzarella di Bufala Campana DOP")
      
      // ✅ Verifica indirizzo di spedizione (se disponibile)
      if (tokenPayload.customer.address) {
        expect(tokenPayload.customer.address).toHaveProperty("name")
        expect(tokenPayload.customer.address).toHaveProperty("street")
        expect(tokenPayload.customer.address).toHaveProperty("city")
        expect(tokenPayload.customer.address).toHaveProperty("postalCode")
      }
      
      // ✅ Verifica indirizzo di fatturazione (se disponibile)
      if (tokenPayload.customer.invoiceAddress) {
        expect(tokenPayload.customer.invoiceAddress).toHaveProperty("name")
        expect(tokenPayload.customer.invoiceAddress).toHaveProperty("street")
        expect(tokenPayload.customer.invoiceAddress).toHaveProperty("city")
        expect(tokenPayload.customer.invoiceAddress).toHaveProperty("postalCode")
      }
      
      console.log("✅ Token validation successful:")
      console.log(`📋 Token: ${result.checkoutToken}`)
      console.log(`👤 Customer: ${tokenPayload.customer.name}`)
      console.log(`📦 Products: ${tokenPayload.prodotti.length}`)
      console.log(`💰 Total: €${result.totalAmount}`)
      console.log(`📍 Has shipping address: ${!!tokenPayload.customer.address}`)
      console.log(`📄 Has billing address: ${!!tokenPayload.customer.invoiceAddress}`)
    })

    it("URL should always be localhost:3000 and contain correct format", async () => {
      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Metti 4 mozzarelle\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 4,
            codice: "MOZ001"
          }
        ]
      }

      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verifica formato URL
      expect(result.checkoutUrl).toMatch(/^http:\/\/localhost:3000\/checkout-public\?token=[a-zA-Z0-9]+$/)
      
      // ✅ Verifica URL inizia con localhost:3000
      expect(result.checkoutUrl).toContain("http://localhost:3000")
      
      // ✅ Verifica URL contiene checkout-public path
      expect(result.checkoutUrl).toContain("/checkout-public?token=")
      
      // ✅ Estrai e verifica token dall'URL
      const urlToken = result.checkoutUrl.split("token=")[1]
      expect(urlToken).toBe(result.checkoutToken)
      expect(urlToken).toHaveLength(32) // Token dovrebbe essere 32 caratteri
      
      console.log("✅ URL validation successful:")
      console.log(`🔗 URL: ${result.checkoutUrl}`)
      console.log(`🌐 Domain: localhost:3000 ✅`)
      console.log(`📋 Token in URL: ${urlToken}`)
      console.log(`📋 Token in response: ${result.checkoutToken}`)
      console.log(`🔒 Token length: ${urlToken.length} characters`)
    })
  })

  // ============================================================================
  // 3. END-TO-END COMPLETE FLOW - WHATSAPP TO ORDER
  // ============================================================================
  describe("3. End-to-End Complete Flow - WhatsApp to Order", () => {
    it("Complete end-to-end flow: WhatsApp → Token → Checkout → Order", async () => {
      console.log("\n🔄 Testing complete end-to-end flow...")

      // STEP 1: Simulate WhatsApp conversation
      const conversation = [
        "Cliente: Ciao, vorrei 3 mozzarelle e 2 parmigiani",
        "AI: Perfetto! Ho aggiunto al tuo carrello:\n• 3x Mozzarella di Bufala Campana DOP (€8.50)\n• 2x Parmigiano Reggiano DOP 24 mesi (€12.00)\nTotale: €49.50",
        "Cliente: Confermo l'ordine"
      ]

      // STEP 2: Call confirmOrderFromConversation API
      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: conversation.join("\n"),
        prodottiSelezionati: [
          {
            nome: "Mozzarella di Bufala Campana DOP",
            quantita: 3,
            codice: "MOZ001"
          },
          {
            nome: "Parmigiano Reggiano DOP 24 mesi",
            quantita: 2,
            codice: "PAR001"
          }
        ]
      }

      console.log("📞 Calling confirmOrderFromConversation API...")
      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.checkoutToken).toBeDefined()
      expect(result.checkoutUrl).toContain("http://localhost:3000/checkout-public?token=")
      expect(result.totalAmount).toBe(49.50) // 3×8.50 + 2×12.00

      console.log(`✅ Token generated: ${result.checkoutToken}`)
      console.log(`🔗 URL: ${result.checkoutUrl}`)
      console.log(`💰 Total: €${result.totalAmount}`)

      // STEP 3: Validate token in database
      const tokenRecord = await prisma.secureToken.findFirst({
        where: {
          token: result.checkoutToken,
          type: "checkout",
          isActive: true
        }
      })

      expect(tokenRecord).toBeDefined()
      expect(tokenRecord?.customerId).toBe(testCustomer.id)
      expect(tokenRecord?.workspaceId).toBe(testCustomer.workspaceId)

      // STEP 4: Verify token payload contains correct product data
      const tokenPayload = JSON.parse(tokenRecord?.payload || "{}")
      expect(tokenPayload.customerId).toBe(testCustomer.id)
      expect(tokenPayload.prodotti).toHaveLength(2)

      // Verify first product (Mozzarella)
      const mozzarella = tokenPayload.prodotti.find((p: any) => p.codice === "MOZ001")
      expect(mozzarella).toBeDefined()
      expect(mozzarella.descrizione).toBe("Mozzarella di Bufala Campana DOP")
      expect(mozzarella.qty).toBe(3)
      expect(mozzarella.prezzo).toBe(8.50)
      expect(mozzarella.productId).toBeDefined()

      // Verify second product (Parmigiano)
      const parmigiano = tokenPayload.prodotti.find((p: any) => p.codice === "PAR001")
      expect(parmigiano).toBeDefined()
      expect(parmigiano.descrizione).toBe("Parmigiano Reggiano DOP 24 mesi")
      expect(parmigiano.qty).toBe(2)
      expect(parmigiano.prezzo).toBe(12.00)
      expect(parmigiano.productId).toBeDefined()

      console.log("✅ Token payload verified with correct product data")

      // STEP 5: Test token validation API
      console.log("🔐 Testing token validation API...")
      const validationResponse = await fetch(`http://localhost:3001/api/checkout/validate?token=${result.checkoutToken}`)
      expect(validationResponse.status).toBe(200)
      const validationResult = await validationResponse.json()
      expect(validationResult.success).toBe(true)
      expect(validationResult.valid).toBe(true)
      expect(validationResult.customer.id).toBe(testCustomer.id)
      expect(validationResult.prodotti).toHaveLength(2)

      console.log("✅ Token validation successful")

      // STEP 6: Test order submission
      console.log("📦 Testing order submission...")
      const orderData = {
        token: result.checkoutToken,
        prodotti: tokenPayload.prodotti,
        shippingAddress: {
          name: "Maria Garcia",
          street: "Via Roma 123",
          city: "Milano",
          postalCode: "20100",
          country: "Italia"
        },
        billingAddress: {
          name: "Maria Garcia",
          street: "Via Roma 123",
          city: "Milano",
          postalCode: "20100",
          country: "Italia"
        },
        notes: "Consegna al piano terra"
      }

      const submitResponse = await fetch("http://localhost:3001/api/checkout/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      })

      expect(submitResponse.status).toBe(200)
      const submitResult = await submitResponse.json()
      expect(submitResult.success).toBe(true)
      expect(submitResult.orderId).toBeDefined()
      expect(submitResult.orderCode).toMatch(/^ORD-\d{8}-\d{3}$/)

      console.log(`✅ Order created: ${submitResult.orderCode}`)

      // STEP 7: Verify order in database
      const order = await prisma.orders.findFirst({
        where: {
          orderCode: submitResult.orderCode,
          workspaceId: testCustomer.workspaceId
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      expect(order).toBeDefined()
      expect(order?.customerId).toBe(testCustomer.id)
      expect(order?.totalAmount).toBe(49.50)
      expect(order?.items).toHaveLength(2)

      // Verify order items
      const mozzarellaItem = order?.items.find(item => item.product?.sku === "MOZ001")
      expect(mozzarellaItem).toBeDefined()
      expect(mozzarellaItem?.quantity).toBe(3)
      expect(mozzarellaItem?.unitPrice).toBe(8.50)

      const parmigianoItem = order?.items.find(item => item.product?.sku === "PAR001")
      expect(parmigianoItem).toBeDefined()
      expect(parmigianoItem?.quantity).toBe(2)
      expect(parmigianoItem?.unitPrice).toBe(12.00)

      // STEP 8: Verify token marked as used
      const usedToken = await prisma.secureToken.findFirst({
        where: {
          token: result.checkoutToken
        }
      })

      expect(usedToken?.usedAt).toBeDefined()
      console.log("✅ Token marked as used")

      console.log("🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!")
      console.log(`📋 Order Code: ${submitResult.orderCode}`)
      console.log(`💰 Total Amount: €${order?.totalAmount}`)
      console.log(`📦 Items: ${order?.items.length}`)
    })

    it("Product code mapping verification", async () => {
      console.log("\n🔍 Testing product code mapping...")

      // Test with different product identification methods
      const testCases = [
        {
          name: "Mozzarella di Bufala Campana DOP",
          code: "MOZ001",
          quantity: 2
        },
        {
          name: "Parmigiano Reggiano DOP 24 mesi", 
          code: "PAR001",
          quantity: 1
        }
      ]

      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Voglio 2 mozzarelle e 1 parmigiano\nCliente: Confermo",
        prodottiSelezionati: testCases
      }

      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.success).toBe(true)

      // Verify token payload
      const tokenRecord = await prisma.secureToken.findFirst({
        where: {
          token: result.checkoutToken,
          type: "checkout"
        }
      })

      const tokenPayload = JSON.parse(tokenRecord?.payload || "{}")
      
      // Verify product codes are correctly mapped
      expect(tokenPayload.prodotti).toHaveLength(2)
      
      const mozzarella = tokenPayload.prodotti.find((p: any) => p.codice === "MOZ001")
      expect(mozzarella.productId).toBeDefined()
      expect(mozzarella.descrizione).toBe("Mozzarella di Bufala Campana DOP")
      
      const parmigiano = tokenPayload.prodotti.find((p: any) => p.codice === "PAR001")
      expect(parmigiano.productId).toBeDefined()
      expect(parmigiano.descrizione).toBe("Parmigiano Reggiano DOP 24 mesi")

      console.log("✅ Product code mapping verified")
      console.log(`📦 Mozzarella: ${mozzarella.codice} → ${mozzarella.productId}`)
      console.log(`📦 Parmigiano: ${parmigiano.codice} → ${parmigiano.productId}`)
    })

    it("Error handling: Product not found", async () => {
      console.log("\n❌ Testing error handling...")

      const payload = {
        customerId: testCustomer.id,
        workspaceId: testCustomer.workspaceId,
        conversationContext: "Cliente: Voglio 5 prodotti inesistenti\nCliente: Confermo",
        prodottiSelezionati: [
          {
            nome: "Prodotto Inesistente",
            quantita: 5,
            codice: "INEXISTENT"
          }
        ]
      }

      const response = await fetch("http://localhost:3001/api/internal/confirm-order-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from("admin:admin").toString("base64")
        },
        body: JSON.stringify(payload)
      })

      expect(response.status).toBe(200)
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain("Product not found")

      console.log("✅ Error handling verified")
    })
  })
})
