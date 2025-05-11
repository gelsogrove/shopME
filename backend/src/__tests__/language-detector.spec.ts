import {
    detectGreeting,
    detectLanguage,
    getLanguageDbCode,
    normalizeDatabaseLanguage
} from '../utils/language-detector';

describe('Language Detector', () => {
  describe('detectGreeting', () => {
    it('should detect English greetings', () => {
      expect(detectGreeting('hello')).toBe('en');
      expect(detectGreeting('hi there')).toBe('en');
      expect(detectGreeting('good morning')).toBe('en');
      expect(detectGreeting('Good Evening')).toBe('en');
    });

    it('should detect Italian greetings', () => {
      expect(detectGreeting('ciao')).toBe('it');
      expect(detectGreeting('buongiorno')).toBe('it');
      expect(detectGreeting('buonasera')).toBe('it');
      expect(detectGreeting('Salve')).toBe('it');
    });

    it('should detect Spanish greetings', () => {
      expect(detectGreeting('hola')).toBe('es');
      expect(detectGreeting('buenos dias')).toBe('es');
      expect(detectGreeting('buenas tardes')).toBe('es');
      expect(detectGreeting('Buenas Noches')).toBe('es');
    });

    it('should detect Portuguese greetings', () => {
      expect(detectGreeting('ola')).toBe('pt');
      expect(detectGreeting('olá')).toBe('pt');
      expect(detectGreeting('bom dia')).toBe('pt');
      expect(detectGreeting('Boa Noite')).toBe('pt');
    });

    it('should return null for non-greeting messages', () => {
      expect(detectGreeting('I want to buy something')).toBeNull();
      expect(detectGreeting('what products do you have?')).toBeNull();
      expect(detectGreeting('1234')).toBeNull();
      expect(detectGreeting('')).toBeNull();
    });
  });

  describe('detectLanguage', () => {
    it('should detect English messages', () => {
      expect(detectLanguage('I would like to order some Italian products')).toBe('en');
      expect(detectLanguage('What is the price of your olive oil?')).toBe('en');
      expect(detectLanguage('Can you help me with my order please?')).toBe('en');
    });

    it('should detect Italian messages', () => {
      expect(detectLanguage('Vorrei ordinare alcuni prodotti italiani')).toBe('it');
      expect(detectLanguage('Qual è il prezzo del vostro olio d\'oliva?')).toBe('it');
      expect(detectLanguage('Puoi aiutarmi con il mio ordine per favore?')).toBe('it');
    });

    it('should detect Spanish messages', () => {
      expect(detectLanguage('Me gustaría pedir algunos productos italianos')).toBe('es');
      expect(detectLanguage('¿Cuál es el precio de su aceite de oliva?')).toBe('es');
      expect(detectLanguage('¿Puede ayudarme con mi pedido por favor?')).toBe('es');
    });

    it('should detect Portuguese messages', () => {
      expect(detectLanguage('Eu gostaria de encomendar alguns produtos italianos')).toBe('pt');
      expect(detectLanguage('Qual é o preço do seu azeite?')).toBe('pt');
      expect(detectLanguage('Pode me ajudar com o meu pedido, por favor?')).toBe('pt');
    });

    it('should handle empty or short messages', () => {
      expect(detectLanguage('')).toBe('en'); // Default to English
      expect(detectLanguage('hi')).toBe('en');
      expect(detectLanguage('ok')).toBe('en');
    });

    it('should handle mixed-language messages with a bias to the dominant language', () => {
      // Spanish with some English words
      expect(detectLanguage('Hello, necesito información sobre los productos')).toBe('es');
      
      // English with some Italian words
      expect(detectLanguage('I would like to buy some cibo italiano')).toBe('en');
    });
  });

  describe('getLanguageDbCode', () => {
    it('should convert detected language codes to database codes', () => {
      expect(getLanguageDbCode('en')).toBe('ENG');
      expect(getLanguageDbCode('it')).toBe('IT');
      expect(getLanguageDbCode('es')).toBe('ESP');
      expect(getLanguageDbCode('pt')).toBe('PRT');
    });
  });

  describe('normalizeDatabaseLanguage', () => {
    it('should normalize database language codes to standard language codes', () => {
      expect(normalizeDatabaseLanguage('ENG')).toBe('en');
      expect(normalizeDatabaseLanguage('IT')).toBe('it');
      expect(normalizeDatabaseLanguage('ESP')).toBe('es');
      expect(normalizeDatabaseLanguage('PRT')).toBe('pt');
      expect(normalizeDatabaseLanguage('ENGLISH')).toBe('en');
      expect(normalizeDatabaseLanguage('ITALIAN')).toBe('it');
      expect(normalizeDatabaseLanguage('SPANISH')).toBe('es');
      expect(normalizeDatabaseLanguage('PORTUGUESE')).toBe('pt');
    });

    it('should handle undefined or invalid codes', () => {
      expect(normalizeDatabaseLanguage(undefined as any)).toBe('en');
      expect(normalizeDatabaseLanguage('')).toBe('en');
      expect(normalizeDatabaseLanguage('UNKNOWN')).toBe('en');
    });
  });
}); 