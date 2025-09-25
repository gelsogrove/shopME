import * as fs from "fs"
import * as path from "path"
import { LLMRequest } from "../types/whatsapp.types"
import { CallingFunctionsService } from "./calling-functions.service"
import { PromptProcessorService } from "./prompt-processor.service"

/**
Get Data - Trova customer
Get Workspace - Una sola chiamata (smart)
New User Check - Se customer non esiste
Block Check - Se customer è bloccato
Get Prompt - Recupera prompt attivo
Pre-processing - Replace variabili
Generate LLM - Chiamata OpenRouter
Post-processing - Format finale
 */
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
    console.log("🚀 LLM: handleMessage chiamato per telefono:", llmRequest.phone)
    
    const messageRepo =
      new (require("../repositories/message.repository").MessageRepository)()
    const { replaceAllVariables } = require("../services/formatter")
    const { workspaceService } = require("../services/workspace.service")
    const { FormatterService } = require("../services/formatter.service")

    // 1. Get Data
    console.log("📞 LLM: Cerco customer per telefono:", llmRequest.phone)
    let customer = await messageRepo.findCustomerByPhone(llmRequest.phone)
    console.log("👤 LLM: Customer trovato:", customer ? customer.id : "NESSUNO")
    
    const workspaceId = customer ? customer.workspaceId : llmRequest.workspaceId
    console.log("🏢 LLM: WorkspaceId utilizzato:", workspaceId)
    const workspace = await workspaceService.getById(workspaceId)

    if (!customer) {
      // 2. Se è un nuovo utente (non registrato)
      const welcomeMessage = await messageRepo.getWelcomeMessage(
        workspace.id,
        workspace.language || "it"
      )
      return {
        success: false,
        output:
          welcomeMessage ||
          "👋 Benvenuto! Devi prima registrarti per utilizzare i nostri servizi.",
        debugInfo: { stage: "new_user" },
      }
    }

    // 3. Blocca se blacklisted - non salvare nulla nello storico
    const isBlocked = await messageRepo.isCustomerBlacklisted(
      customer.phone,
      workspace.id
    )
    if (isBlocked || customer.isBlacklisted) {
      // Restituisci null per ignorare completamente questa interazione
      return null
    }

    // 4. Get prompt
    console.log("📝 LLM: Cerco prompt per workspace:", workspace.id)
    const prompt = await workspaceService.getActivePromptByWorkspaceId(
      workspace.id
    )
    console.log("📝 LLM: Prompt trovato:", prompt ? "SÌ" : "NO")
    if (prompt) {
      console.log("📝 LLM: Prompt preview:", prompt.substring(0, 100) + "...")
    }
    
    if (!prompt) {
      console.log("❌ LLM: PROMPT VUOTO - ESCO")
      return {
        success: false,
        output: "❌ Servizio temporaneamente non disponibile.",
        debugInfo: { stage: "no_prompt" },
      }
    }

    // 5. Pre-processing:
    const faqs = await messageRepo.getActiveFaqs(workspace.id)
    const products = (await messageRepo.getActiveProducts(workspace.id)) || ""
    const languageMap = {
      en: "Inglese",
      es: "Spagnolo",
      it: "Italiano",
      pt: "Portoghese",
    }
    const userLanguage = customer.language || workspace.language || "it"
    const translatedLanguage = languageMap[userLanguage] || "Italiano"

    const userInfo = {
      nameUser: customer.name || "",
      discountUser: customer.discount || "",
      companyName: customer.company || "",
      lastordercode: customer.lastOrderCode || "",
      languageUser: translatedLanguage,
    }

    if (!faqs && !products) {
      return {
        success: false,
        output: "❌ Non ci sono FAQ o Prodotti disponibili.",
        debugInfo: { stage: "no_faq_or_product" },
      }
    }

    let promptWithVars = prompt
      .replace("{{FAQ}}", faqs)
      .replace("{{PRODUCTS}}", products)
    promptWithVars = replaceAllVariables(promptWithVars, userInfo)

    // 6. generateLLMResponse
    console.log("PROMPT LLM:", promptWithVars)

    // 🔧 SALVA IL PROMPT FINALE PER DEBUG
    try {
      const promptPath = path.join(process.cwd(), "prompt.txt")
      fs.writeFileSync(
        promptPath,
        `=== PROMPT GENERATO ${new Date().toISOString()} ===\n\n${promptWithVars}\n\n=== FINE PROMPT ===\n`
      )
      console.log("✅ Prompt salvato in prompt.txt")
    } catch (error) {
      console.log("❌ Errore salvando prompt:", error.message)
    }

    const rawLLMResponse = await this.generateLLMResponse(
      promptWithVars,
      llmRequest.chatInput,
      workspace,
      customer
    )

    // 7. Post-processing: Replace link tokens
    let finalResponse = rawLLMResponse

    // Replace dei link con token
    if (finalResponse.includes("[LINK_CHECKOUT_WITH_TOKEN]")) {
      // TODO: Implementare generazione link carrello con token
      finalResponse = finalResponse.replace(
        "[LINK_CHECKOUT_WITH_TOKEN]",
        `https://shop.example.com/checkout?token=${customer.id}`
      )
    }

    if (finalResponse.includes("[LINK_PROFILE_WITH_TOKEN]")) {
      // TODO: Implementare generazione link profilo con token
      finalResponse = finalResponse.replace(
        "[LINK_PROFILE_WITH_TOKEN]",
        `https://shop.example.com/profile?token=${customer.id}`
      )
    }

    if (finalResponse.includes("[LINK_ORDERS_WITH_TOKEN]")) {
      // TODO: Implementare generazione link ordini con token
      finalResponse = finalResponse.replace(
        "[LINK_ORDERS_WITH_TOKEN]",
        `https://shop.example.com/orders?token=${customer.id}`
      )
    }

    return {
      success: true,
      output: finalResponse,
      debugInfo: { stage: "completed" },
    }
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
            "Fornisce il link per tracciare la spedizione dell'ordine dell'utente. Usare quando l'utente vuole sapere dove si trova fisicamente il pacco o quando arriva, senza specificare un numero d'ordine.",
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
    customer: any
  ): Promise<string> {
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
            model: "openai/gpt-4-mini",
            messages: messages,
            tools: this.getAvailableFunctions(),
            temperature: workspace.temperature || 0.3,
            max_tokens: workspace.maxTokens || 1500,
          }),
        }
      )

      const data = await response.json()

      // Gestione tool calls (CF chiamate da OpenRouter)
      if (data.choices?.[0]?.message?.tool_calls) {
        const toolCall = data.choices[0].message.tool_calls[0]
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments || "{}")

        // Esegui la CF e restituisci direttamente il risultato finale
        const functionResult = await this.executeFunctionCall(
          functionName,
          functionArgs,
          customer,
          workspace
        )

        // Le CF restituiscono già una risposta finale formattata, non serve seconda chiamata LLM
        return (
          functionResult.message ||
          functionResult.output ||
          "Operazione completata con successo."
        )
      }

      const llmResponse =
        data.choices?.[0]?.message?.content || "Ciao! Come posso aiutarti oggi?"

      return llmResponse
    } catch (error) {
      console.error("❌ Error generating LLM response:", error)
      return "❌ Mi dispiace, si è verificato un errore. Riprova più tardi."
    }
  }

  private async executeFunctionCall(
    functionName: string,
    args: any,
    customer: any,
    workspace: any
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
          return await this.callingFunctionsService.getShipmentTrackingLink({
            customerId: customer.id,
            workspaceId: workspace.id,
            orderCode: args.orderCode || customer.lastOrderCode,
          })

        case "GetLinkOrderByCode":
          return await this.callingFunctionsService.getOrdersListLink({
            customerId: customer.id,
            workspaceId: workspace.id,
            orderCode: args.orderCode || customer.lastOrderCode,
          })

        default:
          return { error: "Funzione non riconosciuta" }
      }
    } catch (error) {
      console.error(`❌ Error executing function ${functionName}:`, error)
      return { error: `Errore nell'esecuzione della funzione ${functionName}` }
    }
  }
}
