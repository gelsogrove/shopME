import { PrismaClient } from "@prisma/client"
import { createCheckoutLink } from "../../chatbot/calling-functions/createCheckoutLink"
import { getAllCategories } from "../../chatbot/calling-functions/getAllCategories"
import { getAllProducts } from "../../chatbot/calling-functions/getAllProducts"
import { MessageRepository } from "../../repositories/message.repository"
import { documentService } from "../../services/documentService"
import logger from "../../utils/logger"
import { TokenService } from "./token.service"

interface FunctionCallResult {
  data: any
  functionName: string
}

/**
 * Service per gestire le chiamate di funzione dal function router
 */
export class FunctionHandlerService {
  private prisma: PrismaClient
  private messageRepository: MessageRepository
  private tokenService: TokenService

  constructor() {
    this.prisma = new PrismaClient()
    this.messageRepository = new MessageRepository()
    this.tokenService = new TokenService()
  }

  /**
   * Gestisce una chiamata di funzione in base al nome e ai parametri
   * @param functionName Nome della funzione da chiamare
   * @param params Parametri per la funzione
   * @param customer Informazioni sul cliente
   * @param workspaceId ID del workspace
   * @param phoneNumber Numero di telefono del cliente
   * @returns Risultato della chiamata di funzione
   */
  async handleFunctionCall(
    functionName: string,
    params: any,
    customer: any,
    workspaceId: string,
    phoneNumber: string
  ): Promise<FunctionCallResult> {
    logger.info(`Handling function call: ${functionName} with params:`, params)

    try {
      switch (functionName) {
        case "get_product_info":
          return {
            functionName,
            data: await this.getProductInfo(params.product_name, workspaceId),
          }

        case "get_event_by_date":
          return {
            functionName,
            data: await this.getEventByDate(params.date, workspaceId),
          }

        case "get_service_info":
          return {
            functionName,
            data: await this.getServiceInfo(params.service_name, workspaceId),
          }

        case "welcome_user":
          return {
            functionName,
            data: await this.generateWelcomeMessage(
              customer,
              phoneNumber,
              workspaceId
            ),
          }

        case "create_order":
          return {
            functionName,
            data: await this.createOrder(customer.id, workspaceId),
          }

        case "get_cart_info":
          return {
            functionName,
            data: await this.getCartInfo(customer.id, workspaceId),
          }

        case "get_order_status":
          return {
            functionName,
            data: await this.getOrderStatus(
              customer.id,
              params?.order_id,
              workspaceId
            ),
          }

        case "add_to_cart":
          return {
            functionName,
            data: await this.addToCart(
              customer.id,
              params.product_name,
              params.quantity || 1,
              workspaceId
            ),
          }

        case "remove_from_cart":
          return {
            functionName,
            data: await this.removeFromCart(
              customer.id,
              params.product_name,
              params.quantity,
              workspaceId
            ),
          }

        case "get_product_list":
          return {
            functionName,
            data: await this.getProductList(
              params?.category,
              params?.limit || 10,
              workspaceId
            ),
          }

        case "get_faq_info":
          return {
            functionName,
            data: await this.getFaqInfo(params.question, workspaceId),
          }

        case "search_documents":
          return {
            functionName,
            data: await this.searchDocuments(params.query, workspaceId),
          }

        case "create_checkout_link":
          return {
            functionName,
            data: await this.handleCreateCheckoutLink(
              phoneNumber,
              workspaceId,
              customer?.id,
              params.message
            ),
          }

        case "get_all_categories":
          return {
            functionName,
            data: await this.handleGetAllCategories(
              phoneNumber,
              workspaceId,
              customer?.id,
              params.message
            ),
          }

        case "get_all_products":
          return {
            functionName,
            data: await this.handleGetAllProducts(
              phoneNumber,
              workspaceId,
              customer?.id,
              params.message
            ),
          }

        case "get_generic_response":
          return {
            functionName,
            data: {
              current_time: new Date().toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              greeting: this.getTimeBasedGreeting(customer?.language || "it"),
            },
          }

        default:
          logger.warn(`Unknown function: ${functionName}`)
          return {
            functionName: "get_generic_response",
            data: {
              error: `Function ${functionName} not implemented`,
              current_time: new Date().toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          }
      }
    } catch (error) {
      logger.error(`Error executing function ${functionName}:`, error)
      return {
        functionName,
        data: { error: `Error executing function: ${error.message || error}` },
      }
    }
  }

  /**
   * Ottiene informazioni su un prodotto specifico
   */
  private async getProductInfo(
    productName: string,
    workspaceId: string
  ): Promise<any> {
    try {
      // Cerca prodotti che corrispondono approssimativamente al nome
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId,
          isActive: true,
          name: {
            contains: productName,
            mode: "insensitive",
          },
        },
        include: {
          category: true,
        },
      })

      if (!products || products.length === 0) {
        return null
      }

      // Se ci sono più corrispondenze, trova quella più vicina
      // Per ora prendiamo la prima corrispondenza
      const product = products[0]

      return {
        nome: product.name,
        prezzo: product.price,
        descrizione: product.description || "",
        disponibilita: product.stock > 0,
        categoria: product.category?.name || "",
        sku: product.sku || "",
      }
    } catch (error) {
      logger.error("Error fetching product info:", error)
      return null
    }
  }

  /**
   * Ottiene informazioni sugli eventi in una data specifica
   */
  private async getEventByDate(
    dateStr: string,
    workspaceId: string
  ): Promise<any> {
    try {
      const date = new Date(dateStr)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      // Events functionality has been removed from the system
      logger.info("Events functionality has been removed from the system");
      return [];
    } catch (error) {
      logger.error("Error fetching events:", error)
      return []
    }
  }

  /**
   * Ottiene informazioni su un servizio specifico
   */
  private async getServiceInfo(
    serviceName: string,
    workspaceId: string
  ): Promise<any> {
    try {
      const services = await this.prisma.services.findMany({
        where: {
          workspaceId,
          isActive: true,
          name: {
            contains: serviceName,
            mode: "insensitive",
          },
        },
      })

      if (!services || services.length === 0) {
        return null
      }

      const service = services[0]
      return {
        nome: service.name,
        prezzo: service.price,
        descrizione: service.description || "",
        valuta: service.currency,
      }
    } catch (error) {
      logger.error("Error fetching service info:", error)
      return null
    }
  }

  /**
   * Genera un messaggio di benvenuto per l'utente
   */
  private async generateWelcomeMessage(
    customer: any,
    phoneNumber: string,
    workspaceId: string
  ): Promise<any> {
    try {
      const workspaceSettings = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      })

      if (!workspaceSettings || !workspaceSettings.welcomeMessages) {
        return {
          greeting: "Benvenuto!",
          workspace_name: "il nostro servizio",
          time_of_day: this.getTimeBasedGreeting(customer?.language || "it"),
        }
      }

      // Determina la lingua dell'utente
      const userLang = customer?.language?.toLowerCase()?.slice(0, 2) || "it"
      const welcomeMessages = workspaceSettings.welcomeMessages as Record<
        string,
        string
      >

      // Se l'utente non è registrato, includi il link di registrazione
      if (!customer || customer.name === "Unknown Customer") {
        // Genera il token di registrazione
        const token = await this.tokenService.createRegistrationToken(
          phoneNumber,
          workspaceId
        )

        // Assicuriamoci che baseUrl contenga il protocollo HTTP
        let baseUrl =
          workspaceSettings.url ||
          process.env.FRONTEND_URL ||
          "https://example.com"
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
          baseUrl = "https://" + baseUrl
        }

        // Costruisci l'URL di registrazione
        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(
          phoneNumber
        )}&workspace=${workspaceId}&token=${token}`

        return {
          greeting:
            welcomeMessages[userLang] || welcomeMessages["en"] || "Benvenuto!",
          workspace_name: workspaceSettings.name || "il nostro servizio",
          time_of_day: this.getTimeBasedGreeting(userLang),
          registration_url: registrationUrl,
          needs_registration: true,
        }
      }

      // Per utenti già registrati
      return {
        greeting:
          welcomeMessages[userLang] || welcomeMessages["en"] || "Benvenuto!",
        customer_name: customer.name,
        workspace_name: workspaceSettings.name || "il nostro servizio",
        time_of_day: this.getTimeBasedGreeting(userLang),
      }
    } catch (error) {
      logger.error("Error generating welcome message:", error)
      return {
        greeting: "Benvenuto!",
        error:
          "Si è verificato un errore nella generazione del messaggio di benvenuto.",
      }
    }
  }

  /**
   * Crea un nuovo ordine dal carrello dell'utente
   */
  private async createOrder(
    customerId: string,
    workspaceId: string
  ): Promise<any> {
    try {
      // Verifica che il cliente abbia un carrello con elementi
      const cart = await this.prisma.carts.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          error: "Il carrello è vuoto",
          cart_empty: true,
        }
      }

      // Calcola il totale
      let total = 0
      for (const item of cart.items) {
        total += item.quantity * item.product.price
      }

      // Crea l'ordine
      const order = await this.prisma.orders.create({
        data: {
          status: "PENDING",
          totalAmount: total,
          orderCode: `ORD-${Date.now()}`,
          customerId,
          workspaceId,
          items: {
            create: cart.items.map((item) => ({
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: item.quantity * item.product.price,
              productId: item.productId,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Svuota il carrello
      await this.prisma.cartItems.deleteMany({
        where: { cartId: cart.id },
      })

      return {
        success: true,
        order_id: order.id,
        total: order.totalAmount,
        status: order.status,
        items: order.items.map((item) => ({
          nome: item.product.name,
          quantità: item.quantity,
          prezzo_unitario: item.unitPrice,
          subtotale: item.totalPrice,
        })),
      }
    } catch (error) {
      logger.error("Error creating order:", error)
      return {
        success: false,
        error: "Si è verificato un errore nella creazione dell'ordine",
      }
    }
  }

  /**
   * Ottiene le informazioni sul carrello dell'utente
   */
  private async getCartInfo(
    customerId: string,
    workspaceId: string
  ): Promise<any> {
    try {
      // Trova il carrello del cliente
      let cart = await this.prisma.carts.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // Se il carrello non esiste, creane uno nuovo
      if (!cart) {
        cart = await this.prisma.carts.create({
          data: {
            customerId,
            workspaceId,
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })
      }

      // Se il carrello è vuoto
      if (cart.items.length === 0) {
        return {
          empty: true,
          items: [],
          total: 0,
        }
      }

      // Calcola il totale
      let total = 0
      const items = cart.items.map((item) => {
        const subtotal = item.quantity * item.product.price
        total += subtotal

        return {
          nome: item.product.name,
          quantità: item.quantity,
          prezzo_unitario: item.product.price,
          subtotale: subtotal,
        }
      })

      return {
        empty: false,
        items,
        total,
        num_items: cart.items.length,
        total_quantity: cart.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        ),
      }
    } catch (error) {
      logger.error("Error fetching cart info:", error)
      return {
        error:
          "Si è verificato un errore nel recupero delle informazioni del carrello",
        empty: true,
        items: [],
        total: 0,
      }
    }
  }

  /**
   * Ottiene lo stato di un ordine specifico o degli ordini recenti
   */
  private async getOrderStatus(
    customerId: string,
    orderId?: string,
    workspaceId?: string
  ): Promise<any> {
    try {
      if (orderId) {
        // Ottieni un ordine specifico
        const order = await this.prisma.orders.findUnique({
          where: { id: orderId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        })

        if (!order) {
          return {
            found: false,
            error: "Ordine non trovato",
          }
        }

        return {
          found: true,
          id: order.id,
          status: order.status,
          total: order.totalAmount,
          data: order.createdAt,
          items: order.items.map((item) => ({
            nome: item.product.name,
            quantità: item.quantity,
            prezzo_unitario: item.unitPrice,
          })),
        }
      } else {
        // Ottieni gli ordini recenti del cliente
        const orders = await this.prisma.orders.findMany({
          where: { customerId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })

        if (!orders || orders.length === 0) {
          return {
            found: false,
            error: "Nessun ordine trovato",
          }
        }

        return {
          found: true,
          orders: orders.map((order) => ({
            id: order.id,
            status: order.status,
            total: order.totalAmount,
            data: order.createdAt,
          })),
        }
      }
    } catch (error) {
      logger.error("Error fetching order status:", error)
      return {
        found: false,
        error: "Si è verificato un errore nel recupero dello stato dell'ordine",
      }
    }
  }

  /**
   * Aggiunge un prodotto al carrello
   */
  private async addToCart(
    customerId: string,
    productName: string,
    quantity: number,
    workspaceId: string
  ): Promise<any> {
    try {
      // Cerca il prodotto
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId,
          isActive: true,
          name: {
            contains: productName,
            mode: "insensitive",
          },
        },
      })

      if (!products || products.length === 0) {
        return {
          success: false,
          error: "Prodotto non trovato",
          product_not_found: true,
        }
      }

      // Seleziona il primo prodotto della lista
      // (in futuro si potrebbe implementare una scelta più sofisticata)
      const product = products[0]

      // Verifica la disponibilità
      if (product.stock < quantity) {
        return {
          success: false,
          error: "Quantità non disponibile",
          available_quantity: product.stock,
        }
      }

      // Trova o crea il carrello
      let cart = await this.prisma.carts.findUnique({
        where: { customerId },
      })

      if (!cart) {
        cart = await this.prisma.carts.create({
          data: {
            customerId,
            workspaceId,
          },
        })
      }

      // Verifica se il prodotto è già nel carrello
      const existingItem = await this.prisma.cartItems.findFirst({
        where: {
          cartId: cart.id,
          productId: product.id,
        },
      })

      if (existingItem) {
        // Aggiorna la quantità
        await this.prisma.cartItems.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        })
      } else {
        // Aggiungi il nuovo prodotto
        await this.prisma.cartItems.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity,
          },
        })
      }

      // Ottieni il carrello aggiornato
      return await this.getCartInfo(customerId, workspaceId)
    } catch (error) {
      logger.error("Error adding product to cart:", error)
      return {
        success: false,
        error:
          "Si è verificato un errore nell'aggiunta del prodotto al carrello",
      }
    }
  }

  /**
   * Rimuove un prodotto dal carrello
   */
  private async removeFromCart(
    customerId: string,
    productName: string,
    quantity?: number,
    workspaceId?: string
  ): Promise<any> {
    try {
      // Trova il carrello
      const cart = await this.prisma.carts.findUnique({
        where: { customerId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          error: "Carrello vuoto o non trovato",
          cart_empty: true,
        }
      }

      // Trova gli item che corrispondono al nome del prodotto
      const matchingItems = cart.items.filter((item) =>
        item.product.name.toLowerCase().includes(productName.toLowerCase())
      )

      if (matchingItems.length === 0) {
        return {
          success: false,
          error: "Prodotto non trovato nel carrello",
        }
      }

      // Se ci sono più prodotti corrispondenti, scegliamo il primo
      const item = matchingItems[0]

      if (quantity && quantity < item.quantity) {
        // Diminuisci la quantità
        await this.prisma.cartItems.update({
          where: { id: item.id },
          data: { quantity: item.quantity - quantity },
        })
      } else {
        // Rimuovi completamente l'articolo
        await this.prisma.cartItems.delete({
          where: { id: item.id },
        })
      }

      // Ottieni il carrello aggiornato
      return await this.getCartInfo(customerId, workspaceId)
    } catch (error) {
      logger.error("Error removing product from cart:", error)
      return {
        success: false,
        error:
          "Si è verificato un errore nella rimozione del prodotto dal carrello",
      }
    }
  }

  /**
   * Ottiene una lista di prodotti, opzionalmente filtrata per categoria
   */
  private async getProductList(
    category?: string,
    limit: number = 10,
    workspaceId?: string
  ): Promise<any> {
    try {
      const where: any = {
        workspaceId,
        isActive: true,
      }

      // Se è specificata una categoria, aggiungi il filtro
      if (category) {
        where.category = {
          name: {
            contains: category,
            mode: "insensitive",
          },
        }
      }

      const products = await this.prisma.products.findMany({
        where,
        include: {
          category: true,
        },
        take: limit,
      })

      if (!products || products.length === 0) {
        return {
          found: false,
          products: [],
        }
      }

      return {
        found: true,
        count: products.length,
        products: products.map((product) => ({
          nome: product.name,
          prezzo: product.price,
          categoria: product.category?.name || "",
          disponibilità: product.stock > 0 ? "Disponibile" : "Non disponibile",
        })),
      }
    } catch (error) {
      logger.error("Error fetching product list:", error)
      return {
        found: false,
        error: "Si è verificato un errore nel recupero della lista prodotti",
      }
    }
  }

  /**
   * Cerca informazioni nelle FAQ
   */
  private async getFaqInfo(
    question: string,
    workspaceId: string
  ): Promise<any> {
    try {
      // Cerca nelle FAQ basandosi sulla domanda
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          workspaceId,
          isActive: true,
          OR: [
            {
              question: {
                contains: question,
                mode: "insensitive",
              },
            },
            {
              answer: {
                contains: question,
                mode: "insensitive",
              },
            },
          ],
        },
      })

      if (!faqs || faqs.length === 0) {
        return null
      }

      // Restituisci le FAQ rilevanti
      return {
        found: true,
        faqs: faqs.map((faq) => ({
          domanda: faq.question,
          risposta: faq.answer,
        })),
      }
    } catch (error) {
      logger.error("Error fetching FAQ info:", error)
      return null
    }
  }

  /**
   * Cerca informazioni nei documenti caricati usando similarità semantica
   */
  private async searchDocuments(
    query: string,
    workspaceId: string
  ): Promise<any> {
    try {
      logger.info(`Searching documents for query: "${query}" in workspace: ${workspaceId}`)

      if (!query || query.trim().length === 0) {
        return {
          error: "Search query cannot be empty",
          results: []
        }
      }

      // Use the document service to search
      const searchResults = await documentService.searchDocuments(query, workspaceId, 5)

      if (!searchResults || searchResults.length === 0) {
        return {
          message: "No relevant information found in the uploaded documents",
          query: query,
          results: []
        }
      }

      // Format results for the agent
      const formattedResults = searchResults.map(result => ({
        content: result.content,
        document_name: result.documentName,
        similarity_score: Math.round(result.similarity * 100) / 100, // Round to 2 decimal places
        source: `Document: ${result.documentName}`
      }))

      return {
        query: query,
        found_results: formattedResults.length,
        results: formattedResults,
        message: `Found ${formattedResults.length} relevant sections in the documents`
      }

    } catch (error) {
      logger.error(`Error searching documents:`, error)
      return {
        error: "Failed to search documents",
        message: "There was an error searching through the documents. Please try again later.",
        results: []
      }
    }
  }

  /**
   * Handles checkout link creation (PRD Implementation)
   */
  private async handleCreateCheckoutLink(
    phoneNumber: string,
    workspaceId: string,
    customerId?: string,
    message?: string
  ): Promise<any> {
    try {
      logger.info(`[CHECKOUT_HANDLER] Processing checkout for ${phoneNumber}`)
      
      const result = await createCheckoutLink({
        phoneNumber,
        workspaceId,
        customerId,
        message: message || "checkout"
      })
      
      logger.info(`[CHECKOUT_HANDLER] Checkout link created successfully`)
      
      return {
        success: true,
        checkout_url: result.checkoutUrl,
        checkout_token: result.checkoutToken,
        response_message: result.response,
        expires_at: result.expiresAt
      }
      
    } catch (error) {
      logger.error(`[CHECKOUT_HANDLER] Error creating checkout link:`, error)
      return {
        success: false,
        error: "Si è verificato un errore nella creazione del link checkout",
        fallback_message: "Per finalizzare l'ordine, contatta il nostro servizio clienti."
      }
    }
  }

  /**
   * Handles get all categories (PRD Implementation)
   */
  private async handleGetAllCategories(
    phoneNumber: string,
    workspaceId: string,
    customerId?: string,
    message?: string
  ): Promise<any> {
    try {
      logger.info(`[CATEGORIES_HANDLER] Getting categories for ${phoneNumber}`)
      
      const result = await getAllCategories({
        phoneNumber,
        workspaceId,
        customerId,
        message: message || "categorie"
      })
      
      logger.info(`[CATEGORIES_HANDLER] Found ${result.totalCategories} categories`)
      
      return {
        success: true,
        total_categories: result.totalCategories,
        categories: result.categories,
        response_message: result.response
      }
      
    } catch (error) {
      logger.error(`[CATEGORIES_HANDLER] Error getting categories:`, error)
      return {
        success: false,
        error: "Si è verificato un errore nel recupero delle categorie",
        fallback_message: "Per vedere le categorie disponibili, contatta il nostro servizio clienti."
      }
    }
  }

  /**
   * Handles get all products using the dedicated calling function
   */
  private async handleGetAllProducts(
    phoneNumber: string,
    workspaceId: string,
    customerId?: string,
    message?: string
  ): Promise<any> {
    try {
      logger.info(`[GET_ALL_PRODUCTS_HANDLER] Getting all products for ${phoneNumber}`)
      
      // Use the dedicated getAllProducts calling function
      const result = await getAllProducts({
        phoneNumber,
        workspaceId,
        customerId,
        message: message || "Lista prodotti"
      })
      
      logger.info(`[GET_ALL_PRODUCTS_HANDLER] Found ${result.totalProducts} products`)
      
      return {
        success: true,
        response: result.response,
        products: result.products,
        totalProducts: result.totalProducts
      }
      
    } catch (error) {
      logger.error(`[GET_ALL_PRODUCTS_HANDLER] Error getting products:`, error)
      return {
        success: false,
        response: "Si è verificato un errore nel recupero dei prodotti. Per favore riprova più tardi o contatta il nostro servizio clienti.",
        products: [],
        totalProducts: 0
      }
    }
  }

  /**
   * Restituisce un saluto basato sull'ora del giorno
   */
  private getTimeBasedGreeting(language: string): string {
    const hour = new Date().getHours()

    if (language === "it" || language === "IT" || language === "Italian") {
      if (hour < 12) return "Buongiorno"
      if (hour < 18) return "Buon pomeriggio"
      return "Buonasera"
    }

    if (language === "es" || language === "ES" || language === "Spanish") {
      if (hour < 12) return "Buenos días"
      if (hour < 18) return "Buenas tardes"
      return "Buenas noches"
    }

    if (language === "pt" || language === "PT" || language === "Portuguese") {
      if (hour < 12) return "Bom dia"
      if (hour < 18) return "Boa tarde"
      return "Boa noite"
    }

    // Default to English
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }
}
