/**
 * Language detector utility
 * Provides functions to detect language from text input using common patterns and word usage
 * AND from phone number country codes
 */

export type SupportedLanguage = 'en' | 'it' | 'es' | 'pt';

interface CountryLanguage {
  code: string;
  language: string;
  name: string;
}

const COUNTRY_LANGUAGES: CountryLanguage[] = [
  // Italy
  { code: '+39', language: 'it', name: 'Italy' },
  
  // Spain and Spanish-speaking countries
  { code: '+34', language: 'es', name: 'Spain' },
  { code: '+52', language: 'es', name: 'Mexico' },
  { code: '+54', language: 'es', name: 'Argentina' },
  { code: '+56', language: 'es', name: 'Chile' },
  { code: '+57', language: 'es', name: 'Colombia' },
  
  // English-speaking countries
  { code: '+1', language: 'en', name: 'USA/Canada' },
  { code: '+44', language: 'en', name: 'UK' },
  { code: '+61', language: 'en', name: 'Australia' },
  { code: '+64', language: 'en', name: 'New Zealand' },
  
  // Portuguese-speaking countries
  { code: '+351', language: 'pt', name: 'Portugal' },
  { code: '+55', language: 'pt', name: 'Brazil' },
];

/**
 * Detect language from phone number country code
 * @param phoneNumber - Phone number with country code (e.g., "+393401234567")
 * @returns Language code (e.g., "it", "en", "fr") or "it" as default
 */
export function detectLanguageFromPhone(phoneNumber: string): string {
  if (!phoneNumber || !phoneNumber.startsWith('+')) {
    console.log('🌐 No valid phone number provided, defaulting to Italian');
    return 'it'; // Default to Italian for your shop
  }

  // Sort by code length (longer first) to match most specific codes first
  const sortedCodes = COUNTRY_LANGUAGES.sort((a, b) => b.code.length - a.code.length);
  
  for (const country of sortedCodes) {
    if (phoneNumber.startsWith(country.code)) {
      console.log(`🌐 Detected language: ${country.language} (${country.name}) from phone: ${phoneNumber.substring(0, 6)}...`);
      return country.language;
    }
  }

  console.log('🌐 Unknown country code, defaulting to Italian');
  return 'it'; // Default to Italian
}

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