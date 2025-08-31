import axios from 'axios';

export class TranslationService {
  private openRouterApiKey: string;
  private openRouterUrl: string;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  public async detectLanguage(text: string): Promise<string> {
    try {
      console.log('🔍 Detecting language for:', text);
      
      const response = await axios.post(this.openRouterUrl, {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a language detector. Detect the language of the user message and return ONLY the 2-letter ISO code (en, it, es, fr, de, pt, etc). Return only the code, nothing else.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      }, {
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'ShopMe Language Detection'
        },
        timeout: 5000
      });

      const detectedLang = response.data.choices[0]?.message?.content?.trim().toLowerCase() || 'it';
      console.log('🔍 Detected language:', detectedLang);
      return detectedLang;

    } catch (error) {
      console.error('❌ Language detection failed, defaulting to Italian:', error instanceof Error ? error.message : 'Unknown error');
      return 'it'; // Default to Italian if detection fails
    }
  }

  public async translateForSearchRag(text: string): Promise<string> {
    try {
      console.log('🔍🌐 SearchRag Translation - detecting language for:', text);
      
      // Step 1: Try LLM language detection
      let detectedLang;
      try {
        detectedLang = await this.detectLanguage(text);
      } catch (error) {
        console.log('🔄 LLM detection failed, using pattern fallback');
        detectedLang = this.detectLanguageWithPatterns(text);
      }
      
      // Step 2: Only translate if not English
      if (detectedLang === 'en') {
        console.log('🔄 Text is English, no translation needed');
        return text;
      }
      
      console.log(`🌐 Text is ${detectedLang}, translating to English...`);
      
      // Step 3: Try LLM translation with Claude-3.5-Sonnet (same as formatter)
      try {
        const response = await axios.post(this.openRouterUrl, {
          model: 'anthropic/claude-3-5-sonnet-20241022',
          messages: [
            {
              role: 'system',
              content: 'You are a translator for an e-commerce platform. Translate the user\'s message to English using e-commerce terminology. For questions about delivery times, shipping, receiving goods, use keywords like "delivery time", "shipping time", "delivery", "shipping". For casual greetings like "ciao come va", translate to "hello how are you". Return ONLY the English translation, no explanations.'
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1,
          max_tokens: 100
        }, {
          headers: {
            'Authorization': `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'ShopMe SearchRag Translation'
          },
          timeout: 10000
        });

        const translation = response.data.choices[0]?.message?.content?.trim() || text;
        console.log('✅ SearchRag translation successful:', translation);
        return translation;
      } catch (error) {
        console.log('🔄 LLM translation failed, using pattern fallback');
        return this.translateWithPatterns(text);
      }

    } catch (error) {
      console.error('❌ SearchRag translation failed, using original text:', error instanceof Error ? error.message : 'Unknown error');
      return text;
    }
  }

  private detectLanguageWithPatterns(text: string): string {
    const italianPatterns = [
      /\b(quanto|come|quando|dove|perché|cosa|chi|cui)\b/i,
      /\b(ordine|tempo|arriva|prodotti|offerte|servizi)\b/i,
      /\b(voglio|posso|avete|sono|hai|abbiamo)\b/i,
      /\b(della|dello|nella|nello|alla|allo)\b/i
    ];
    
    const englishPatterns = [
      /\b(how|when|where|why|what|which|who)\b/i,
      /\b(order|time|delivery|products|offers|services)\b/i,
      /\b(want|can|have|are|you|we|they)\b/i,
      /\b(the|and|or|but|with|for|from)\b/i
    ];
    
    const italianScore = italianPatterns.reduce((score, pattern) => 
      score + (pattern.test(text) ? 1 : 0), 0);
    const englishScore = englishPatterns.reduce((score, pattern) => 
      score + (pattern.test(text) ? 1 : 0), 0);
    
    return italianScore > englishScore ? 'it' : 'en';
  }

  private translateWithPatterns(text: string): string {
    const translations = {
      'in quanto tempo arriva l\'ordine': 'how long does the order take to arrive',
      'in quanto tempo arriva l\'ordine?': 'how long does the order take to arrive?',
      'quanto tempo ci vuole': 'how long does it take',
      'quando arriva': 'when does it arrive',
      'tempi di consegna': 'delivery times',
      'spedizione': 'shipping',
      'che prodotti avete': 'what products do you have',
      'cosa vendete': 'what do you sell',
      'offerte': 'offers',
      'sconti': 'discounts'
    };
    
    const lowerText = text.toLowerCase();
    for (const [italian, english] of Object.entries(translations)) {
      if (lowerText.includes(italian.toLowerCase())) {
        console.log(`🔄 Pattern translation: "${italian}" → "${english}"`);
        return english;
      }
    }
    
    console.log('🔄 No pattern match, returning original text');
    return text;
  }

  public async translateToEnglish(text: string): Promise<string> {
    try {
      console.log('🌐 Translating text to English:', text);
      
      if (this.isEnglish(text)) {
        console.log('🔄 Text appears to be English, returning as-is');
        return text;
      }

      const response = await axios.post(this.openRouterUrl, {
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          {
            role: 'system',
            content: 'You are a translator for an e-commerce platform. Translate the user\'s message to English using e-commerce terminology. For questions about delivery times, shipping, receiving goods, use keywords like "delivery time", "shipping time", "delivery", "shipping". For casual greetings like "ciao come va", translate to "hello how are you". Return ONLY the English translation, no explanations.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
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
      console.log('✅ Translation successful:', translation);
      return translation;

    } catch (error) {
      console.error('❌ Translation failed, using original text:', error instanceof Error ? error.message : 'Unknown error');
      return text;
    }
  }

  private isEnglish(text: string): boolean {
    // More specific English detection - look for multiple indicators
    const englishWords = ['the', 'and', 'or', 'but', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'which', 'that', 'this', 'is', 'are', 'do', 'does', 'can', 'will', 'would', 'should', 'have', 'has', 'had', 'you', 'your', 'my', 'me', 'we', 'us', 'they', 'them'];
    const italianWords = ['che', 'cosa', 'come', 'quando', 'dove', 'perché', 'quanto', 'quale', 'chi', 'cui', 'ordine', 'tempo', 'arriva', 'voglio', 'posso', 'avete', 'sono', 'sei', 'siamo', 'siete', 'hanno', 'ho', 'hai', 'abbiamo', 'avete', 'della', 'dello', 'nella', 'nello', 'alla', 'allo'];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    const italianWordCount = words.filter(word => italianWords.includes(word)).length;
    
    // If we have Italian words, it's Italian
    if (italianWordCount > 0) {
      return false;
    }
    
    // Only consider it English if we have multiple English words or very clear English indicators
    return englishWordCount >= 2 || (englishWordCount === 1 && words.length === 1);
  }
}