/**
 * Formatter Service
 *
 * Simple service with one method that formats responses to Markdown
 */

export class FormatterService {
  // Cache for translated category names
  private static categoryTranslationCache: Map<string, string> = new Map()

  /**
   * Main formatting method - takes input, replaces tokens, and returns Markdown formatted output
   *
   * @param data - The raw response text/data from CF or searchRag (can contain tokens)
   * @param question - The user's original question
   * @param nameUser - The user's name
   * @param discount - The user's discount percentage
   * @param customerId - Customer ID for token replacement
   * @param workspaceId - Workspace ID for token replacement
   * @param language - Target language (it, en, es, pt)
   * @returns Promise<string> - Formatted Markdown response with replaced tokens
   */
  static async formatToMarkdown(
    data: string,
    question: string,
    nameUser: string,
    discount: number,
    customerId: string,
    workspaceId: string,
    language: string = "it"
  ): Promise<string> {
    console.log("🔧 FORMATTER: === INIZIO FORMATTING ===")
    console.log("📊 FORMATTER: Parametri ricevuti:", {
      data: data ? `"${data.substring(0, 100)}..."` : "null/undefined",
      dataLength: data?.length || 0,
      question: question || "null/undefined", 
      nameUser: nameUser || "null/undefined",
      discount: discount !== undefined ? discount : "undefined",
      customerId: customerId || "null/undefined",
      workspaceId: workspaceId || "null/undefined",
      language: language || "null/undefined"
    })

    if (!data || data.trim() === "") {
      console.log("❌ FORMATTER: Data vuoto o nullo")
      return language === "it"
        ? "Nessuna risposta disponibile."
        : "No response available."
    }

    // 1. REPLACE TOKENS FIRST
    let processedInput = data
    console.log("🔄 FORMATTER: Iniziando sostituzione token...")
    try {
      processedInput = await this.replaceTokens(
        data,
        question,
        nameUser,
        discount,
        customerId,
        workspaceId,
        language
      )
      console.log("✅ FORMATTER: Token replacement completato")
      console.log("📝 FORMATTER: Dati dopo token replacement:", {
        originalLength: data.length,
        processedLength: processedInput.length,
        changed: data !== processedInput,
        preview: processedInput.substring(0, 200) + "..."
      })
    } catch (error) {
      console.error("❌ FORMATTER: Token replacement error:", error.message)
      console.error("📋 FORMATTER: Error stack:", error.stack)
      // Continue with original data if token replacement fails
    }

    // 2. HANDLE JSON FAQs
    try {
      const parsed = JSON.parse(processedInput)
      if (parsed?.results?.faqs?.length > 0) {
        const faq = parsed.results.faqs[0]
        let content = faq.content || ""

        // Clean up FAQ content
        content = content
          .replace(/^Question:\s*.*?\nAnswer:\s*/i, "")
          .replace(/^Answer:\s*/i, "")
          .trim()

        return content
      }
    } catch (e) {
      // Not JSON, continue with LLM formatting
    }

    // Use LLM to format to Markdown
    const prompt = `Tu sei un assistente esperto nella formattazione Markdown per un negozio di prodotti italiani.

UTENTE: ${nameUser}
SCONTO UTENTE: ${discount}%
DOMANDA UTENTE: ${question}
DATI DA FORMATTARE: ${processedInput}
LINGUA TARGET: ${language}

ISTRUZIONI:
1. **LISTE PRODOTTI**: Se il testo contiene prodotti JSON:
   - Raggruppa per categoria: ## Nome Categoria
   - Formato prodotto: - **Nome** — Formato — Prezzo: €X.XX
   - NON mostrare stock o codici

2. **FORMATTAZIONE MARKDOWN**:
   - **Grassetto** per nomi importanti
   - ## per intestazioni 
   - - per bullet points
   - [Testo](url) per link
   - *Corsivo* per enfasi

3. **REGOLE**:
   - Mantieni ESATTAMENTE i dati originali
   - NON inventare nulla
   - Personalizza con il nome utente: ${nameUser}
   - Se lo sconto è > 0, menziona il ${discount}% di sconto disponibile
   - Rispondi in ${language === "it" ? "italiano" : language === "en" ? "inglese" : language === "es" ? "spagnolo" : "portoghese"}

Restituisci testo formattato in Markdown arricchiendo le risposte e saludando l'utente per nome, ciao, bentornato, :`

    console.log("🤖 FORMATTER: Invio richiesta a OpenRouter...")
    console.log("📤 FORMATTER: Prompt length:", prompt.length)
    
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopME Formatter",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
          }),
        }
      )

      console.log("📡 FORMATTER: Response status:", response.status)
      
      if (!response.ok) {
        console.error("❌ FORMATTER: OpenRouter error:", response.status)
        console.error("📋 FORMATTER: Response text:", await response.text())
        return data // Return original on error
      }

      const result = await response.json()
      console.log("📨 FORMATTER: Raw LLM response:", {
        hasContent: !!result.choices?.[0]?.message?.content,
        contentLength: result.choices?.[0]?.message?.content?.length || 0,
        fullResponse: result
      })
      
      const formatted = result.choices?.[0]?.message?.content || data

      console.log("✅ FORMATTER: Successfully formatted to Markdown")
      console.log("📄 FORMATTER: Final result:", {
        length: formatted.length,
        preview: formatted.substring(0, 200) + "..."
      })
      console.log("🔧 FORMATTER: === FINE FORMATTING ===")
      return formatted.trim()
    } catch (error) {
      console.error("❌ FORMATTER: Error:", error)
      console.error("📋 FORMATTER: Error stack:", error.stack)
      console.log("🔧 FORMATTER: === FINE FORMATTING (CON ERRORE) ===")
      return data // Return original on error
    }
  }

  /**
   * Replaces tokens in the input text with real data from the database
   */
  private static async replaceTokens(
    text: string,
    question: string,
    nameUser: string,
    discount: number,
    customerId: string,
    workspaceId: string,
    language: string
  ): Promise<string> {
    let result = text

    // Handle [LIST_CATEGORIES] token
    if (result.includes("[LIST_CATEGORIES]")) {
      try {
        const {
          CategoryService,
        } = require("../application/services/category.service")
        const categoryService = new CategoryService()
        const categories = await categoryService.getAllForWorkspace(workspaceId)

        if (categories?.length > 0) {
          const translationService =
            new (require("./translation.service").TranslationService)()

          const translatedNames = await Promise.all(
            categories.map(async (category) => {
              const cacheKey = `${workspaceId}:${language}:${category.id}`
              if (this.categoryTranslationCache.has(cacheKey)) {
                return {
                  id: category.id,
                  name: this.categoryTranslationCache.get(cacheKey)!,
                }
              }

              try {
                const translated = await translationService.translateToLanguage(
                  category.name,
                  language
                )
                this.categoryTranslationCache.set(cacheKey, translated)
                return { id: category.id, name: translated }
              } catch (e) {
                return { id: category.id, name: category.name }
              }
            })
          )

          const categoriesList = categories
            .map((category) => {
              const translated =
                translatedNames.find((t: any) => t.id === category.id)?.name ||
                category.name
              const emoji = this.getCategoryEmoji(translated)
              return `- ${emoji} **${translated}**`
            })
            .join("\n")

          result = result.replace("[LIST_CATEGORIES]", categoriesList)
        }
      } catch (error) {
        console.error("❌ Error replacing [LIST_CATEGORIES]:", error.message)
      }
    }

    // Handle [USER_DISCOUNT] token
    if (result.includes("[USER_DISCOUNT]")) {
      if (discount > 0) {
        result = result.replace("[USER_DISCOUNT]", `${discount}%`)
      } else {
        result = result.replace(
          "[USER_DISCOUNT]",
          "Nessuno sconto attivo al momento 🙏"
        )
      }
    }

    // Handle [LINK_ORDERS_WITH_TOKEN] token
    if (result.includes("[LINK_ORDERS_WITH_TOKEN]")) {
      try {
        const {
          SecureTokenService,
        } = require("../application/services/secure-token.service")
        const secureTokenService = new SecureTokenService()

        const ordersToken = await secureTokenService.createToken(
          "orders",
          workspaceId,
          { customerId, workspaceId },
          "1h",
          undefined,
          undefined,
          undefined,
          customerId
        )

        const ordersLink = `http://localhost:3000/orders-public?token=${ordersToken}`
        result = result.replace("[LINK_ORDERS_WITH_TOKEN]", ordersLink)
      } catch (error) {
        console.error(
          "❌ Error replacing [LINK_ORDERS_WITH_TOKEN]:",
          error.message
        )
      }
    }

    // Handle [LIST_ALL_PRODUCTS] token
    if (result.includes("[LIST_ALL_PRODUCTS]")) {
      try {
        const {
          GetAllProducts,
        } = require("../chatbot/calling-functions/GetAllProducts")

        const productsResult = await GetAllProducts({
          phoneNumber: "unknown",
          workspaceId: workspaceId,
          customerId: customerId,
          message: "Get all products",
          language: language,
        })

        if (productsResult.response) {
          result = result.replace(
            /\[LIST_ALL_PRODUCTS\]/g,
            productsResult.response
          )
        }
      } catch (error) {
        console.error("❌ Error replacing [LIST_ALL_PRODUCTS]:", error.message)
        const fallback =
          language === "it"
            ? "Nessun prodotto disponibile al momento"
            : "No products available at the moment"
        result = result.replace(/\[LIST_ALL_PRODUCTS\]/g, fallback)
      }
    }

    // Handle other tokens using ReplaceLinkWithToken
    const hasOtherTokens = [
      "[LIST_SERVICES]",
      "[LIST_OFFERS]",
      "[LIST_ACTIVE_OFFERS]",
      "[LINK_PROFILE_WITH_TOKEN]",
      "[LINK_CART_WITH_TOKEN]",
      "[LINK_TRACKING_WITH_TOKEN]",
      "[LINK_CHECKOUT_WITH_TOKEN]",
      "[LINK_LAST_ORDER_INVOICE_WITH_TOKEN]",
    ].some((token) => result.includes(token))

    if (hasOtherTokens) {
      try {
        const {
          ReplaceLinkWithToken,
        } = require("../chatbot/calling-functions/ReplaceLinkWithToken")

        let detectedOrderCode: string | undefined = undefined
        try {
          const parsedResp = JSON.parse(result)
          if (parsedResp?.orderCode) {
            detectedOrderCode = parsedResp.orderCode
          }
        } catch (e) {
          // Not JSON, ignore
        }

        const replaceResult = await ReplaceLinkWithToken(
          { response: result, orderCode: detectedOrderCode },
          customerId,
          workspaceId
        )

        if (replaceResult.success && replaceResult.response) {
          result = replaceResult.response
        }
      } catch (error) {
        console.error("❌ Error replacing other tokens:", error.message)
      }
    }

    return result
  }

  /**
   * Gets appropriate emoji for category name
   */
  private static getCategoryEmoji(categoryName: string): string {
    const lowerCategory = categoryName.toLowerCase()

    if (
      lowerCategory.includes("cheese") ||
      lowerCategory.includes("dairy") ||
      lowerCategory.includes("formaggi") ||
      lowerCategory.includes("latticini")
    ) {
      return "🧀"
    } else if (
      lowerCategory.includes("frozen") ||
      lowerCategory.includes("surgelati") ||
      lowerCategory.includes("gelati")
    ) {
      return "🧊"
    } else if (
      lowerCategory.includes("sauce") ||
      lowerCategory.includes("salsa") ||
      lowerCategory.includes("preserve") ||
      lowerCategory.includes("conserve")
    ) {
      return "🍅"
    } else if (
      lowerCategory.includes("spice") ||
      lowerCategory.includes("spezie") ||
      lowerCategory.includes("herb") ||
      lowerCategory.includes("erbe")
    ) {
      return "🌿"
    } else if (
      lowerCategory.includes("pasta") ||
      lowerCategory.includes("rice")
    ) {
      return "🍝"
    } else if (
      lowerCategory.includes("meat") ||
      lowerCategory.includes("salumi") ||
      lowerCategory.includes("salami")
    ) {
      return "🍖"
    } else if (
      lowerCategory.includes("water") ||
      lowerCategory.includes("beverage") ||
      lowerCategory.includes("bevanda")
    ) {
      return "💧"
    } else if (
      lowerCategory.includes("flour") ||
      lowerCategory.includes("baking") ||
      lowerCategory.includes("farina")
    ) {
      return "🌾"
    } else if (
      lowerCategory.includes("tomato") ||
      lowerCategory.includes("pomodoro")
    ) {
      return "🍅"
    } else {
      return "📦"
    }
  }
}
