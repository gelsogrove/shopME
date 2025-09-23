import fs from "fs"
import path from "path"
import { MessageRepository } from "../repositories/message.repository"

export class PromptProcessorService {
  private messageRepository: MessageRepository

  constructor() {
    this.messageRepository = new MessageRepository()
  }

  /**
   * Pre-processa il prompt sostituendo i placeholder dinamici.
   * @param promptContent Il contenuto del prompt da processare.
   * @param workspaceId L'ID del workspace.
   * @param customerData I dati del cliente per la sostituzione delle variabili.
   * @returns Il prompt processato.
   */
  public async preProcessPrompt(
    promptContent: string,
    workspaceId: string,
    customerData: any
  ): Promise<string> {
    let processedPrompt = promptContent

    // Sostituzione delle informazioni utente
    processedPrompt = this.replaceVariables(processedPrompt, customerData)

    if (processedPrompt.includes("{{FAQ}}")) {
      console.log("🔧 DEBUG: Cerco FAQ per workspaceId:", workspaceId)
      const faqs = await this.messageRepository.getActiveFaqs(workspaceId)
      console.log(
        "🔧 DEBUG: FAQ trovate:",
        faqs ? `${faqs.length} chars` : "VUOTO"
      )
      processedPrompt = processedPrompt.replace("{{FAQ}}", faqs)
    }

    if (processedPrompt.includes("{{PRODUCTS}}")) {
      console.log("🔧 DEBUG: Cerco PRODUCTS per workspaceId:", workspaceId)
      const products =
        await this.messageRepository.getActiveProducts(workspaceId)
      console.log(
        "🔧 DEBUG: PRODUCTS trovati:",
        products ? `${products.length} chars` : "VUOTO"
      )
      processedPrompt = processedPrompt.replace("{{PRODUCTS}}", products)
    }

    // Aggiungere qui altri placeholder di pre-processing se necessario

    // DEBUG: Salva il prompt finale per debugging
    await this.saveDebugPrompt(processedPrompt, workspaceId)

    return processedPrompt
  }

  /**
   * Post-processa la risposta dell'LLM.
   * @param response La risposta dell'LLM.
   * @param customerId I dati del cliente per la sostituzione delle variabili.
   * @param workspaceId L'ID del workspace.
   * @returns La risposta processata.
   */
  public async postProcessResponse(
    response: string,
    customerId: string,
    workspaceId: string
  ): Promise<string> {
    let processedResponse = response

    // Sostituzione link con token
    if (customerId && workspaceId) {
      const { ReplaceLinkWithToken } = await import(
        "../chatbot/calling-functions/ReplaceLinkWithToken"
      )
      const linkResult = await ReplaceLinkWithToken(
        { response: processedResponse },
        customerId,
        workspaceId
      )
      if (linkResult.success && linkResult.response) {
        processedResponse = linkResult.response
      }
    }

    return processedResponse
  }

  /**
   * Sostituisce le variabili nel testo.
   * @param text Il testo da processare.
   * @param customerData I dati del cliente.
   * @returns Il testo con le variabili sostituite.
   */
  private replaceVariables(text: string, customerData: any): string {
    if (!text || !customerData) return text

    return text
      .replace(/\{\{nameUser\}\}/g, customerData.nameUser || "Cliente")
      .replace(
        /\{\{discountUser\}\}/g,
        customerData.discountUser || "Nessuno sconto attivo"
      )
      .replace(
        /\{\{companyName\}\}/g,
        customerData.companyName || "L'Altra Italia"
      )
      .replace(/\{\{lastordercode\}\}/g, customerData.lastordercode || "N/A")
      .replace(/\{\{languageUser\}\}/g, customerData.languageUser || "it")
  }

  /**
   * Salva il prompt finale per debugging.
   * @param prompt Il prompt processato.
   * @param workspaceId L'ID del workspace.
   */
  private async saveDebugPrompt(
    prompt: string,
    workspaceId: string
  ): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), "logs")
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `prompt-debug-${workspaceId}-${timestamp}.txt`
      const filepath = path.join(logsDir, filename)

      const debugContent = `
================== PROMPT DEBUG ==================
Timestamp: ${new Date().toISOString()}
Workspace ID: ${workspaceId}
================== FINAL PROMPT ==================

${prompt}

================== END PROMPT ==================
`

      fs.writeFileSync(filepath, debugContent, "utf8")
      console.log(`[DEBUG] Prompt salvato in: ${filepath}`)
    } catch (error) {
      console.error("[DEBUG] Errore nel salvare il prompt:", error)
    }
  }
}
