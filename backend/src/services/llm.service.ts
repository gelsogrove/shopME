import * as fs from "fs"
import * as path from "path"
import { TokenService } from "../application/services/token.service"
import { urlShortenerService } from "../application/services/url-shortener.service"
import { LLMRequest } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { PromptProcessorService } from "./prompt-processor.service"

//todo non va il singoloo ordine
export class LLMService {
  private callingFunctionsService: CallingFunctionsService
  private promptProcessorService: PromptProcessorService

  constructor() {
    this.callingFunctionsService = new CallingFunctionsService()
    this.promptProcessorService = new PromptProcessorService()
  }

  async handleMessage(
    llmRequest: LLMRequest,
    customerData?: any
  ): Promise<any> {
    console.log(
      "🚀 LLM: handleMessage chiamato per telefono:",
      llmRequest.phone
    )

    const messageRepo =
      new (require("../repositories/message.repository").MessageRepository)()
    const { replaceAllVariables } = require("../services/formatter")
    const { workspaceService } = require("../services/workspace.service")

    // 1. Get Data
    let customer = await messageRepo.findCustomerByPhone(llmRequest.phone)
    const workspaceId = customer ? customer.workspaceId : llmRequest.workspaceId
    const workspace = await workspaceService.getById(workspaceId)

    // Get agent config for LLM settings
    const agentConfig = workspace.agentConfigs?.[0]
    console.log(
      `🔧 LLM: Workspace config - llmModel: ${agentConfig?.model || 'default'}, temperature: ${agentConfig?.temperature || 'default'} (type: ${typeof agentConfig?.temperature})`
    )

    // 2. New User Check
    if (!customer) {
      console.log("🆕 LLM: New user detected, calling NewUser method")
      return await this.NewUser(llmRequest, workspace, messageRepo)
    }

    console.log(
      `🔍 LLM: Existing customer found - id: ${customer.id}, phone: ${customer.phone}, activeChatbot: ${customer.activeChatbot}, isBlacklisted: ${customer.isBlacklisted}`
    )

    // 3. Blocca se blacklisted o se activeChatbot è false - non salvare nulla nello storico
    const isBlocked = await messageRepo.isCustomerBlacklisted(
      customer.phone,
      workspace.id
    )

    // Check if chatbot is active for this customer
    const isChatbotInactive = customer.activeChatbot === false

    if (isBlocked || customer.isBlacklisted || isChatbotInactive) {
      console.log(
        `🚫 LLM: Customer blocked - isBlocked: ${isBlocked}, isBlacklisted: ${customer.isBlacklisted}, isChatbotInactive: ${isChatbotInactive}`
      )
      // Restituisci stringa speciale IGNORE per fermare il processo
      return "IGNORE"
    }

    // 4. Get prompt
    const prompt = await workspaceService.getActivePromptByWorkspaceId(
      workspace.id
    )

    if (!prompt) {
      return {
        success: false,
        output: "❌ Servizio temporaneamente non disponibile.",
        debugInfo: { stage: "no_prompt" },
      }
    }

    // 5. Pre-processing:
    const userLanguage = customer.language || workspace.language || "it"
    const faqs = await messageRepo.getActiveFaqs(workspace.id)
    const services = await messageRepo.getActiveServices(workspace.id)
    const categories = await messageRepo.getActiveCategories(workspace.id)
    const offers = await messageRepo.getActiveOffers(workspace.id, userLanguage)
    const customerDiscount = customer.discount || 0
    const products =
      (await messageRepo.getActiveProducts(workspace.id, customerDiscount)) ||
      ""

    const userInfo = {
      nameUser: customer.name || "",
      discountUser: customer.discount || 0,
      companyName: customer.company || "",
      lastordercode:
        customerData?.lastordercode || customer.lastOrderCode || "",
      languageUser: this.getLanguageDisplayName(userLanguage),
    }

    if (!faqs && !products && !services && !categories) {
      return {
        success: false,
        output:
          "❌ Non ci sono FAQ, Prodotti, Servizi o Categorie disponibili.",
        debugInfo: { stage: "no_faq_or_product_or_services_or_categories" },
      }
    }

    let promptWithVars = prompt
      .replace("{{FAQ}}", faqs)
      .replace("{{SERVICES}}", services)
      .replace("{{PRODUCTS}}", products)
      .replace("{{CATEGORIES}}", categories)
      .replace("{{OFFERS}}", offers)
    promptWithVars = replaceAllVariables(promptWithVars, userInfo)

    // 🔧 SALVA IL PROMPT FINALE PER DEBUG
    try {
      const promptPath = path.join(process.cwd(), "prompt.txt")
      fs.writeFileSync(
        promptPath,
        `=== PROMPT GENERATO ${new Date().toISOString()} ===\n\n${promptWithVars}\n\n=== FINE PROMPT ===\n`
      )
    } catch (error) {
      console.log("❌ Errore salvando prompt:", error.message)
    }

    // 6. Generate LLM Response with debug info
    const rawLLMResult = await this.generateLLMResponse(
      promptWithVars,
      llmRequest.chatInput,
      workspace,
      customer,
      customerData,
      userLanguage
    )

    // 7. Post-processing: Replace link tokens
    const linkResult = await this.replaceLinkTokens(
      rawLLMResult.response,
      customer,
      workspace
    )

    return {
      success: true,
      output: linkResult.finalResponse,
      debugInfo: {
        stage: "completed",
        model: rawLLMResult.debugInfo.model,
        temperature: rawLLMResult.debugInfo.temperature,
        functionCall: rawLLMResult.debugInfo.functionCall,
        functionParams: rawLLMResult.debugInfo.functionParams,
        tokenReplacements: linkResult.tokenReplacements,
        error: rawLLMResult.debugInfo.error || false,
      },
      functionCalls: rawLLMResult.debugInfo.functionCall
        ? [
            {
              functionName: rawLLMResult.debugInfo.functionCall,
              source: "LLM",
              toolCall: {
                function: {
                  name: rawLLMResult.debugInfo.functionCall,
                  arguments: JSON.stringify(
                    rawLLMResult.debugInfo.functionParams || {}
                  ),
                },
              },
            },
          ]
        : [],
    }
  }

  /**
   * Converte il codice lingua nel nome visualizzato corretto per il prompt
   * @param languageCode Codice lingua (it, en, es, pt)
   * @returns Nome lingua per il prompt
   */
  private getLanguageDisplayName(languageCode: string): string {
    const languageMap: Record<string, string> = {
      it: "ITALIANO",
      en: "ENGLISH",
      es: "ESPAÑOL",
      pt: "Português",
    }
    return languageMap[languageCode] || languageCode.toUpperCase()
  }

  /**
   * Replace all link tokens in the response with actual URLs
   */
  private async replaceLinkTokens(
    response: string,
    customer: any,
    workspace: any
  ): Promise<{ finalResponse: string; tokenReplacements: string[] }> {
    let finalResponse = response
    const tokenReplacements: string[] = []

    // Replace checkout link token
    if (finalResponse.includes("[LINK_CHECKOUT_WITH_TOKEN]")) {
      const checkoutLink = await this.callingFunctionsService.getCartLink({
        customerId: customer.id,
        workspaceId: workspace.id,
      })
      let linkUrl = checkoutLink?.linkUrl || ""

      // Create short URL if we have a valid long URL
      if (linkUrl) {
        try {
          const shortResult = await urlShortenerService.createShortUrl(
            linkUrl,
            workspace.id
          )
          linkUrl = `http://localhost:3001${shortResult.shortUrl}`
          console.log(`📎 LLMService: Created short checkout link: ${linkUrl}`)
        } catch (error) {
          console.warn(
            "⚠️ LLMService: Failed to create short URL, using long URL:",
            error
          )
        }
      }

      finalResponse = finalResponse.replace(
        "[LINK_CHECKOUT_WITH_TOKEN]",
        linkUrl
      )
      tokenReplacements.push("REPLACE LINK_CHECKOUT_WITH_TOKEN with getCartLink")
    }

    // Replace profile link token
    if (finalResponse.includes("[LINK_PROFILE_WITH_TOKEN]")) {
      const profileResult =
        await this.callingFunctionsService.replaceLinkWithToken(
          finalResponse,
          "profile",
          customer.id,
          workspace.id
        )
      finalResponse = finalResponse.replace(
        "[LINK_PROFILE_WITH_TOKEN]",
        profileResult?.message?.match(/https?:\/\/[^\s)]+/)?.[0] || ""
      )
      tokenReplacements.push("REPLACE LINK_PROFILE_WITH_TOKEN with replaceLinkWithToken")
    }

    // Replace orders link token
    if (finalResponse.includes("[LINK_ORDERS_WITH_TOKEN]")) {
      const ordersLink = await this.callingFunctionsService.getOrdersListLink({
        customerId: customer.id,
        workspaceId: workspace.id,
      })
      let linkUrl = ordersLink?.linkUrl || ""

      // Create short URL if we have a valid long URL
      if (linkUrl) {
        try {
          const shortResult = await urlShortenerService.createShortUrl(
            linkUrl,
            workspace.id
          )
          linkUrl = `http://localhost:3001${shortResult.shortUrl}`
          console.log(`📎 LLMService: Created short orders link: ${linkUrl}`)
        } catch (error) {
          console.warn(
            "⚠️ LLMService: Failed to create short URL for orders, using long URL:",
            error
          )
        }
      }

      finalResponse = finalResponse.replace("[LINK_ORDERS_WITH_TOKEN]", linkUrl)
      tokenReplacements.push("REPLACE LINK_ORDERS_WITH_TOKEN with getOrdersListLink")
    }

    // Replace catalog link token
    if (finalResponse.includes("[LINK_CATALOG]")) {
      const catalogResult =
        await this.callingFunctionsService.replaceLinkWithToken(
          finalResponse,
          "catalog",
          customer.id,
          workspace.id
        )
      if (catalogResult?.success && catalogResult?.message) {
        finalResponse = catalogResult.message
      }
      tokenReplacements.push("REPLACE LINK_CATALOG with replaceLinkWithToken")
    }

    return { finalResponse, tokenReplacements }
  }

  private getAvailableFunctions() {
    return [
      {
        type: "function",
        function: {
          name: "ContactOperator",
          description:
            "Connette l'utente con un operatore umano per assistenza specializzata. Usare quando l'utente richiede esplicitamente di parlare con un operatore o assistenza umana.",
          parameters: {
            type: "object",
            properties: {},
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetShipmentTrackingLink",
          description:
            "Fornisce il link per tracciare la spedizione dell'ordine dell'utente. Usare quando l'utente vuole sapere dove si trova fisicamente il pacco o lo stato di spedizione. Se specificato un numero d'ordine, usa quello; altrimenti usa l'ultimo ordine.",
          parameters: {
            type: "object",
            properties: {
              orderCode: {
                type: "string",
                description:
                  "Il codice dell'ordine da tracciare. Se l'utente specifica un numero d'ordine (es. 'dove ordine ORD-123'), usa quello. Se dice 'ultimo ordine' usa lastordercode. Opzionale.",
              },
            },
            required: [],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "GetLinkOrderByCode",
          description:
            "Fornisce il link per visualizzare un ordine specifico tramite codice ordine. Usare quando l'utente vuole vedere un ordine specifico, la fattura, o dice 'ultimo ordine'.",
          parameters: {
            type: "object",
            properties: {
              orderCode: {
                type: "string",
                description:
                  "Il codice dell'ordine da visualizzare. Se l'utente dice 'ultimo ordine' usa il lastordercode.",
              },
            },
            required: ["orderCode"],
          },
        },
      },
    ]
  }

  private async generateLLMResponse(
    processedPrompt: string,
    userQuery: string,
    workspace: any,
    customer: any,
    customerData?: any,
    language: "it" | "es" | "pt" | "en" = "it" // default italiano
  ): Promise<{ response: string; debugInfo: any }> {
    // Get agent config for LLM settings
    const agentConfig = workspace.agentConfigs?.[0]
    
    // Capture model and temperature for debug info outside try block
    const modelUsed = agentConfig?.model || "anthropic/claude-3.5-sonnet"
    const temperatureUsed = agentConfig?.temperature !== undefined && agentConfig?.temperature !== null 
      ? agentConfig.temperature 
      : 0.1

    console.log(
      `🔧 LLM: Using model: ${modelUsed}, temperature: ${temperatureUsed} (agentConfig.temperature was: ${agentConfig?.temperature}, type: ${typeof agentConfig?.temperature})`
    )

    try {
      const messages = [
        {
          role: "system",
          content: processedPrompt,
        },
        {
          role: "user",
          content: userQuery,
        },
      ]

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe LLM Response",
          },
          body: JSON.stringify({
            model: modelUsed,
            messages: messages,
            tools: this.getAvailableFunctions(),
            temperature: temperatureUsed,
            max_tokens: agentConfig?.maxTokens || 5000,
          }),
        }
      )
      console.log("***language", language)
      console.log("🌐 OpenRouter status:", response.status)
      const data = await response.json()
      console.log("🌐 OpenRouter response:", JSON.stringify(data, null, 2))

      // Dizionario messaggi multilingua
      const i18n = {
        errors: {
          orderNotFound: {
            it: "Mi spiace non abbiamo trovato il tuo ordine. Di seguito la lista dei tuoi ordini: [LINK_ORDERS_WITH_TOKEN]",
            es: "Lo siento, no hemos encontrado tu pedido. Aquí tienes la lista de tus pedidos: [LINK_ORDERS_WITH_TOKEN]",
            pt: "Desculpe, não encontramos o seu pedido. Aqui está a lista dos seus pedidos: [LINK_ORDERS_WITH_TOKEN]",
            en: "Sorry, we couldn't find your order. Here is the list of your orders: [LINK_ORDERS_WITH_TOKEN]",
          },
          trackingNotFound: {
            it: "Mi spiace, al momento non riesco a trovare informazioni di tracking per il tuo ordine. Per assistenza contatta il nostro servizio clienti.",
            es: "Lo siento, en este momento no puedo encontrar información de seguimiento de tu pedido. Para asistencia contacta nuestro servicio de atención al cliente.",
            pt: "Desculpe, no momento não consigo encontrar informações de rastreamento do seu pedido. Para assistência, entre em contato com nosso atendimento ao cliente.",
            en: "Sorry, I can't find tracking information for your order right now. Please contact our customer service for assistance.",
          },
          generic: {
            it: "Si è verificato un errore.",
            es: "Se ha producido un error.",
            pt: "Ocorreu um erro.",
            en: "An error has occurred.",
          },
        },
        success: {
          orderLink: {
            it: "Ciao! Di seguito puoi trovare il link dell'ordine che stai cercando dove puoi scaricare la fattura e la bolla di trasporto:",
            es: "¡Hola! Aquí tienes el enlace de tu pedido donde puedes descargar la factura y la nota de envío:",
            pt: "Olá! Aqui está o link do seu pedido onde você pode baixar a fatura e a guia de transporte:",
            en: "Hello! Here is the link to your order where you can download the invoice and delivery note:",
          },
          trackingLink: {
            it: "Ciao! Il tuo ordine è in viaggio 📦 Segui il pacco in tempo reale:",
            es: "¡Hola! Tu pedido está en camino 📦 Sigue tu paquete en tiempo real:",
            pt: "Olá! Seu pedido está a caminho 📦 Acompanhe seu pacote em tempo real:",
            en: "Hello! Your order is on the way 📦 Track your package in real time:",
          },
          default: {
            it: "Ciao! 😊 Di seguito puoi vedere il tuo ordine: per motivi di sicurezza sarà valido per 1 ora -",
            es: "¡Hola! 😊 Aquí puedes ver tu pedido: por motivos de seguridad será válido durante 1 hora -",
            pt: "Olá! 😊 Aqui você pode ver seu pedido: por motivos de segurança será válido por 1 hora -",
            en: "Hello! 😊 Here you can see your order: for security reasons it will be valid for 1 hour -",
          },
        },
        fallback: {
          it: "Ciao! Come posso aiutarti oggi?",
          es: "¡Hola! ¿Cómo puedo ayudarte hoy?",
          pt: "Olá! Como posso te ajudar hoje?",
          en: "Hello! How can I help you today?",
        },
      }

      // Gestione tool calls (chiamate funzioni)
      if (data.choices?.[0]?.message?.tool_calls) {
        const toolCall = data.choices[0].message.tool_calls[0]
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments || "{}")

        const functionResult = await this.executeFunctionCall(
          functionName,
          functionArgs,
          customer,
          workspace,
          customerData
        )

        if (functionResult.success === false) {
          if (functionName === "GetLinkOrderByCode") {
            return {
              response: i18n.errors.orderNotFound[language],
              debugInfo: {
                model: modelUsed,
                temperature: temperatureUsed,
                functionCall: functionName,
                functionParams: functionArgs,
                effectiveParams: functionResult.effectiveParams,
              },
            }
          }
          if (functionName === "GetShipmentTrackingLink") {
            return {
              response: i18n.errors.trackingNotFound[language],
              debugInfo: {
                model: modelUsed,
                temperature: temperatureUsed,
                functionCall: functionName,
                functionParams: functionArgs,
                effectiveParams: functionResult.effectiveParams,
              },
            }
          }
          return {
            response:
              functionResult.message ||
              functionResult.error ||
              i18n.errors.generic[language],
            debugInfo: {
              model: modelUsed,
              temperature: temperatureUsed,
              functionCall: functionName,
              functionParams: functionArgs,
              effectiveParams: functionResult.effectiveParams,
            },
          }
        }

        if (functionName === "GetLinkOrderByCode") {
          return {
            response: `${i18n.success.orderLink[language]} ${functionResult.linkUrl || functionResult.output || functionResult.message} - ${
              language === "it"
                ? "valido per 1 ora"
                : language === "es"
                  ? "válido por 1 hora"
                  : language === "pt"
                    ? "válido por 1 hora"
                    : "valid for 1 hour"
            }`,
            debugInfo: {
              model: modelUsed,
              temperature: temperatureUsed,
              functionCall: functionName,
              functionParams: functionArgs,
              effectiveParams: functionResult.effectiveParams,
            },
          }
        }

        if (functionName === "GetShipmentTrackingLink") {
          return {
            response: `${i18n.success.trackingLink[language]} ${functionResult.linkUrl}`,
            debugInfo: {
              model: modelUsed,
              temperature: temperatureUsed,
              functionCall: functionName,
              functionParams: functionArgs,
              effectiveParams: functionResult.effectiveParams,
            },
          }
        }

        return {
          response:
            functionResult.message ||
            functionResult.output ||
            functionResult.linkUrl ||
            `${i18n.success.default[language]} ${functionResult.linkUrl}`,
          debugInfo: {
            model: modelUsed,
            temperature: temperatureUsed,
            functionCall: functionName,
            functionParams: functionArgs,
            effectiveParams: functionResult.effectiveParams,
          },
        }
      }

      const llmResponse =
        data.choices?.[0]?.message?.content || i18n.fallback[language]

      console.log("🎯 LLM Final Response:", llmResponse)
      return {
        response: llmResponse,
        debugInfo: {
          model: modelUsed,
          temperature: temperatureUsed,
          functionCall: null,
          functionParams: null,
        },
      }
    } catch (error) {
      console.error("❌ Error generating LLM response:", error)
      const errorMessages = {
        it: "❌ Mi dispiace, si è verificato un errore. Riprova più tardi.",
        es: "❌ Lo siento, se ha producido un error. Inténtalo más tarde.",
        pt: "❌ Desculpe, ocorreu um erro. Tente novamente mais tarde.",
        en: "❌ Sorry, an error occurred. Please try again later.",
      }
      return {
        response: errorMessages[language],
        debugInfo: {
          model: modelUsed,
          temperature: temperatureUsed,
          error: true,
          functionCall: null,
          functionParams: null,
        },
      }
    }
  }

  private async executeFunctionCall(
    functionName: string,
    args: any,
    customer: any,
    workspace: any,
    customerData?: any
  ): Promise<any> {
    try {
      switch (functionName) {
        case "ContactOperator":
          return await this.callingFunctionsService.contactOperator({
            customerId: customer.id,
            workspaceId: workspace.id,
            phoneNumber: customer.phone,
          })

        case "GetShipmentTrackingLink":
          const trackingOrderCode =
            args.orderCode ||
            customerData?.lastordercode ||
            customer.lastOrderCode
          console.log(
            "🔧 GetShipmentTrackingLink - Original args:",
            args,
            "Effective orderCode:",
            trackingOrderCode
          )
          const trackingResult =
            await this.callingFunctionsService.getShipmentTrackingLink({
              customerId: customer.id,
              workspaceId: workspace.id,
              orderCode: trackingOrderCode,
            })
          // Add effectiveParams for debug
          return {
            ...trackingResult,
            effectiveParams: { orderCode: trackingOrderCode },
          }

        case "GetLinkOrderByCode":
          const orderCodeForLink =
            args.orderCode ||
            customerData?.lastordercode ||
            customer.lastOrderCode
          console.log(
            "🔧 GetLinkOrderByCode - Original args:",
            args,
            "Effective orderCode:",
            orderCodeForLink
          )
          const orderResult =
            await this.callingFunctionsService.getOrdersListLink({
              customerId: customer.id,
              workspaceId: workspace.id,
              orderCode: orderCodeForLink,
            })
          // Add effectiveParams for debug
          return {
            ...orderResult,
            effectiveParams: { orderCode: orderCodeForLink },
          }

        default:
          return { error: "Funzione non riconosciuta" }
      }
    } catch (error) {
      console.error(`❌ Error executing function ${functionName}:`, error)
      return { error: `Errore nell'esecuzione della funzione ${functionName}` }
    }
  }

  // Funzione helper per generare il messaggio di benvenuto con link di registrazione
  private async newUserLink(
    phone: string,
    workspaceId: string,
    welcomeMessage: string
  ): Promise<string> {
    const registrationLink = await this.generateRegistrationLink(
      phone,
      workspaceId
    )
    if (welcomeMessage.includes("[LINK_REGISTRATION_WITH_TOKEN]")) {
      return welcomeMessage.replace(
        "[LINK_REGISTRATION_WITH_TOKEN]",
        registrationLink
      )
    } else {
      return (
        welcomeMessage + `\nPer registrarti clicca qui: ${registrationLink}`
      )
    }
  }
  private async generateRegistrationLink(
    phone: string,
    workspaceId: string
  ): Promise<string> {
    // Crea un token di registrazione e restituisci il link completo
    const tokenService = new TokenService()
    const messageRepo =
      new (require("../repositories/message.repository").MessageRepository)()
    const token = await tokenService.createRegistrationToken(phone, workspaceId)
    const workspaceUrl = await messageRepo.getWorkspaceUrl(workspaceId)
    const registrationLink = `${workspaceUrl.replace(/\/$/, "")}/register?token=${token}`

    // Create short URL for registration link
    try {
      const {
        URLShortenerService,
      } = require("../application/services/url-shortener.service")
      const urlShortenerService = new URLShortenerService()

      const shortResult = await urlShortenerService.createShortUrl(
        registrationLink,
        workspaceId
      )
      const finalRegistrationLink = `${workspaceUrl.replace(/\/$/, "")}${shortResult.shortUrl}`

      console.log(
        `📎 Created short registration link: ${finalRegistrationLink} → ${registrationLink}`
      )
      return finalRegistrationLink
    } catch (shortError) {
      console.warn(
        "⚠️ Failed to create short URL for registration, using long URL:",
        shortError
      )
      return registrationLink
    }
  }

  // Funzione che gestisce il flusso per un nuovo utente e ritorna direttamente l'oggetto di risposta
  private async NewUser(
    llmRequest: LLMRequest,
    workspace: any,
    messageRepo: any
  ): Promise<any> {
    let welcomeMessage = await messageRepo.getWelcomeMessage(
      workspace.id,
      workspace.language || "it"
    )
    welcomeMessage =
      welcomeMessage ||
      "👋 Benvenuto! Devi prima registrarti per utilizzare i nostri servizi."

    const output = await this.newUserLink(
      llmRequest.phone,
      workspace.id,
      welcomeMessage
    )
    return {
      success: false,
      output,
      debugInfo: { stage: "new_user" },
    }
  }
}
