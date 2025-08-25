/**
 * Language detector utility
 * Provides functions to detect language from text input using common patterns and word usage
 */

export type SupportedLanguage = 'en' | 'it' | 'es' | 'pt';

/**
 * Language detection utility for user messages
 */
export function detectLanguage(message: string): string {
  if (!message) return 'en';
  
  const lowerMessage = message.toLowerCase();
  
  // Italian patterns
  const italianPatterns = [
    /\b(ciao|ciao|buongiorno|buonasera|grazie|prego|per favore|scusa|mi dispiace|va bene|ok|si|no)\b/i,
    /\b(ordine|ordini|prodotti|servizi|prezzi|costi|disponibile|disponibili)\b/i,
    /\b(dammi|voglio|vorrei|posso|puoi|hai|avete|quanto|quale|quali)\b/i,
    /\b(ultimo|primo|secondo|terzo|quarto|quinto)\b/i,
    /\b(lista|catalogo|menu|offerte|sconti|promozioni)\b/i
  ];
  
  // Spanish patterns
  const spanishPatterns = [
    /\b(hola|buenos días|buenas tardes|gracias|por favor|perdón|lo siento|vale|ok|sí|no)\b/i,
    /\b(pedido|pedidos|productos|servicios|precios|costos|disponible|disponibles)\b/i,
    /\b(dame|quiero|me gustaría|puedo|puedes|tienes|tienen|cuánto|cuál|cuáles)\b/i,
    /\b(último|primero|segundo|tercero|cuarto|quinto)\b/i,
    /\b(lista|catálogo|menú|ofertas|descuentos|promociones)\b/i
  ];
  
  // Portuguese patterns
  const portuguesePatterns = [
    /\b(olá|bom dia|boa tarde|obrigado|por favor|desculpe|sinto muito|ok|sim|não)\b/i,
    /\b(pedido|pedidos|produtos|serviços|preços|custos|disponível|disponíveis)\b/i,
    /\b(dá-me|quero|gostaria|posso|podes|tens|têm|quanto|qual|quais)\b/i,
    /\b(último|primeiro|segundo|terceiro|quarto|quinto)\b/i,
    /\b(lista|catálogo|menu|ofertas|descontos|promoções)\b/i
  ];
  
  // Count matches for each language
  let italianMatches = 0;
  let spanishMatches = 0;
  let portugueseMatches = 0;
  
  italianPatterns.forEach(pattern => {
    if (pattern.test(lowerMessage)) italianMatches++;
  });
  
  spanishPatterns.forEach(pattern => {
    if (pattern.test(lowerMessage)) spanishMatches++;
  });
  
  portuguesePatterns.forEach(pattern => {
    if (pattern.test(lowerMessage)) portugueseMatches++;
  });
  
  // Return the language with most matches
  if (italianMatches > spanishMatches && italianMatches > portugueseMatches) {
    return 'it';
  } else if (spanishMatches > italianMatches && spanishMatches > portugueseMatches) {
    return 'es';
  } else if (portugueseMatches > italianMatches && portugueseMatches > spanishMatches) {
    return 'pt';
  }
  
  // Default to English if no clear pattern
  return 'en';
}

export function getLanguageName(languageCode: string): string {
  const languages: { [key: string]: string } = {
    'it': 'Italian',
    'es': 'Spanish', 
    'en': 'English',
    'pt': 'Portuguese'
  };
  
  return languages[languageCode] || 'English';
} 