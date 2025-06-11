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
    const response = await api.get(`/workspaces/${workspaceId}/documents?workspaceId=${workspaceId}`)
    return response.data.data || response.data
  }

  /**
   * Process a document to generate embeddings
   */
  async process(documentId: string): Promise<void> {
    await api.post(`/documents/${documentId}/process`)
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
  async delete(documentId: string): Promise<void> {
    await api.delete(`/documents/${documentId}`)
  }

  /**
   * Get document details by ID
   */
  async getById(documentId: string): Promise<Document> {
    const response = await api.get(`/documents/${documentId}`)
    return response.data.data || response.data
  }

  /**
   * Download a document file
   */
  async download(documentId: string): Promise<Blob> {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Update document metadata
   */
  async update(documentId: string, data: { originalName?: string; isActive?: boolean }): Promise<Document> {
    const response = await api.put(`/documents/${documentId}`, data)
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