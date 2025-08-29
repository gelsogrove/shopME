import axios from 'axios';

export class TranslationService {
  private openRouterApiKey: string;
  private openRouterUrl: string;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  public async translateToEnglish(text: string): Promise<string> {
    try {
      console.log('🌐 Translating text to English:', text);
      
      if (this.isEnglish(text)) {
        console.log('🔄 Text appears to be English, returning as-is');
        return text;
      }

      const response = await axios.post(this.openRouterUrl, {
        model: 'google/gemma-2-9b-it:free',
        messages: [
          {
            role: 'system',
            content: 'You are a translator. Translate the user\'s message to English. Return ONLY the English translation, no explanations.'
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
    const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().split(/\s+/);
    const englishWordCount = words.filter(word => englishWords.includes(word)).length;
    
    return englishWordCount > 0 || /^[a-zA-Z\s\?\!\.]+$/.test(text);
  }
}