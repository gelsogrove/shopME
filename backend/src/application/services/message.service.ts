import { MessageRepository } from "../../infrastructure/repositories/message.repository"
import {
    detectGreeting as detectGreetingLang,
    detectLanguage,
    getLanguageDbCode,
    normalizeDatabaseLanguage,
    SupportedLanguage
} from "../../utils/language-detector"
import logger from "../../utils/logger"
import { TokenService } from "./token.service"

// Customer interface che include activeChatbot
interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
  discount?: number
  language?: string
  currency?: string
  notes?: string
  isActive: boolean
  activeChatbot?: boolean // Flag per il controllo manuale dell'operatore
  // Altri campi che potrebbero essere necessari...
  createdAt: Date
  updatedAt: Date
  push_notifications_consent_at?: Date
}

// Define metadata interface to fix the type error
interface MessageMetadata {
  agentName?: string
  [key: string]: any
}

/**
 * Service for processing messages
 */
export class MessageService {
  private messageRepository: MessageRepository
  private tokenService: TokenService

  constructor() {
    this.messageRepository = new MessageRepository()
    this.tokenService = new TokenService()
  }

  /**
   * Get the message repository instance
   * @returns MessageRepository instance
   */
  getMessageRepository(): MessageRepository {
    return this.messageRepository
  }

  /**
   * Controlla se il messaggio è un saluto in una delle lingue supportate
   * @param text Testo del messaggio
   * @returns Codice lingua del saluto o null se non è un saluto
   */
  private detectGreeting(text: string): string | null {
    // Use the imported function from the language-detector utility
    return detectGreetingLang(text);
  }

  /**
   * Controlla se c'è già stato un messaggio di benvenuto recente
   * @param phoneNumber Il numero di telefono dell'utente
   * @param workspaceId L'ID del workspace
   * @returns True se c'è già stato un messaggio di benvenuto, false altrimenti
   */
  private async hasRecentWelcomeMessage(
    phoneNumber: string,
    workspaceId: string
  ): Promise<boolean> {
    try {
      // Ottieni gli ultimi 30 messaggi per assicurarci di avere una cronologia sufficiente
      const recentMessages = await this.messageRepository.getLatesttMessages(
        phoneNumber,
        30
      )

      // Log dettagliato per debug
      logger.info(
        `[hasRecentWelcomeMessage] Checking for welcome messages for ${phoneNumber}, found ${recentMessages.length} recent messages`
      )

      // Considera solo i messaggi delle ultime 24 ore
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // IMPORTANTE: Filtro più semplice e diretto - Controlla se c'è QUALSIASI messaggio in uscita nelle ultime 24 ore
      // Questo assicura che se l'utente ha ricevuto qualsiasi messaggio dal sistema nelle ultime 24 ore,
      // non riceverà un nuovo messaggio di benvenuto
      const hasAnyOutboundMessage = recentMessages.some(
        (msg) => msg.direction === "OUTBOUND" && msg.createdAt > oneDayAgo
      )

      if (hasAnyOutboundMessage) {
        logger.info(
          `[hasRecentWelcomeMessage] Found recent outbound message for ${phoneNumber}, not sending welcome message again`
        )
        return true
      }

      // Se non ci sono messaggi in uscita recenti, controlla specificamente per i messaggi di benvenuto
      const hasWelcomeMessage = recentMessages.some((msg) => {
        // Deve essere un messaggio in uscita (dal sistema all'utente)
        if (msg.direction !== "OUTBOUND" || msg.createdAt <= oneDayAgo) {
          return false
        }

        // Controlla se è specificatamente un messaggio di benvenuto
        const isWelcome =
          // Controlla il metadata (più affidabile)
          (msg.metadata &&
            (msg.metadata as MessageMetadata)?.agentSelected === "Welcome") ||
          (msg.metadata &&
            (msg.metadata as MessageMetadata)?.agentName === "Welcome") ||
          // Controlla il contenuto (backup)
          (msg.content &&
            (msg.content.toLowerCase().includes("welcome") ||
              msg.content.toLowerCase().includes("benvenuto") ||
              msg.content.toLowerCase().includes("bienvenido") ||
              msg.content.toLowerCase().includes("bem-vindo") ||
              (msg.content.includes("register?") &&
                (msg.content.includes("http://") ||
                  msg.content.includes("https://")))))

        if (isWelcome) {
          logger.info(
            `[hasRecentWelcomeMessage] Found welcome message: ${msg.content?.substring(
              0,
              50
            )}...`
          )
        }

        return isWelcome
      })

      // Log del risultato finale
      logger.info(
        `[hasRecentWelcomeMessage] Result for ${phoneNumber}: ${
          hasAnyOutboundMessage || hasWelcomeMessage
        }`
      )

      // Restituisci true se abbiamo trovato qualsiasi messaggio in uscita o specificamente un messaggio di benvenuto
      return hasAnyOutboundMessage || hasWelcomeMessage
    } catch (error) {
      logger.error(
        "[hasRecentWelcomeMessage] Error checking for welcome messages:",
        error
      )
      // In caso di errore, per sicurezza consideriamo che non ci sia stato un messaggio di benvenuto
      return false
    }
  }

  /**
   * Process a message and return a response
   *
   * @param message The message to process
   * @param phoneNumber The phone number of the sender
   * @param workspaceId The ID of the workspace
   * @returns The processed message
   */
  async processMessage(
    message: string,
    phoneNumber: string,
    workspaceId: string
  ): Promise<string> {
    let response = ""
    let agentSelected = "" // Variable to track the selected agent
    let messageSaved = false // Flag to track if the message has been saved
    let detectedLanguage: SupportedLanguage = 'en' // Default language

    try {
      logger.info(
        `Processing message: "${message}" from ${phoneNumber} for workspace ${workspaceId}`
      )

      // Detect language of the incoming message
      detectedLanguage = detectLanguage(message)
      logger.info(`Detected language for message: ${detectedLanguage}`)

      // Check if workspace exists and is active
      const workspaceSettings =
        await this.messageRepository.getWorkspaceSettings(workspaceId)

      if (!workspaceSettings) {
        logger.error(`Workspace with ID ${workspaceId} not found in database`)
        return "Workspace not found. Please contact support."
      }

      if (!workspaceSettings.isActive) {
        logger.warn(`Workspace ${workspaceId} exists but is inactive`)
        // Multilingua: prendi la lingua dal customer se esiste
        let userLang = undefined
        let customer = await this.messageRepository.findCustomerByPhone(
          phoneNumber,
          workspaceId
        )
        if (customer && customer.language) {
          userLang = normalizeDatabaseLanguage(customer.language)
        } else if (detectedLanguage) {
          // If customer has no language preference set, use detected language
          userLang = detectedLanguage
        }
        
        let wipMessages = workspaceSettings.wipMessages || {}
        let msg =
          userLang && wipMessages[userLang]
            ? wipMessages[userLang]
            : wipMessages["en"] || "WhatsApp channel is inactive"
        return msg
      }

      // Check if customer is in blacklist
      const isBlacklisted = await this.messageRepository.isCustomerBlacklisted(
        phoneNumber,
        workspaceId
      )
      if (isBlacklisted) {
        // Non fare nulla, non salvare nei log, ritornare null
        // L'utente bloccato scriverà a vuoto senza ricevere risposte
        return null
      }

      // Check if customer exists - simplified binary check
      let customer = await this.messageRepository.findCustomerByPhone(
        phoneNumber,
        workspaceId
      )

      // Se è un saluto, controlliamo se dobbiamo inviare un messaggio di benvenuto
      const greetingLang = this.detectGreeting(message)

      // Update customer language preference if we have a customer
      if (customer) {
        // Only update if language preference is different from detected language
        const currentLang = normalizeDatabaseLanguage(customer.language || "ENG")
        if (currentLang !== detectedLanguage) {
          logger.info(`Updating customer language from ${currentLang} to ${detectedLanguage}`)
          
          // Convert detected language to database format
          const dbLanguageCode = getLanguageDbCode(detectedLanguage)
          
          // Update the customer's language preference
          await this.messageRepository.updateCustomerLanguage(
            customer.id, 
            dbLanguageCode
          )
          
          // Update the local customer object with new language
          customer.language = dbLanguageCode
        }
      }

      // Se il customer NON esiste (nuovo utente)
      if (!customer) {
        // Se il messaggio NON è un saluto, non rispondere
        if (!greetingLang) {
          logger.info(
            `New user detected with non-greeting message - not responding`
          )
          return null
        }
        // Se è un saluto, invia il messaggio di benvenuto/registrazione
        if (workspaceSettings.welcomeMessages && greetingLang) {
          const welcomeMessages = workspaceSettings.welcomeMessages as Record<string, string>
          const token = await this.tokenService.createRegistrationToken(phoneNumber, workspaceId)
          let baseUrl = workspaceSettings.url || process.env.FRONTEND_URL || "https://example.com"
          if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = "https://" + baseUrl
          }
          const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(phoneNumber)}&workspace=${workspaceId}&token=${token}`
          
          // Use detected language for new users
          const langForWelcome = greetingLang || detectedLanguage
          
          let welcomeMessage = welcomeMessages[langForWelcome] || welcomeMessages["en"]
          if (!welcomeMessage) {
            welcomeMessage = "Welcome! Please register here: {link}"
          }
          response = welcomeMessage
            .replace("{link}", registrationUrl)
            .replace("{phone}", phoneNumber)
            .replace("{workspace}", workspaceId)
          if (!response.includes("http")) {
            response += `\n\n: ${registrationUrl}`
          }
          
          // Create customer with detected language
          await this.messageRepository.createCustomer({
            name: "Unknown Customer",
            email: `customer-${Date.now()}@example.com`,
            phone: phoneNumber,
            workspaceId,
            language: getLanguageDbCode(detectedLanguage) // Set detected language
          })
          
          agentSelected = "Welcome"
          await this.messageRepository.saveMessage({
            workspaceId,
            phoneNumber,
            message,
            response,
            agentSelected,
          })
          messageSaved = true
          return response
        }
      }

      // Check if the chatbot is active for this customer
      if (customer && (customer as Customer).activeChatbot === false) {
        logger.info(
          `Operator manual control active for ${phoneNumber} (${customer.name}). Chatbot response skipped.`
        )
        // Save the message without response (only store the user message)
        await this.messageRepository.saveMessage({
          workspaceId,
          phoneNumber,
          message,
          response: "",
          agentSelected: "Manual Operator Control",
        })
        messageSaved = true // Mark message as saved
        // Return empty string to indicate no bot response should be sent
        return ""
      }

      // Se è un saluto e c'è già stato un messaggio di benvenuto recente, non rispondere
      if (
        greetingLang &&
        (await this.hasRecentWelcomeMessage(phoneNumber, workspaceId))
      ) {
        logger.info(
          `Repeated greeting detected from ${phoneNumber}, not sending welcome message again`
        )
        // Impostiamo direttamente la risposta vuota e l'agente NoResponse
        // e salviamo il messaggio immediatamente
        await this.messageRepository.saveMessage({
          workspaceId,
          phoneNumber,
          message,
          response: "",
          agentSelected: "NoResponse", // Indichiamo che abbiamo scelto di non rispondere
        })
        messageSaved = true // Mark message as saved

        logger.debug(`Saved repeated greeting with agentSelected: NoResponse`)

        // Impostare response a una stringa vuota e saltare il resto della funzione
        return ""
      }

      // Se ci sono messaggi di benvenuto configurati, rispondi con un messaggio di benvenuto
      // solo per saluti riconosciuti
      if (workspaceSettings.welcomeMessages && greetingLang) {
        const welcomeMessages = workspaceSettings.welcomeMessages as Record<
          string,
          string
        >

        // Genera un token per la registrazione
        const token = await this.tokenService.createRegistrationToken(
          phoneNumber,
          workspaceId
        )

        // Assicuriamoci che baseUrl contenga il protocollo HTTP
        let baseUrl =
          workspaceSettings.url ||
          process.env.FRONTEND_URL ||
          "https://example.com"

        // Aggiungi il protocollo se mancante
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
          baseUrl = "https://" + baseUrl
        }

        // Costruisci l'URL di registrazione completo
        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(
          phoneNumber
        )}&workspace=${workspaceId}&token=${token}`

        // Per i saluti, usa la lingua del saluto, altrimenti fallback a inglese
        let welcomeMessage =
          welcomeMessages[greetingLang] || welcomeMessages["en"]

        if (!welcomeMessage) {
          welcomeMessage = "Welcome! Please register here: {link}"
        }

        // Log per debug
        logger.debug(`Registration URL: ${registrationUrl}`)

        // Sostituisci i placeholder
        response = welcomeMessage
          .replace("{link}", registrationUrl)
          .replace("{phone}", phoneNumber)
          .replace("{workspace}", workspaceId)

        // Verifica che il link sia stato correttamente sostituito
        if (!response.includes("http")) {
          logger.warn(
            `Registration link not properly included in welcome message. Adding it explicitly.`
          )
          response += `\n\n ${registrationUrl}`
        }

        // Crea un record temporaneo del cliente se non esiste
        if (!customer) {
          await this.messageRepository.createCustomer({
            name: "Unknown Customer",
            email: `customer-${Date.now()}@example.com`,
            phone: phoneNumber,
            workspaceId,
          })
        }

        agentSelected = "Welcome"

        await this.messageRepository.saveMessage({
          workspaceId,
          phoneNumber,
          message,
          response,
          agentSelected,
        })
        messageSaved = true // Mark message as saved

        return response
      }

      // If customer doesn't exist and didn't send a standard greeting, return null
      if (!customer && !greetingLang) {
        logger.info(
          "New user detected with non-standard greeting - not responding"
        )
        return null
      }

      // If customer doesn't exist, send registration link with secure token
      if (!customer) {
        logger.info(
          "New user detected - sending registration link with secure token"
        )

        // Generate secure registration token
        const token = await this.tokenService.createRegistrationToken(
          phoneNumber,
          workspaceId
        )

        // Assicuriamoci che baseUrl contenga il protocollo HTTP
        let baseUrl =
          workspaceSettings.url ||
          process.env.FRONTEND_URL ||
          "https://laltroitalia.shop"

        // Aggiungi il protocollo se mancante
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
          baseUrl = "https://" + baseUrl
        }

        // Costruisci l'URL di registrazione completo
        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(
          phoneNumber
        )}&workspace=${workspaceId}&token=${token}`

        // Get workspace name for personalized message if available
        let workspaceName = "our service"
        if (workspaceSettings.name) {
          workspaceName = workspaceSettings.name
        }

        // Ottieni la lingua dal saluto o usa l'inglese come fallback
        const language = greetingLang || "en"

        // Usa il metodo getWelcomeMessage per generare un messaggio di benvenuto multilingua
        if (workspaceSettings.welcomeMessages) {
          response = this.getWelcomeMessage(
            workspaceSettings.welcomeMessages,
            language,
            registrationUrl,
            phoneNumber,
            workspaceId
          )
        } else {
          // Fallback al messaggio di benvenuto standard
          response = `Welcome to ${workspaceName}! To continue with our service, please complete your registration here: ${registrationUrl}`
        }

        // Create temporary customer record
        let tempCustomer = await this.messageRepository.findCustomerByPhone(
          phoneNumber,
          workspaceId
        )
        if (!tempCustomer) {
          tempCustomer = await this.messageRepository.createCustomer({
            name: "Unknown Customer",
            email: `customer-${Date.now()}@example.com`,
            phone: phoneNumber,
            workspaceId,
          })
          logger.info(`Created temporary customer record: ${tempCustomer.id}`)
        }

        agentSelected = "Registration" // Set the agent used as "Registration"
        return response
      }

      // Check if customer is registered (has completed registration)
      // Consider customer unregistered if name is "Unknown Customer" - this is the default name for new customers
      if (customer.name === "Unknown Customer") {
        logger.info(
          `User with phone ${phoneNumber} is still unregistered - showing registration link again`
        )

        // Generate secure registration token
        const token = await this.tokenService.createRegistrationToken(
          phoneNumber,
          workspaceId
        )

        // Assicuriamoci che baseUrl contenga il protocollo HTTP
        let baseUrl =
          workspaceSettings.url ||
          process.env.FRONTEND_URL ||
          "https://laltroitalia.shop"

        // Aggiungi il protocollo se mancante
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
          baseUrl = "https://" + baseUrl
        }

        const registrationUrl = `${baseUrl}/register?phone=${encodeURIComponent(
          phoneNumber
        )}&workspace=${workspaceId}&token=${token}`

        // Create reminder message
        response = `Per favore completa la registrazione prima di continuare: ${registrationUrl}`

        agentSelected = "Registration" // Set the agent used as "Registration"
        return response
      }

      // Process message for existing customer
      logger.info("Processing existing customer message")
      try {
        const routerAgentPrompt = await this.messageRepository.getRouterAgent()
        const products = await this.messageRepository.getProducts()
        const services = await this.messageRepository.getServices()
        const chatHistory = await this.messageRepository.getLatesttMessages(
          phoneNumber,
          30
        )

        try {
          logger.info(`=== MESSAGE PROCESSING START ===`)
          logger.info(`USER MESSAGE: "${message}"`)

          // Get the agent for this workspace
          const agent = await this.messageRepository.getAgentByWorkspaceId(workspaceId)
          if (!agent) {
            throw new Error(`No agent found for workspace ${workspaceId}`)
          }

          // 1. Select the appropriate agent with the router
          const selectedAgent = await this.messageRepository.getResponseFromAgent(
            agent,
            message
          )
          logger.info(`AGENT SELECTED: "${selectedAgent.name}"`)

          // Save the name of the selected agent
          agentSelected = selectedAgent.name || "Unknown"

          // Add customer information and function calls to the agent context
          this.enrichAgentContext(selectedAgent, customer)

          // Process agent prompt to replace variables like {customerLanguage}
          if (selectedAgent.content && customer) {
            // Replace customerLanguage placeholder with actual customer language
            // Per utenti registrati usiamo la lingua salvata nel loro profilo
            const customerLanguage = customer.language || "Enlglish"
            logger.info(`Using customer language: ${customerLanguage}`)

            selectedAgent.content = selectedAgent.content.replace(
              /\{customerLanguage\}/g,
              customerLanguage
            )
          }

          // 2. Generate the prompt enriched with product and service context
          const systemPrompt = await this.messageRepository.getResponseFromRag(
            selectedAgent,
            message,
            products,
            services,
            chatHistory,
            customer
          )
          logger.info(`SYSTEM PROMPT: "${systemPrompt}"`)

          // 3. Convert systemPrompt to conversation prompt
          response = await this.messageRepository.getConversationResponse(
            chatHistory,
            message,
            systemPrompt
          )
          logger.info(`FINAL PROMPT: "${response}"`)

          // The agent info will be added by the frontend which will read the agentSelected field from the database
        } catch (apiError) {
          agentSelected = "Error"
          response = apiError.toString()
        }
        return response
      } catch (processingError) {
        agentSelected = "Error"
        return "Error processing customer message:" + processingError
      }
    } catch (error) {
      logger.error("Error processing message:", error)
      agentSelected = "System"
      return "Sorry, there was an error processing your message. Please try again later."
    } finally {
      // Save both the user message and our response in one call
      // Ma solo se non è già stato salvato in uno dei percorsi precedenti
      if (!messageSaved) {
        try {
          await this.messageRepository.saveMessage({
            workspaceId,
            phoneNumber,
            message,
            response,
            agentSelected, // Pass the selected agent to the repository
          })
          logger.info("Message saved successfully")
        } catch (saveError) {
          logger.error("Error saving message:", saveError)
        }
      }
    }
  }

  /**
   * Genera un messaggio di benvenuto multilingua
   * @param welcomeMessages Oggetto con i messaggi di benvenuto in diverse lingue
   * @param language Lingua preferita
   * @param registrationUrl URL per la registrazione
   * @returns Il messaggio di benvenuto nella lingua richiesta o in inglese
   */
  private getWelcomeMessage(
    welcomeMessages: any,
    language: string,
    registrationUrl: string,
    phoneNumber: string,
    workspaceId: string
  ): string {
    if (!welcomeMessages) {
      // Se mancano i messaggi di benvenuto, usa un messaggio predefinito
      return `Welcome! Please register here: ${registrationUrl}`
    }

    // Prova a usare il messaggio nella lingua rilevata
    let welcomeMsg = welcomeMessages[language] || welcomeMessages["en"]

    // Se non c'è un messaggio valido, usa un predefinito
    if (!welcomeMsg) {
      welcomeMsg = `Welcome! Please register here: {link}`
    }

    // Sostituisci il placeholder del link con l'URL di registrazione
    const result = welcomeMsg
      .replace("{link}", registrationUrl)
      .replace("{phone}", phoneNumber)
      .replace("{workspace}", workspaceId)

    // Verifica che il link sia stato correttamente sostituito
    if (!result.includes("http")) {
      return `${result}\n\n ${registrationUrl}`
    }

    return result
  }

  private getCustomerInfo(customer: Customer): string {
    let context = "## CUSTOMER INFORMATION\n"
    context += `Name: ${customer.name}\n`
    context += `Email: ${customer.email || "Not provided"}\n`
    context += `Phone: ${customer.phone || "Not provided"}\n`
    context += `Language: ${customer.language || "Italian"}\n`
    context += `Shipping Address: ${customer.address || "Not provided"}\n\n`
    return context
  }

  private getAvailableFunctions(): string {
    let context = "## AVAILABLE FUNCTIONS\n"
    context += "- searchProducts(query: string): Search for products\n"
    context += "- checkStock(productId: string): Check product availability\n"
    context += "- calculateShipping(address: string): Calculate shipping cost\n"
    context += "- placeOrder(products: string[]): Place a new order\n\n"
    return context
  }

  private enrichAgentContext(selectedAgent: any, customer: Customer): void {
    if (selectedAgent.content && customer) {
      selectedAgent.content = this.getCustomerInfo(customer) + 
                            this.getAvailableFunctions() + 
                            selectedAgent.content
    }
  }
}
