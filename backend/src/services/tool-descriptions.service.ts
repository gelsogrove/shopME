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
      description: 'complete product catalog',
      whenToUse: 'when user asks for products list, catalog, or what products are available',
      examples: ['dammi la lista dei prodotti', 'che prodotti avete', 'catalogo'],
      output: 'Array of products with names, prices, descriptions and availability',
      notes: 'Returns full product catalog with real-time pricing and stock information'
    };
  }

  public getServices(): ToolDescription {
    return {
      name: 'getServices',
      description: 'complete services catalog',
      whenToUse: 'when user asks for services list or what services are available',
      examples: ['che servizi avete', 'lista servizi', 'servizi disponibili'],
      output: 'Array of services with descriptions and prices',
      notes: 'Returns full services catalog with pricing information'
    };
  }

  public getOrdersListLink(): ToolDescription {
    return {
      name: 'getOrdersListLink',
      description: 'secure link to view orders',
      whenToUse: 'when user asks to see orders, order list, or order history',
      examples: ['dammi la lista degli ordini', 'voglio vedere i miei ordini', 'cronologia ordini'],
      output: 'Secure JWT-based link to orders page',
      notes: 'Generates time-limited secure link for order access'
    };
  }

  public getCustomerProfileLink(): ToolDescription {
    return {
      name: 'getCustomerProfileLink',
      description: 'secure link to view and edit profile',
      whenToUse: 'when user wants to change address, update profile, or modify personal details',
      examples: ['voglio cambiare indirizzo', 'modifica profilo', 'aggiorna dati'],
      output: 'Secure JWT-based link to profile page',
      notes: 'Allows customers to update shipping address and personal information'
    };
  }

  public getAllCategories(): ToolDescription {
    return {
      name: 'getAllCategories',
      description: 'complete list of product categories',
      whenToUse: 'when user asks about categories, types of products, or what kinds of items are available',
      examples: ['che categorie avete', 'tipi di prodotti', 'categorie disponibili'],
      output: 'Array of product categories',
      notes: 'Returns organized list of all product categories'
    };
  }

  public getActiveOffers(): ToolDescription {
    return {
      name: 'getActiveOffers',
      description: 'current active offers and promotions',
      whenToUse: 'when user asks about offers, discounts, promotions, or deals',
      examples: ['che offerte avete', 'sconti disponibili', 'promozioni'],
      output: 'Array of active offers with discount details',
      notes: 'Returns current promotions and special deals'
    };
  }

  public contactOperator(): ToolDescription {
    return {
      name: 'contactOperator',
      description: 'human operator assistance',
      whenToUse: 'when user wants to speak with a person, needs help from an operator, or requests human assistance',
      examples: ['voglio parlare con un operatore', 'aiuto umano', 'assistenza'],
      output: 'Confirmation that operator will be contacted',
      notes: 'Connects customer with human support'
    };
  }

  public confirmOrderFromConversation(): ToolDescription {
    return {
      name: 'confirmOrderFromConversation',
      description: 'confirm and place order from conversation',
      whenToUse: 'when user wants to place order, confirm cart items, or proceed with purchase',
      examples: ['metti nel carrello', 'confermo ordine', 'voglio ordinare'],
      output: 'Order confirmation with details',
      notes: 'Processes conversational order requests'
    };
  }

  public ragSearch(): ToolDescription {
    return {
      name: 'ragSearch',
      description: 'semantic search',
      whenToUse: 'for questions about company policies, shipping, returns, general information',
      examples: ['quanto costa la spedizione', 'politica di reso', 'informazioni azienda'],
      output: 'Relevant information from knowledge base',
      notes: 'Searches FAQ, policies, and general information using semantic search'
    };
  }

  public getToolDescriptions(): ToolDescription[] {
    return [
      this.getAllProducts(),
      this.getServices(),
      this.getOrdersListLink(),
      this.getCustomerProfileLink(),
      this.getAllCategories(),
      this.getActiveOffers(),
      this.contactOperator(),
      this.confirmOrderFromConversation(),
      this.ragSearch()
    ];
  }
}
