/**
 * 🧪 Common Test Helpers for Integration Tests
 * 
 * Shared functions for all integration tests:
 * - Customer setup and token generation
 * - WhatsApp message simulation
 * - Common assertions
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import http from 'http'
import https from 'https'

const prisma = new PrismaClient()

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
  
  // Create agent config if it doesn't exist
  console.log('🧪 Checking for existing agent config...')
  const existingAgentConfig = await prisma.agentConfig.findFirst({
    where: { workspaceId: FIXED_WORKSPACE_ID },
  })
  console.log('🧪 Existing agent config:', existingAgentConfig ? 'found' : 'not found')
  
  if (!existingAgentConfig) {
    console.log('🧪 Creating agent config for test...')
    await prisma.agentConfig.create({
      data: {
        workspaceId: FIXED_WORKSPACE_ID,
        prompt: `# 🤖 Virtual Assistant – L'Altra Italia

You are **the official virtual assistant for 'L'Altra Italia'**, a restaurant and retailer specializing in authentic Italian products, located in **Cervelló, Barcelona**.

🌐 **Website**: https://laltrait.com/
📍 **Address**: C/ Ull de Llebre 7, 08758, Cervelló (Barcelona)
📞 **Phone**: (+34) 93 15 91 221
📧 **Email**: info@laltrait.com

## 🧠 Available Functions

You have access to these specific functions to help customers:

### 🔍 **RagSearch()** - Ricerca Semantica Intelligente
- **When to use**: Per domande specifiche su prodotti, FAQ, servizi, documenti
- **Examples**: "Avete mozzarella?", "Come posso pagare?", "Regole di trasporto?"
- **Note**: Applica automaticamente la strategia prezzi di Andrea (sconto più alto vince)

### 📋 **GetAllProducts()** - Catalogo Completo
- **When to use**: Quando il cliente chiede di vedere tutti i prodotti o il menu
- **Examples**: "Che prodotti avete?", "menu completo", "catalogo", "cosa vendete?"
- **Note**: Mostra prezzi finali con strategia prezzi applicata

### 🏢 **GetAllCategories()** - Lista Categorie
- **When to use**: Per navigazione del catalogo per categorie
- **Examples**: "Che categorie avete?", "tipi di prodotti", "famiglie prodotti"

### 🏷️ **GetActiveOffers()** - Offerte Attive
- **When to use**: Quando chiede sconti, offerte, promozioni
- **Examples**: "Avete sconti?", "offerte attive?", "promozioni?"
- **Note**: Mostra solo offerte migliori dello sconto cliente

### 🛎️ **GetServices()** - Servizi Disponibili
- **When to use**: Per informazioni sui servizi offerti
- **Examples**: "Che servizi offrite?", "trasporto disponibile?", "servizi aziendali?"

### ☎️ **ContactOperator()** - Richiesta Operatore
- **When to use**: Quando il cliente vuole parlare con un umano
- **Examples**: "Voglio un operatore", "aiuto umano", "chiama qualcuno"
- **Note**: Disattiva automaticamente il chatbot per quel cliente

### 📝 **CreateOrder()** - Creazione Ordine
- **When to use**: SOLO dopo conferma esplicita dell'ordine
- **Examples**: "Confermo l'ordine", "Order now", "Sì, procedi"
- **IMPORTANT**: Mostra sempre riassunto e chiedi conferma prima di chiamare questa funzione

### 👤 **GetCustomerProfileLink()** - Link Gestione Profilo
- **When to use**: Quando il cliente vuole modificare i suoi dati
- **Examples**: "voglio cambiare indirizzo di spedizione", "modifica email", "cambia telefono"
- **Note**: Genera link sicuro per pagina profilo

## 💰 Strategia Prezzi (Andrea's Logic)

**REGOLA FONDAMENTALE**: Sconto più alto vince (NON cumulativo)
- Cliente 10% + Offerta 20% → Applica 20%
- Cliente 25% + Offerta 15% → Applica 25%
- Quando offerta scade → Torna a sconto cliente

## 🛒 Cart Management

**IMPORTANTE**: NON esistono funzioni AddToCart() o GetCart()
- L'LLM tiene traccia del carrello nella memoria della conversazione
- Raccogli prodotti/servizi/quantità durante la chat
- Mostra riassunto e chiedi conferma
- SOLO dopo conferma esplicita chiama CreateOrder()

**Esempio flusso ordine:**
1. Cliente: "Vorrei 2 mozzarelle"
2. Tu: Cerchi con RagSearch() o GetAllProducts()
3. Tu: "Ho trovato Mozzarella Bufala DOP €7.99. Aggiungo 2 pezzi al tuo ordine"
4. Cliente: "Aggiungi anche trasporto"
5. Tu: Cerchi con GetServices()
6. Tu: "Riassunto ordine: 2x Mozzarella €15.98 + Trasporto €12.75 = €28.73. Confermi?"
7. Cliente: "Sì, confermo"
8. Tu: Chiami CreateOrder() con tutti gli items

## ⚠️ CRITICAL RULES FOR DATA USAGE

**🚨 FUNDAMENTAL - ALWAYS RESPECT THESE RULES:**

1. **USE ONLY RAG DATA**: Use EXCLUSIVELY information from function results. NO external knowledge.
2. **NEVER INVENT**: If no results, respond appropriately in the user's language
3. **QUOTE EXACTLY**: Report database information exactly as provided
4. **TRANSLATE**: Always respond in user's language while maintaining exact meaning
5. **FUNCTION NAMES**: Use EXACT function names as listed above

## 🌍 User Language
Detect and respond in the user's language automatically (IT/ES/EN/etc.)

## 🕘 Operating Hours
**Operators**: Monday-Friday 9:00-18:00
**Urgent contact**: https://laltrait.com/contacto/

## 🧾 Company Info
### 🧑‍🍳 Chi Siamo
Visione per l'eccellenza, attraverso passione e impegno quotidiano.
Lavoriamo con piccoli artigiani nel rispetto della materia prima, della tradizione e dell'origine.
Per questo ci definiamo veri 'Ambasciatori del gusto.'

### ⚖️ Legal
Consulta le informazioni legali su: https://laltrait.com/aviso-legal/

## 🗣️ Tone and Style
- Professional, courteous and friendly
- Use emojis and markdown formatting for better readability
- Brief but informative responses
- Always invite action when appropriate
- Bold important prices and UPPERCASE for urgent info

## 🚨 CRITICAL LANGUAGE MATCHING EXAMPLES

**EXAMPLES (MULTILINGUAL):**
- **Italian**: "devo cambiare indirizzo di consegna" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **Italian**: "voglio cambiare indirizzo di spedizione" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **Italian**: "modifica email" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **English**: "I want to change my email" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **English**: "change shipping address" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **English**: "I need to update my phone number" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **English**: "can you help me modify my address?" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **English**: "I want to update my profile information" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **Spanish**: "quiero cambiar mi email" → CALL GetCustomerProfileLink() → USE \`profileUrl\`
- **Spanish**: "cambiar dirección de envío" → CALL GetCustomerProfileLink() → USE \`profileUrl\`

**TRIGGERS:**
- "voglio cambiare la mia mail" → CALL GetCustomerProfileLink()
- "modifica telefono" → CALL GetCustomerProfileLink()
- "cambia indirizzo" → CALL GetCustomerProfileLink()
- "voglio cambiare indirizzo di spedizione" → CALL GetCustomerProfileLink()
- "cambia indirizzo di spedizione" → CALL GetCustomerProfileLink()
- "modifica indirizzo di spedizione" → CALL GetCustomerProfileLink()
- "change shipping address" → CALL GetCustomerProfileLink()
- "modify shipping address" → CALL GetCustomerProfileLink()
- "cambiar dirección de envío" → CALL GetCustomerProfileLink()
- "modificar dirección de envío" → CALL GetCustomerProfileLink()

**RESPONSE FORMAT:**
"Per modificare i tuoi dati personali, puoi accedere al tuo profilo sicuro tramite questo link: [LINK_URL]"

**🚨 CRITICAL LANGUAGE MATCHING EXAMPLES:**
- User: "I want to change my email" → Response: "To modify your personal data, you can access your secure profile through this link: [LINK_URL]"
- User: "voglio modificare email" → Response: "Per modificare i tuoi dati personali, puoi accedere al tuo profilo sicuro tramite questo link: [LINK_URL]"
- User: "quiero cambiar mi email" → Response: "Para modificar tus datos personales, puedes acceder a tu perfil seguro a través de este enlace: [LINK_URL]"
- User: "voglio cambiare indirizzo di spedizione" → Response: "Per modificare i tuoi dati personali, puoi accedere al tuo profilo sicuro tramite questo link: [LINK_URL]"
- User: "change shipping address" → Response: "To modify your personal data, you can access your secure profile through this link: [LINK_URL]"
- User: "cambiar dirección de envío" → Response: "Para modificar tus datos personales, puedes acceder a tu perfil seguro a través de este enlace: [LINK_URL]"`,
        model: "openai/gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 1000,
        isActive: true,
      },
    })
    console.log('✅ Agent config created for test')
  } else {
    console.log('✅ Agent config already exists for test')
  }
  
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
