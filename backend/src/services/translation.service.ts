import axios from 'axios';

export class TranslationService {
  private openRouterApiKey: string;
  private openRouterUrl: string;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    console.log('🔑 Translation service initialized with API key:', this.openRouterApiKey ? 'EXISTS' : 'MISSING');
  }

  public async translateToEnglish(text: string, hasConversationHistory: boolean = false): Promise<string> {
    try {
      console.log('🌐 Translating text to English:', text);
      console.log('🧠 Has conversation history:', hasConversationHistory);
      
      // All text should be translated - no hardcoded exceptions
      
      // Translation should work for all text - no hardcoded product names
      
      // Proceed with translation for all text
      console.log('🔧 Proceeding with translation');

      const response = await axios.post(this.openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a translator for an Italian e-commerce platform. Translate the user\'s message to English using e-commerce terminology. CRITICAL RULE: NEVER translate Italian product names, food names, or brand names. Keep them exactly as they are in Italian and put them in quotes. Examples: "Bocconcino Di Bufala" stays "Bocconcino Di Bufala", "Mozzarella di Bufala Campana DOP" stays "Mozzarella di Bufala Campana DOP", "Burrata" stays "Burrata", "Torta Sacher" stays "Torta Sacher" (NOT "Sacher Torte"), "Tiramisù" stays "Tiramisù", "Cannolo Siciliano" stays "Cannolo Siciliano", "Sfogliatella" stays "Sfogliatella", "Parmigiano Reggiano" stays "Parmigiano Reggiano", "Prosciutto di Parma" stays "Prosciutto di Parma". Only translate common words like "aggiungi" (add), "quanto costa" (how much does it cost), "quando arriva" (when does it arrive), "cerco" (I am looking for), "hai" (do you have), "avete" (do you have). For questions about delivery times, shipping, receiving goods, use keywords like "delivery time", "shipping time", "delivery", "shipping". Return ONLY the English translation, no explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.0, // Zero temperature for translations - no creative interpretations
        max_tokens: 100
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe Translation Service'
        },
        timeout: 10000
      });

      const translation = response.data.choices[0]?.message?.content?.trim() || text;
      console.log('✅ Translation successful:');
      console.log('🔧 ORIGINAL:', text);
      console.log('🔧 TRANSLATED:', translation);
      return translation;

    } catch (error) {
      console.error('❌ Translation failed, using original text:', error instanceof Error ? error.message : 'Unknown error');
      return text;
    }
  }

  public async translateToLanguage(text: string, targetLanguage: string): Promise<string> {
    try {
      console.log(`🌐 Translating text to ${targetLanguage}:`, text);
      
      const languageNames = {
        'it': 'Italian',
        'en': 'English', 
        'es': 'Spanish',
        'pt': 'Portuguese'
      };
      
      const targetLangName = languageNames[targetLanguage] || 'Italian';
      
      const response = await axios.post(this.openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator for an Italian e-commerce platform. Translate the following text to ${targetLangName} using e-commerce terminology. CRITICAL RULES: 
            1. NEVER translate Italian product names, food names, or brand names. Keep them exactly as they are in Italian.
            2. For ${targetLangName} responses, use appropriate greetings and e-commerce language.
            3. Maintain the same tone and structure as the original text.
            4. Return ONLY the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.0, // Zero temperature for translations - no creative interpretations
        max_tokens: 200
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe Translation Service'
        },
        timeout: 10000
      });

      const translation = response.data.choices[0]?.message?.content?.trim() || text;
      console.log(`✅ Translation to ${targetLanguage} successful:`);
      console.log('  Original:', text);
      console.log('  Translated:', translation);
      return translation;
    } catch (error) {
      console.error(`❌ Translation to ${targetLanguage} error:`, error);
      return text; // Return original text if translation fails
    }
  }

  // Removed hardcoded English detection - all text should be translated
}