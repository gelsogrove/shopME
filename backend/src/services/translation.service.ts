import axios from "axios"

export class TranslationService {
  private openRouterApiKey: string
  private openRouterUrl: string

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || ""
    this.openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
    console.log(
      "🔑 Translation service initialized with API key:",
      this.openRouterApiKey ? "EXISTS" : "MISSING"
    )
  }

  public async translateToEnglish(
    text: string,
    hasConversationHistory: boolean = false
  ): Promise<string> {
    try {
      console.log("🌐 Translating text to English:", text)
      console.log("🧠 Has conversation history:", hasConversationHistory)

      // All text should be translated - no hardcoded exceptions

      // Translation should work for all text - no hardcoded product names

      // Proceed with translation for all text
      console.log("🔧 Proceeding with translation")

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: await this.getTranslationPrompt(),
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.0, // Zero temperature for translations - no creative interpretations
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe Translation Service",
          },
          timeout: 10000,
        }
      )

      const translation =
        response.data.choices[0]?.message?.content?.trim() || text
      console.log("✅ Translation successful:")
      console.log("🔧 ORIGINAL:", text)
      console.log("🔧 TRANSLATED:", translation)
      return translation
    } catch (error) {
      console.error(
        "❌ Translation failed, using original text:",
        error instanceof Error ? error.message : "Unknown error"
      )
      return text
    }
  }

  public async translateToLanguage(
    text: string,
    targetLanguage: string
  ): Promise<string> {
    try {
      console.log(`🌐 Translating text to ${targetLanguage}:`, text)

      const languageNames = {
        it: "Italian",
        en: "English",
        es: "Spanish",
        pt: "Portuguese",
      }

      const targetLangName = languageNames[targetLanguage] || "Italian"

      const response = await axios.post(
        this.openRouterUrl,
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a translator for an Italian e-commerce platform. Translate the following text to ${targetLangName} using e-commerce terminology. CRITICAL RULES: 
            1. NEVER translate Italian product names, food names, or brand names. Keep them exactly as they are in Italian.
            2. For ${targetLangName} responses, use appropriate greetings and e-commerce language.
            3. Maintain the same tone and structure as the original text.
            4. Return ONLY the translation, no explanations.`,
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.0, // Zero temperature for translations - no creative interpretations
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3001",
            "X-Title": "ShopMe Translation Service",
          },
          timeout: 10000,
        }
      )

      const translation =
        response.data.choices[0]?.message?.content?.trim() || text
      console.log(`✅ Translation to ${targetLanguage} successful:`)
      console.log("  Original:", text)
      console.log("  Translated:", translation)
      return translation
    } catch (error) {
      console.error(`❌ Translation to ${targetLanguage} error:`, error)
      return text // Return original text if translation fails
    }
  }

  // Removed hardcoded English detection - all text should be translated

  private async getTranslationPrompt(): Promise<string> {
    try {
      // REGOLA 11: Get translation prompt from database instead of hardcoding
      const { PrismaClient } = require("@prisma/client")
      const prisma = new PrismaClient()

      const prompt = await prisma.prompts.findFirst({
        where: {
          name: "translation_prompt",
        },
        select: {
          content: true,
        },
      })

      await prisma.$disconnect()

      if (prompt && prompt.content) {
        console.log("✅ Translation prompt loaded from database")
        return prompt.content
      } else {
        console.log(
          "⚠️ Translation prompt not found in database, using fallback"
        )
        return `You are a translator for an Italian e-commerce platform. Translate the user's message to English using e-commerce terminology while following the CRITICAL RULES below.

CRITICAL RULES:
1. NEVER TRANSLATE Italian product names, food names, dish names, or brand names. Preserve them EXACTLY as they appear in the user's message (including accents, punctuation and casing). Examples: "Tiramisù" stays "Tiramisù", "Torta sacher" stays "Torta sacher", "Curry in Polvere" stays "Curry in Polvere".

2. IF the user's message is a product availability, search or price query, EXTRACT AND RETURN ONLY THE PRODUCT NAME, exactly as it appears in the message. Remove surrounding words such as "avete", "do you have", "cerco", "prezzo", "quanto costa", etc., and return only the product name. Examples:
   - "avete mozzarella?" -> "mozzarella"
   - "do you have mozzarella" -> "mozzarella"
   - "vendete la mozzarella?" -> "mozzarella"
   - "sto cercando la Mozzarella di Bufala Campana" -> "Mozzarella di Bufala Campana"
   - "avete fior di Bufala" -> "fior di Bufala"
   - "Dimmi il prezzo del Sugo all'Arrabbiata" -> "Sugo all'Arrabbiata"
   - "Prezzo della Torta sacher?" -> "Torta sacher"
   - "Prezzo del Tiramisù?" -> "Tiramisù"
   - "Curry in Polvere" -> "Curry in Polvere"
   - sono solo esempi devi togliere sempre "Prezzo, VEndete, Avete, Cerco, Quanto costa, Dimmi il prezzo di, etc."
   - NON TRADURRE NOMI ITALIANI DI PRODOTTI

3. FOR ANY OTHER TEXT (not a product query), return a faithful English translation, but ALWAYS KEEP Italian product/dish/brand names UNCHANGED (do not translate them to English).

4. Return ONLY the translated sentence or the extracted product name. DO NOT add explanations, extra text, or markup. If you extract a product name, return it exactly as in the original (preserve accents).
`
      }
    } catch (error) {
      console.error("❌ Error getting translation prompt from database:", error)
      return "You are a translator for an Italian e-commerce platform. Translate the user's message to English using e-commerce terminology. CRITICAL RULE: NEVER translate Italian product names, food names, or brand names. Keep them exactly as they are in Italian. Return ONLY the English translation, no explanations."
    }
  }
}
