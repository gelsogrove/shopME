import { logger } from '../lib/logger'
import { api } from './api'

export interface Document {
  id: string
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'ERROR'
  isActive: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
  _count?: {
    chunks: number
  }
}

export interface SearchResult {
  content: string
  documentName: string
  similarity: number
  chunkId: string
  documentId: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface SearchResponse {
  query: string
  results: Array<{
    content: string
    document_name: string
    similarity_score: number
    source: string
  }>
  totalResults: number
}

class DocumentsApi {
  /**
   * Upload a PDF document
   */
  async upload(workspaceId: string, file: File): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspaceId', workspaceId)

    const response = await api.post(`/workspaces/${workspaceId}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.data || response.data
  }

  /**
   * Get all documents for a workspace
   */
  async list(workspaceId: string): Promise<Document[]> {
    logger.info("=== DOCUMENTS API LIST DEBUG ===")
    logger.info("Called with workspaceId:", workspaceId)
    
    if (!workspaceId) {
      logger.error("No workspaceId provided to documentsApi.list")
      throw new Error("WorkspaceId is required")
    }
    
    const url = `/workspaces/${workspaceId}/documents`
    logger.info("Making API call to:", url)
    
    try {
      const response = await api.get(url)
      logger.info("API response status:", response.status)
      logger.info("API response data:", response.data)
      
      const documents = response.data.data || response.data
      logger.info("Returning documents:", documents)
      return documents
    } catch (error) {
      logger.error("API call failed:", error)
      throw error
    }
  }

  /**
   * Process a document to generate embeddings
   */
  async process(workspaceId: string, documentId: string): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/documents/${documentId}/process`)
  }

  /**
   * Search documents using semantic search
   */
  async search(workspaceId: string, query: string): Promise<SearchResult[]> {
    const response = await api.post(`/workspaces/${workspaceId}/documents/search`, {
      query,
      workspaceId,
    })
    return response.data.data?.results || response.data
  }

  /**
   * Delete a document
   */
  async delete(workspaceId: string, documentId: string): Promise<void> {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}`)
  }

  /**
   * Get document details by ID
   */
  async getById(workspaceId: string, documentId: string): Promise<Document> {
    const response = await api.get(`/workspaces/${workspaceId}/documents/${documentId}`)
    return response.data.data || response.data
  }

  /**
   * Download a document file
   */
  async download(workspaceId: string, documentId: string): Promise<Blob> {
    const response = await api.get(`/workspaces/${workspaceId}/documents/${documentId}/download`, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Update document metadata
   */
  async update(workspaceId: string, documentId: string, data: { originalName?: string; isActive?: boolean }): Promise<Document> {
    const response = await api.put(`/workspaces/${workspaceId}/documents/${documentId}`, data)
    return response.data.data || response.data
  }

  /**
   * Generate embeddings for all active documents in a workspace
   */
  async generateEmbeddings(workspaceId: string): Promise<{ processed: number; errors: string[]; hasErrors: boolean }> {
    const response = await api.post(`/workspaces/${workspaceId}/documents/generate-embeddings`)
    return response.data.data || response.data
  }
}

export const documentsApi = new DocumentsApi() 