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
      
      // 🔧 SMART TRANSLATION: Don't translate short/numeric responses when there's conversation history
      if (hasConversationHistory) {
        const trimmedText = text.trim();
        
        // Don't translate single numbers or very short responses
        if (/^[0-9]+$/.test(trimmedText) || trimmedText.length <= 3) {
          console.log('🔧 SKIPPING TRANSLATION: Short/numeric response with conversation history');
          return text;
        }
        
        // Don't translate common short responses
        const shortResponses = ['si', 'sí', 'no', 'ok', 'yes', 'grazie', 'bene', 'ciao'];
        if (shortResponses.includes(trimmedText.toLowerCase())) {
          console.log('🔧 SKIPPING TRANSLATION: Common short response with conversation history');
          return text;
        }
      }
      
      // 🔧 PRODUCT NAME PRESERVATION: Don't translate Italian product names
      const italianProductNames = [
        'tiramisù', 'tiramisu', 'cannolo', 'cannoli', 'sfogliatella', 'sfogliatelle',
        'parmigiano', 'mozzarella', 'burrata', 'prosciutto', 'pasta', 'pizza',
        'risotto', 'gnocchi', 'ravioli', 'tortellini', 'lasagne', 'bolognese',
        'arrabbiata', 'carbonara', 'amatriciana', 'pesto', 'ragù', 'sugo',
        'cubettata', 'cubetti', 'boccone', 'bocconi', 'julienne', 'fiammifero',
        'fiordilatte', 'fior di latte', 'ricotta', 'bufala', 'campana', 'dop'
      ];
      
      const lowerText = text.toLowerCase().trim();
      const foundProduct = italianProductNames.find(product => lowerText.includes(product));
      if (foundProduct) {
        console.log('🔧 SKIPPING TRANSLATION: Italian product name detected:', foundProduct);
        console.log('🔧 ORIGINAL TEXT:', text);
        return text;
      }
      
      // TEMP DEBUG: Force translation for longer texts
      console.log('🔧 DEBUG: Proceeding with translation');
      
      // const isTextEnglish = this.isEnglish(text);
      
      // if (isTextEnglish) {
      //   console.log('🔄 Text appears to be English, returning as-is');
      //   return text;
      // }

      const response = await axios.post(this.openRouterUrl, {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a translator for an e-commerce platform. Translate the user\'s message to English using e-commerce terminology. For questions about delivery times, shipping, receiving goods, use keywords like "delivery time", "shipping time", "delivery", "shipping". Return ONLY the English translation, no explanations.'
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

  private isEnglish(text: string): boolean {
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'which', 'that', 'this', 'is', 'are', 'do', 'does', 'can', 'will', 'would', 'should'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    // Return true only if we find actual English words, not just latin characters
    return englishWordCount > 0;
  }
}