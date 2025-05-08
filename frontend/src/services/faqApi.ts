import { api } from "./api"

export interface FAQ {
  id: string
  question: string
  answer: string
  isActive: boolean
  workspaceId: string
  createdAt: string
  updatedAt: string
}

export interface CreateFAQData {
  question: string
  answer: string
  isActive?: boolean
}

export interface UpdateFAQData {
  question?: string
  answer?: string
  isActive?: boolean
}

// Mock data per le FAQ quando l'API fallisce
const mockFAQs: FAQ[] = [
  {
    id: "mock-faq-1",
    question: "Come posso modificare il mio ordine?",
    answer:
      'Puoi modificare il tuo ordine accedendo alla sezione "I miei ordini" nel tuo account, selezionando l\'ordine che desideri modificare e cliccando su "Modifica ordine".',
    isActive: true,
    workspaceId: "mock-workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-faq-2",
    question: "Quali metodi di pagamento accettate?",
    answer:
      "Accettiamo pagamenti tramite carte di credito (Visa, Mastercard, American Express), PayPal e bonifico bancario. I dettagli del pagamento sono visibili alla cassa.",
    isActive: true,
    workspaceId: "mock-workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-faq-3",
    question: "Quanto tempo richiede la consegna?",
    answer:
      "I tempi di consegna variano da 2 a 5 giorni lavorativi, a seconda della tua posizione. I dettagli esatti sono forniti al momento del checkout.",
    isActive: false,
    workspaceId: "mock-workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

/**
 * Ottiene tutte le FAQ per un workspace
 */
export const getFAQs = async (workspaceId: string): Promise<FAQ[]> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/faqs`)
    return response.data
  } catch (error) {
    console.error("Error getting FAQs:", error)
    // Per sviluppo/testing, ritorna le FAQ mock
    console.warn("Returning mock FAQs data")
    return mockFAQs
  }
}

/**
 * Ottiene una FAQ specifica per ID
 */
export const getFAQById = async (
  workspaceId: string,
  id: string
): Promise<FAQ> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/faqs/${id}`)
    return response.data
  } catch (error) {
    console.error("Error getting FAQ:", error)
    const mockFaq = mockFAQs.find((faq) => faq.id === id)
    if (mockFaq) return mockFaq
    throw error
  }
}

/**
 * Crea una nuova FAQ
 */
export const createFAQ = async (
  workspaceId: string,
  data: CreateFAQData
): Promise<FAQ> => {
  try {
    const response = await api.post(`/workspaces/${workspaceId}/faqs`, data)
    return response.data
  } catch (error) {
    console.error("Error creating FAQ:", error)
    // Per sviluppo/testing, ritorna una FAQ mock
    console.warn("Returning mock created FAQ data")
    const newFaq: FAQ = {
      id: `mock-faq-${Date.now()}`,
      question: data.question,
      answer: data.answer,
      isActive: data.isActive ?? true,
      workspaceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockFAQs.push(newFaq)
    return newFaq
  }
}

/**
 * Aggiorna una FAQ esistente
 */
export const updateFAQ = async (
  workspaceId: string,
  id: string,
  data: UpdateFAQData
): Promise<FAQ> => {
  try {
    const response = await api.put(
      `/workspaces/${workspaceId}/faqs/${id}`,
      data
    )
    return response.data
  } catch (error) {
    console.error("Error updating FAQ:", error)
    // Per sviluppo/testing, aggiorna una FAQ mock
    console.warn("Updating mock FAQ data")
    const index = mockFAQs.findIndex((faq) => faq.id === id)
    if (index !== -1) {
      mockFAQs[index] = {
        ...mockFAQs[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }
      return mockFAQs[index]
    }
    throw error
  }
}

/**
 * Elimina una FAQ
 */
export const deleteFAQ = async (
  workspaceId: string,
  id: string
): Promise<void> => {
  try {
    await api.delete(`/workspaces/${workspaceId}/faqs/${id}`)
  } catch (error) {
    console.error("Error deleting FAQ:", error)
    // Per sviluppo/testing, elimina una FAQ mock
    console.warn("Deleting mock FAQ data")
    const index = mockFAQs.findIndex((faq) => faq.id === id)
    if (index !== -1) {
      mockFAQs.splice(index, 1)
    }
    throw error
  }
}

export const faqApi = {
  getFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
}
