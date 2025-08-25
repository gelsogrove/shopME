/**
 * 🧪 Common Test Helpers for Integration Tests
 * 
 * Shared functions for all integration tests:
 * - Customer setup and token generation
 * - WhatsApp message simulation
 * - Common assertions
 */

import axios from 'axios'
import http from 'http'
import https from 'https'

// Use real HTTP calls to the running server instead of supertest
const API_BASE_URL = 'http://localhost:3001' // Backend port

// Fixed test data from seed.ts
export const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
export const FIXED_CUSTOMER_ID = 'test-customer-123'
export const FIXED_CUSTOMER_PHONE = '+393451234567' // Use Test Customer MCP (registered customer)

// Use Maria Garcia - registered customer with 10% discount
export const MARIA_GARCIA_PHONE = '+34666777888'
export const MARIA_GARCIA_EMAIL = 'maria.garcia@shopme.com'

/**
 * Setup test customer with active chatbot
 */
export const setupTestCustomer = async () => {
  // Simple setup - just return the test data
  // The customer should already exist in the seed data
  console.log('🧪 Setting up test customer...')
  
  return {
    customerId: FIXED_CUSTOMER_ID,
    phone: FIXED_CUSTOMER_PHONE,
    workspaceId: FIXED_WORKSPACE_ID
  }
}

/**
 * Simulate WhatsApp message with language support
 */
export const simulateWhatsAppMessage = async (
  message: string, 
  language: string = 'en',
  phone: string = MARIA_GARCIA_PHONE // Use Maria Garcia by default
) => {
  // Create explicit HTTP agents that we can control
  const httpAgent = new http.Agent({ keepAlive: false })
  const httpsAgent = new https.Agent({ keepAlive: false })
  
  // Create a new axios instance for each request to avoid connection pooling issues
  const axiosInstance = axios.create({
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json'
    },
    httpAgent,
    httpsAgent
  })

  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/messages`, { // Use real WhatsApp endpoint
      workspaceId: FIXED_WORKSPACE_ID,
      phoneNumber: phone,
      message: message,
      language: language // Add language to payload
    })
    
    // Convert axios response to supertest-like format
    return {
      status: response.status,
      body: response.data,
      headers: response.headers
    }
  } catch (error) {
    // Handle axios errors and convert to supertest-like format
    if (error.response) {
      return {
        status: error.response.status,
        body: error.response.data,
        headers: error.response.headers
      }
    } else {
      // Network error or timeout
      return {
        status: 500,
        body: { error: error.message },
        headers: {}
      }
    }
  } finally {
    // Explicitly destroy the agents to close all connections
    httpAgent.destroy()
    httpsAgent.destroy()
  }
}

/**
 * Clean up test data
 */
export const cleanupTestData = async () => {
  // Simple cleanup - just log
  console.log('🧪 Cleaning up test data...')
  
  // Force cleanup of any remaining axios connections
  // This helps prevent Jest open handle warnings
  if (typeof global.gc === 'function') {
    global.gc()
  }
}

/**
 * Extract response message from API response
 */
export const extractResponseMessage = (response: any): string => {
  return response.body?.processedMessage || 
         response.body?.message || 
         response.body?.success === false ? response.body?.error : 
         JSON.stringify(response.body)
}

/**
 * Check if response is in specific language
 */
export const isResponseInLanguage = (response: string, language: string): boolean => {
  // Safety check: if response is undefined or null, return false
  if (!response || typeof response !== 'string') {
    return false
  }

  const languageIndicators = {
    en: [
      'hello', 'welcome', 'help', 'information', 'products', 'services',
      'opening hours', 'delivery', 'payment methods', 'accept', 'offer',
      'available', 'contact', 'assist', 'provide', 'available', 'costs',
      'would you like', 'add to cart', 'thanks to', 'active', 'discount',
      'limoncello', 'capri', 'alcoholic', 'beverages', 'cheeses', 'wines',
      'pasta', 'show me', 'what', 'how much', 'price'
    ],
    it: [
      'ciao', 'benvenuto', 'aiuto', 'informazioni', 'prodotti', 'servizi',
      'orari di apertura', 'consegne', 'metodi di pagamento', 'accettiamo', 'offriamo',
      'disponibili', 'contatto', 'assistenza', 'forniamo', 'disponibile',
      'siamo aperti', 'lunedì', 'venerdì', 'sabato', 'posso aiutarti', 'qualcos\'altro',
      'dalle', 'alle', 'orari', 'apertura', 'costa', 'euro', '€', 'vuoi', 'aggiungere',
      'carrello', 'offerta', 'sconto', 'grazie', 'attiva', 'valida', 'fino', 'al',
      'limoncello', 'capri', 'alcolici', 'bevande', 'formaggi', 'vini', 'pasta'
    ],
    es: [
      'hola', 'bienvenido', 'ayuda', 'información', 'productos', 'servicios',
      'horarios de apertura', 'entregas', 'métodos de pago', 'aceptamos', 'ofrecemos',
      'disponibles', 'contacto', 'asistencia', 'proporcionamos', 'disponible',
      'cuesta', 'euro', '€', 'quieres', 'agregar', 'carrito', 'oferta', 'descuento',
      'gracias', 'activa', 'válida', 'hasta', 'limoncello', 'capri', 'alcohólicas',
      'bebidas', 'quesos', 'vinos', 'pasta', 'muéstrame', 'qué', 'cuánto', 'precio'
    ],
    pt: [
      'olá', 'bem-vindo', 'ajuda', 'informação', 'produtos', 'serviços',
      'horários de funcionamento', 'entregas', 'métodos de pagamento', 'aceitamos', 'oferecemos',
      'disponíveis', 'contato', 'assistência', 'fornecemos', 'disponível',
      'custa', 'euro', '€', 'quer', 'adicionar', 'carrinho', 'oferta', 'desconto',
      'obrigado', 'ativa', 'válida', 'até', 'limoncello', 'capri', 'alcoólicas',
      'bebidas', 'queijos', 'vinhos', 'massa', 'mostre-me', 'quais', 'quanto', 'preço'
    ]
  }

  const indicators = languageIndicators[language as keyof typeof languageIndicators] || []
  const responseLower = response.toLowerCase()
  
  // Check for multiple indicators to be more accurate
  const matches = indicators.filter(indicator => 
    responseLower.includes(indicator.toLowerCase())
  )
  
  // Return true if we find at least 2 indicators (more reliable)
  return matches.length >= 2
}
