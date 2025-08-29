export interface ToolDescription {
  name: string;
  description: string;
  whenToUse: string;
  examples: string[];
  output: string;
  notes: string;
}

export class ToolDescriptionsService {
  
  public getAllProducts(): ToolDescription {
    return {
      name: 'getAllProducts',
      description: 'RETURNS COMPLETE PRODUCT CATALOG WITH CODES, NAMES, PRICES, DESCRIPTIONS GROUPED BY CATEGORY WITH ICONS',
      whenToUse: 'when user asks for products list, catalog, or what products are available',
      examples: ['dammi la lista dei prodotti', 'che prodotti avete', 'catalogo', 'dammi prodotti', 'show me products', 'product list'],
      output: 'Products grouped by category with icons, including product codes, names, descriptions, and prices',
      notes: 'Returns full product catalog organized by categories in alphabetical order with category icons. Use this for ANY product-related request.'
    };
  }

  public getServices(): ToolDescription {
    return {
      name: 'getServices',
      description: 'RETURNS COMPLETE SERVICES CATALOG WITH CODES, NAMES, DESCRIPTIONS AND PRICES',
      whenToUse: 'when user asks for services list or what services are available',
      examples: ['che servizi avete', 'lista servizi', 'servizi disponibili', 'dammi servizi', 'show me services', 'what services do you offer'],
      output: 'Array of services with codes, names, descriptions and prices',
      notes: 'Returns full services catalog with pricing information. Use this for ANY service-related request.'
    };
  }

  public getOrdersListLink(): ToolDescription {
    return {
      name: 'getOrdersListLink',
      description: 'secure link to view orders or specific order by code',
      whenToUse: 'when user asks to see orders, order list, order history, or specific order by code',
      examples: ['dammi la lista degli ordini', 'voglio vedere i miei ordini', 'dammi link ordini', 'dammi link 20006'],
      output: 'Secure JWT-based link to orders page or specific order',
      notes: 'Generates time-limited secure link for order access. If orderCode is provided, generates link to specific order'
    };
  }

  public getShipmentTrackingLink(): ToolDescription {
    return {
      name: 'getShipmentTrackingLink',
      description: 'tracking link for order shipment status',
      whenToUse: 'when user asks about shipment tracking, delivery status, or where their order is',
      examples: ['dove è il mio ordine', 'tracking spedizione', 'stato spedizione', 'dove è la merce'],
      output: 'Tracking link and shipment information',
      notes: 'Provides shipment tracking for specific orders'
    };
  }

  public getCustomerProfileLink(): ToolDescription {
    return {
      name: 'getCustomerProfileLink',
      description: 'secure link to view and edit customer profile and shipping address',
      whenToUse: 'when user wants to change address, update profile, modify personal details, or change email',
      examples: ['voglio cambiare indirizzo', 'modifica profilo', 'aggiorna dati', 'cambia email', 'modifica indirizzo', 'change address', 'update profile'],
      output: 'Secure JWT-based link to profile page',
      notes: 'Allows customers to update shipping address and personal information securely'
    };
  }

  // public getAllCategories(): ToolDescription {
  //   return {
  //     name: 'getAllCategories',
  //     description: 'complete list of product categories',
  //     whenToUse: 'when user asks about categories, types of products, or what kinds of items are available',
  //     examples: ['che categorie avete', 'tipi di prodotti', 'categorie disponibili'],
  //     output: 'Array of product categories',
  //     notes: 'Returns organized list of all product categories'
  //   };
  // }

  // public getActiveOffers(): ToolDescription {
  //   return {
  //     name: 'getActiveOffers',
  //     description: 'current active offers and promotions',
  //     whenToUse: 'when user asks about offers, discounts, promotions, or deals',
  //     examples: ['che offerte avete', 'sconti disponibili', 'promozioni'],
  //     output: 'Array of active offers with discount details',
  //     notes: 'Returns current promotions and special deals'
  //   };
  // }

  // public contactOperator(): ToolDescription {
  //   return {
  //     name: 'contactOperator',
  //     description: 'human operator assistance',
  //     whenToUse: 'when user wants to speak with a person, needs help from an operator, or requests human assistance',
  //     examples: ['voglio parlare con un operatore', 'aiuto umano', 'assistenza'],
  //     output: 'Confirmation that operator will be contacted',
  //     notes: 'Connects customer with human support'
  //   };
  // }

  // public confirmOrderFromConversation(): ToolDescription {
  //   return {
  //     name: 'confirmOrderFromConversation',
  //     description: 'confirm and place order from conversation',
  //     whenToUse: 'when user wants to place order, confirm cart items, or proceed with purchase',
  //     examples: ['metti nel carrello', 'confermo ordine', 'voglio ordinare'],
  //     output: 'Order confirmation with details',
  //     notes: 'Processes conversational order requests'
  //   };
  // }

  // public ragSearch(): ToolDescription {
  //   return {
  //     name: 'ragSearch',
  //     description: 'SEMANTIC SEARCH FOR FAQ, POLICIES, AND GENERAL INFORMATION',
  //     whenToUse: 'ONLY for questions about company policies, shipping, returns, general information - NOT for products or services',
  //     examples: ['quanto costa la spedizione', 'politica di reso', 'informazioni azienda', 'come funziona il reso'],
  //     output: 'Relevant information from knowledge base',
  //     notes: 'Searches FAQ, policies, and general information using semantic search. DO NOT use for product or service requests.'
  //   };
  // }

  public getToolDescriptions(): ToolDescription[] {
    return [
      this.getAllProducts(),
      this.getServices(),
      this.getOrdersListLink(),
      this.getShipmentTrackingLink(),
      this.getCustomerProfileLink(),
      // this.getAllCategories(),
      // this.getActiveOffers(),
      // this.contactOperator(),
      // this.confirmOrderFromConversation(),
      // this.ragSearch()
    ];
  }
}
