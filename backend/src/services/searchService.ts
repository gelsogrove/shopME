import logger from "../utils/logger"
import { DocumentService } from "./documentService"
import { embeddingService } from "./embeddingService"

export interface UnifiedSearchResult {
  id: string
  chunkId: string
  content: string
  similarity: number
  sourceName: string
  sourceType: "document" | "faq" | "service"
  metadata?: {
    documentName?: string
    question?: string
    serviceName?: string
  }
}

export class SearchService {
  private documentService: DocumentService

  constructor() {
    this.documentService = new DocumentService()
  }

  /**
   * Search across all content types (documents, FAQs, services)
   */
  async searchAll(
    query: string,
    workspaceId: string,
    options: {
      limit?: number
      includeDocuments?: boolean
      includeFAQs?: boolean
      includeServices?: boolean
    } = {}
  ): Promise<UnifiedSearchResult[]> {
    const {
      limit = 10,
      includeDocuments = true,
      includeFAQs = true,
      includeServices = false, // Not implemented yet
    } = options

    const allResults: UnifiedSearchResult[] = []

    try {
      // Search documents if enabled
      if (includeDocuments) {
        const documentResults = await this.documentService.searchDocuments(
          query,
          workspaceId,
          limit
        )
        const unifiedDocResults: UnifiedSearchResult[] = documentResults.map(
          (result) => ({
            id: result.documentId,
            chunkId: result.chunkId,
            content: result.content,
            similarity: result.similarity,
            sourceName: result.documentName,
            sourceType: "document" as const,
            metadata: {
              documentName: result.documentName,
            },
          })
        )
        allResults.push(...unifiedDocResults)
      }

      // Search FAQs if enabled
      if (includeFAQs) {
        const faqResults = await embeddingService.searchFAQs(
          query,
          workspaceId,
          limit
        )
        const unifiedFaqResults: UnifiedSearchResult[] = faqResults.map(
          (result) => ({
            id: result.id,
            chunkId: result.chunkId,
            content: result.content,
            similarity: result.similarity,
            sourceName: result.sourceName,
            sourceType: "faq" as const,
            metadata: {
              question: result.sourceName,
            },
          })
        )
        allResults.push(...unifiedFaqResults)
      }

      // TODO: Search Services when implemented
      // if (includeServices) {
      //   const serviceResults = await embeddingService.searchServices(query, workspaceId, limit);
      //   // ... convert to unified format
      // }

      // Apply a small ranking boost to FAQ results so that explicit
      // FAQ matches can surface above product/document matches when
      // the semantic score is comparable. This increases the chance
      // that intent-like queries (e.g. "Give me the list of products")
      // will be fulfilled by FAQ-based function calls.
      const FAQ_BOOST = Number(process.env.SEARCH_FAQ_BOOST) || 1.25

      const scored = allResults.map((r) => {
        const boost = r.sourceType === "faq" ? FAQ_BOOST : 1
        return { r, score: r.similarity * boost }
      })

      // Sort by boosted score and limit
      const sorted = scored.sort((a, b) => b.score - a.score)

      // Return the original unified result objects in the new order
      return sorted.slice(0, limit).map((s) => s.r)
    } catch (error) {
      logger.error("Error in unified search:", error)
      throw new Error("Failed to perform unified search")
    }
  }

  /**
   * Search only documents
   */
  async searchDocuments(
    query: string,
    workspaceId: string,
    limit: number = 5
  ): Promise<UnifiedSearchResult[]> {
    return this.searchAll(query, workspaceId, {
      limit,
      includeDocuments: true,
      includeFAQs: false,
      includeServices: false,
    })
  }

  /**
   * Search only FAQs
   */
  async searchFAQs(
    query: string,
    workspaceId: string,
    limit: number = 5
  ): Promise<UnifiedSearchResult[]> {
    return this.searchAll(query, workspaceId, {
      limit,
      includeDocuments: false,
      includeFAQs: true,
      includeServices: false,
    })
  }
}

export const searchService = new SearchService()
