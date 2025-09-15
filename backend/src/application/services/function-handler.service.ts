import { PrismaClient } from "@prisma/client"
import { confirmOrderFromConversation } from "../../chatbot/calling-functions/confirmOrderFromConversation"
import { generateCartLink } from "../../chatbot/calling-functions/generateCartLink"
import { getAllCategories } from "../../chatbot/calling-functions/getAllCategories"
import { getAllProducts } from "../../chatbot/calling-functions/getAllProducts"
import { MessageRepository } from "../../repositories/message.repository"
import { documentService } from "../../services/documentService"
import logger from "../../utils/logger"
import { PriceCalculationService } from "./price-calculation.service"
import { TokenService } from "./token.service"

interface FunctionCallResult {
  data: any
  functionName: string
}

// 🆕 DISAMBIGUATION SYSTEM INTERFACES
interface DisambiguationSession {
  sessionId: string
  customerId: string
  workspaceId: string
  query: string // Query originale "aggiungi vino al carrello"
  action: 'add' | 'remove' // Azione richiesta
  productQuery: string // "vino"
  quantity: number // 1
  products: ProductOption[] // Prodotti trovati 🔧 RENAMED
  expiresAt: Date // Scade dopo 5 minuti
  createdAt: number // Timestamp creazione
  lastActivity: number // Ultimo accesso
  userQuery: string // Query utente originale
}

interface ProductOption {
  id: string
  name: string
  price: number
  stock: number
  productCode: string
  index: number
  // 🆕 ADDITIONAL FIELDS FOR DISAMBIGUATION
  category?: string
  description?: string
  optionNumber: number
  icon: string
}

interface ParsedProduct {
  name: string
  quantity: number
  modifiers?: string[] // "grande", "piccolo", "bio"
}

interface DisambiguationResult {
  success: boolean
  action: 'resolved' | 'expired' | 'cancelled'
  selectedProduct?: ProductOption
  error?: string
}

/**
 * Service per gestire le chiamate di funzione dal function router
 */
export class FunctionHandlerService {
  private prisma: PrismaClient

  /**
   * 🎯 TASK: Clean up orphaned cart items (items with missing products)
   */
  private async cleanupOrphanedCartItems(workspaceId: string): Promise<void> {
    try {
      // Find cart items that reference non-existent products
      const orphanedItems = await this.prisma.cartItems.findMany({
        where: {
          cart: {
            workspaceId: workspaceId
          },
          product: null
        },
        include: {
          cart: true
        }
      })

      if (orphanedItems.length > 0) {
        console.warn(`🧹 Found ${orphanedItems.length} orphaned cart items in workspace ${workspaceId}`)
        
        // Delete orphaned items
        await this.prisma.cartItems.deleteMany({
          where: {
            id: {
              in: orphanedItems.map(item => item.id)
            }
          }
        })

        console.log(`🧹 Cleaned up ${orphanedItems.length} orphaned cart items`)
      }
    } catch (error) {
      console.error('❌ Error cleaning up orphaned cart items:', error)
    }
  }
  private messageRepository: MessageRepository
  private tokenService: TokenService
  private priceCalculationService: PriceCalculationService
  
  // 🆕 DISAMBIGUATION SESSION MANAGEMENT
  private disambiguationSessions: Map<string, DisambiguationSession> = new Map()
  private readonly SESSION_TTL = 5 * 60 * 1000 // 5 minuti in millisecondi

  constructor() {
    this.prisma = new PrismaClient()
    this.messageRepository = new MessageRepository()
    this.tokenService = new TokenService()
    this.priceCalculationService = new PriceCalculationService(this.prisma)
    
    // Auto-cleanup sessioni scadute ogni ora
    setInterval(() => this.cleanExpiredSessions(), 60 * 60 * 1000)
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
    logger.info(`🎯 FunctionHandlerService: Chiamata ricevuta per ${functionName}`, {
      functionName,
      params,
      customerId: customer?.id,
      workspaceId,
      phoneNumber
    })

    try {
      switch (functionName) {
        // 🛒 CART OPERATIONS - REMOVED (now handled via web link)






        // 📦 PRODUCT OPERATIONS  
        case 'get_all_products':
          return {
            data: await this.handleGetAllProducts(phoneNumber, workspaceId, customer?.id, ''),
            functionName
          }

        case 'get_all_categories':
          return {
            data: await this.handleGetAllCategories(phoneNumber, workspaceId, customer?.id, ''),
            functionName
          }

        case 'search_products':
          return {
            data: await this.searchProducts(params.query, workspaceId),
            functionName
          }

        // 🚚 ORDER OPERATIONS & 🛒 CART OPERATIONS
        case 'confirm_order':
          return {
            data: await confirmOrderFromConversation({
                ...params
              }),
              functionName
            }

        case 'generateCartLink':
          return {
            data: await generateCartLink(
              params,
              customer.id,
              workspaceId,
              phoneNumber
            ),
            functionName
          }

        // 📄 DOCUMENTATION & FAQ
        case 'search_documents':
          return {
            data: await this.searchDocuments(params.query, workspaceId),
            functionName
          }

        case 'get_faq_info':
          return {
            data: await this.getFaqInfo(params.question, workspaceId),
            functionName
          }

        // 🎯 DEFAULT CASE
        default:
          logger.warn(`⚠️ Funzione non riconosciuta: ${functionName}`)
          return {
            data: {
              success: false,
              error: `Funzione ${functionName} non supportata`,
              supportedFunctions: [
                'confirm_order',
                'generateCartLink',
                'get_all_products',
                'get_all_categories',
                'search_products',
                'search_documents',
                'get_faq_info'
              ]
            },
            functionName
          }
      }
    } catch (error) {
      logger.error(`❌ Errore in handleFunctionCall per ${functionName}:`, error)
      return {
        data: {
          success: false,
          error: error instanceof Error ? error.message : 'Errore interno del server',
          errorType: 'internal_error'
        },
        functionName
      }
    }
  }

  // =============================================================================
  // 🛒 CART METHODS
  // =============================================================================

  /**
   * Aggiunge un prodotto al carrello (versione semplice)
   */

  /**
   * Rimuove un prodotto dal carrello
   */
  async searchProducts(query: string, workspaceId: string): Promise<any> {
    try {
      const products = await this.prisma.products.findMany({
        where: {
          workspaceId,
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10
      })

      return {
        success: true,
        products: products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          productCode: product.ProductCode
        })),
        query,
        totalFound: products.length
      }
    } catch (error) {
      logger.error('❌ Errore in searchProducts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene tutti i prodotti
   */
  async handleGetAllProducts(phoneNumber: string, workspaceId: string, customerId: string, message: string): Promise<any> {
    try {
      const result = await getAllProducts({
        phoneNumber,
        workspaceId,
        customerId,
        message
      })

      return {
        success: true,
        response: result?.response || 'Prodotti ottenuti con successo',
        products: result?.products || [],
        totalProducts: result?.totalProducts || 0
      }
    } catch (error) {
      logger.error('❌ Errore in handleGetAllProducts:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene tutte le categorie
   */
  async handleGetAllCategories(phoneNumber: string, workspaceId: string, customerId: string, message: string): Promise<any> {
    try {
      const result = await getAllCategories({
        phoneNumber,
        workspaceId,
        customerId,
        message
      })

      return {
        success: true,
        total_categories: result?.totalCategories || 0,
        categories: result?.categories || [],
        response_message: result?.response || 'Categorie ottenute con successo'
      }
    } catch (error) {
      logger.error('❌ Errore in handleGetAllCategories:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  // =============================================================================
  // 📄 DOCUMENTATION METHODS
  // =============================================================================

  /**
   * Cerca nei documenti
   */
  async searchDocuments(query: string, workspaceId: string): Promise<any> {
    try {
      logger.info(`🔍 Ricerca documenti per query: "${query}" in workspace ${workspaceId}`)
      
      const results = await documentService.searchDocuments(query, workspaceId)
      
      return {
        success: true,
        results,
        query,
        workspaceId
      }
    } catch (error) {
      logger.error('❌ Errore in searchDocuments:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  /**
   * Ottiene informazioni FAQ
   */
  async getFaqInfo(question: string, workspaceId: string): Promise<any> {
    try {
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          workspaceId,
          isActive: true, // ✅ Only return active FAQs
          OR: [
            { question: { contains: question, mode: 'insensitive' } },
            { answer: { contains: question, mode: 'insensitive' } }
          ]
        },
        take: 5
      })

      return {
        success: true,
        faqs: faqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer
        })),
        query: question
      }
    } catch (error) {
      logger.error('❌ Errore in getFaqInfo:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore interno'
      }
    }
  }

  // =============================================================================
  // 🧹 UTILITY METHODS
  // =============================================================================

  /**
   * Pulisce le sessioni di disambiguazione scadute
   */
  private cleanExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, session] of this.disambiguationSessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TTL) {
        this.disambiguationSessions.delete(sessionId)
        logger.info(`🧹 Sessione scaduta rimossa: ${sessionId}`)
      }
    }
  }

  /**
   * Genera un saluto basato sull'ora del giorno
   */
  getTimeBasedGreeting(language: string = 'it'): string {
    const hour = new Date().getHours()
    
    if (language === 'en') {
      if (hour < 12) return 'Good morning!'
      if (hour < 18) return 'Good afternoon!'
      return 'Good evening!'
    }
    
    // Default italiano
    if (hour < 12) return 'Buongiorno!'
    if (hour < 18) return 'Buon pomeriggio!'
    return 'Buonasera!'
  }

  /**
   * Calcola il prezzo personalizzato per il cliente
   */
  async calculateCustomerPrice(basePrice: number, customerId: string | null = null): Promise<number> {
    if (!customerId) {
      return basePrice
    }

    try {
      const customer = await this.prisma.customers.findUnique({
        where: { id: customerId }
      })

      if (!customer) {
        logger.warn(`⚠️ Cliente non trovato: ${customerId}`)
        return basePrice
      }

      // Applica eventuali sconti personalizzati
      const discountPercent = customer.discount || 0
      return basePrice * (1 - discountPercent / 100)

    } catch (error) {
      logger.error('❌ Errore nel calcolo prezzo cliente:', error)
      return basePrice
    }
  }

  /**
   * Ottiene l'icona del prodotto
   */
  getProductIcon(productType: any): string {
    // Implementazione base
    return '📦'
  }
}