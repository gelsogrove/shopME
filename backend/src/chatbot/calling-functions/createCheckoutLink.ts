import logger from '../../utils/logger';

/**
 * Create Checkout Link Calling Function
 * 
 * Genera link sicuri per il checkout quando l'utente vuole finalizzare un ordine
 */

export interface CreateCheckoutLinkParams {
  phoneNumber: string;
  workspaceId: string;
  customerId?: string;
  cartItems?: any[];
  message: string;
}

export interface CreateCheckoutLinkResult {
  response: string;
  checkoutToken: string;
  checkoutUrl: string;
  expiresAt: Date;
}

/**
 * Funzione per creare link checkout sicuro
 */
export async function createCheckoutLink(params: CreateCheckoutLinkParams): Promise<CreateCheckoutLinkResult> {
  const { phoneNumber, workspaceId, customerId, cartItems, message } = params;
  
  logger.info(`[CREATE_CHECKOUT] Creating checkout link for ${phoneNumber}`);
  
  try {
    // Rileva intent di finalizzazione ordine
    const isCheckoutIntent = detectCheckoutIntent(message);
    
    if (!isCheckoutIntent) {
      throw new Error('No checkout intent detected');
    }
    
    // Genera token sicuro con scadenza 1 ora
    const checkoutToken = generateCheckoutToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 ora
    
    // TODO: Salvare token nel database con scadenza
    // TODO: Associare token al customer e ai dati del carrello
    
    const checkoutUrl = `https://shopme.com/checkout/${checkoutToken}`;
    
    const checkoutMessage = `Perfetto! 🛒

Per completare il tuo ordine in sicurezza:

🔗 Finalizza Ordine: ${checkoutUrl}

Qui potrai:
✅ Confermare quantità
✅ Scegliere spedizione  
✅ Inserire pagamento
✅ Ricevere fattura

⏰ Il link è sicuro e scade tra 1 ora.`;

    logger.info(`[CREATE_CHECKOUT] Checkout link created: ${checkoutToken}`);
    
    return {
      response: checkoutMessage,
      checkoutToken,
      checkoutUrl,
      expiresAt
    };
    
  } catch (error) {
    logger.error(`[CREATE_CHECKOUT] Error creating checkout link:`, error);
    throw error;
  }
}

/**
 * Rileva intent di finalizzazione ordine
 */
function detectCheckoutIntent(message: string): boolean {
  const checkoutKeywords = [
    'ordino', 'compro', 'acquisto', 'checkout', 'finalizza', 
    'order', 'voglio ordinare', 'voglio comprare', 'procedo',
    'concludo', 'completo', 'pago', 'pagamento'
  ];
  
  const lowerMessage = message.toLowerCase();
  return checkoutKeywords.some(keyword => lowerMessage.includes(keyword));
}

/**
 * Genera token checkout sicuro
 */
function generateCheckoutToken(): string {
  // TODO: Implementare generazione token sicura con crypto
  return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
}

// Export per LangChain function calling
export const createCheckoutLinkFunction = {
  name: 'createCheckoutLink',
  description: 'Genera link sicuro per checkout quando utente vuole finalizzare ordine',
  parameters: {
    type: 'object',
    properties: {
      phoneNumber: { type: 'string', description: 'Numero telefono utente' },
      workspaceId: { type: 'string', description: 'ID workspace' },
      customerId: { type: 'string', description: 'ID cliente (opzionale)' },
      cartItems: { type: 'array', description: 'Elementi nel carrello (opzionale)' },
      message: { type: 'string', description: 'Messaggio utente' }
    },
    required: ['phoneNumber', 'workspaceId', 'message']
  },
  handler: createCheckoutLink
}; 