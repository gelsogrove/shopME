export interface ToolDescription {
  name: string
  description: string
  whenToUse: string
  examples: string[]
  output: string
  notes: string
}

export class ToolDescriptionsService {
  public getAllProducts(): ToolDescription {
    return {
      name: "getAllProducts",
      description:
        "RETURNS COMPLETE PRODUCT CATALOG WITH CODES, NAMES, PRICES, DESCRIPTIONS GROUPED BY CATEGORY WITH ICONS",
      whenToUse:
        "when user asks for products list, catalog, or what products are available",
      examples: [
        "dammi la lista dei prodotti",
        "che prodotti avete",
        "catalogo",
        "dammi prodotti",
        "show me products",
        "product list",
      ],
      output:
        "Products grouped by category with icons, including product codes, names, descriptions, and prices",
      notes:
        "Returns full product catalog organized by categories in alphabetical order with category icons. Use this for ANY product-related request.",
    }
  }

  public getServices(): ToolDescription {
    return {
      name: "getServices",
      description:
        "RETURNS COMPLETE SERVICES CATALOG WITH CODES, NAMES, DESCRIPTIONS AND PRICES",
      whenToUse:
        "when user asks for services list or what services are available",
      examples: [
        "che servizi avete",
        "lista servizi",
        "servizi disponibili",
        "dammi servizi",
        "show me services",
        "what services do you offer",
      ],
      output: "Array of services with codes, names, descriptions and prices",
      notes:
        "Returns full services catalog with pricing information. Use this for ANY service-related request.",
    }
  }

  public getOrdersListLink(): ToolDescription {
    return {
      name: "getOrdersListLink",
      description: "secure link to view orders or specific order by code",
      whenToUse:
        "when user asks to see orders, order list, order history, or specific order by code",
      examples: [
        "dammi la lista degli ordini",
        "voglio vedere i miei ordini",
        "dammi link ordini",
        "dammi link 20006",
      ],
      output: "Secure JWT-based link to orders page or specific order",
      notes:
        "Generates time-limited secure link for order access. If orderCode is provided, generates link to specific order",
    }
  }

  public getShipmentTrackingLink(): ToolDescription {
    return {
      name: "getShipmentTrackingLink",
      description: "tracking link for order shipment status",
      whenToUse:
        "when user asks about shipment tracking, delivery status, or where their order is",
      examples: [
        "dove è il mio ordine",
        "tracking spedizione",
        "stato spedizione",
        "dove è la merce",
      ],
      output: "Tracking link and shipment information",
      notes: "Provides shipment tracking for specific orders",
    }
  }

  public getCustomerProfileLink(): ToolDescription {
    return {
      name: "getCustomerProfileLink",
      description:
        "secure link to view and edit customer profile, personal data, shipping address, and email",
      whenToUse:
        "when user wants to change address, update profile, modify personal details, change email, edit personal information, or update contact details",
      examples: [
        "voglio cambiare indirizzo",
        "modifica profilo", 
        "aggiorna dati",
        "cambia email",
        "voglio modificare la mia mail",
        "modificare email",
        "aggiornare informazioni personali",
        "modificare dati personali",
        "modifica indirizzo",
        "change address",
        "update profile",
      ],
      output: "Secure JWT-based link to profile page",
      notes:
        "Allows customers to update shipping address and personal information securely",
    }
  }

  public getAllCategories(): ToolDescription {
    return {
      name: "getAllCategories",
      description:
        "complete list of product categories with names and descriptions",
      whenToUse:
        "when user asks about categories, types of products, or what kinds of items are available",
      examples: [
        "che categorie avete",
        "tipi di prodotti",
        "categorie disponibili",
        "show me categories",
        "what categories do you have",
        "product types",
      ],
      output: "Array of product categories with names and descriptions",
      notes: "Returns organized list of all product categories alphabetically",
    }
  }

  public getActiveOffers(): ToolDescription {
    return {
      name: "getActiveOffers",
      description:
        "current active offers, discounts, promotions and special deals",
      whenToUse:
        "when user asks about offers, discounts, promotions, sales, or deals",
      examples: [
        "che offerte avete",
        "sconti disponibili",
        "promozioni",
        "saldi",
        "show me offers",
        "any deals",
        "discounts",
      ],
      output:
        "Array of active offers with discount percentages, dates and categories",
      notes:
        "Returns only currently active promotions and special deals with discount details",
    }
  }

  public contactOperator(): ToolDescription {
    return {
      name: "contactOperator",
      description: "escalate to human operator for complex assistance",
      whenToUse:
        "when user wants to speak with a person, needs help from an operator, requests human assistance, or chatbot cannot help",
      examples: [
        "voglio parlare con un operatore",
        "aiuto umano",
        "assistenza umana",
        "parla con una persona",
        "operatore",
        "human operator",
        "speak with someone",
        "human assistance",
        "talk to a person",
      ],
      output:
        "Confirmation that operator will be contacted with customer details",
      notes:
        "Escalates customer to human support and logs the request for operator attention",
    }
  }

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

  // SearchRag is now used as fallback only - not in main tool list
  // public SearchRag(): ToolDescription {
  //   return {
  //     name: "SearchRag",
  //     description:
  //       "SEMANTIC SEARCH FOR SPECIFIC QUESTIONS AND INFORMATION",
  //     whenToUse:
  //       "Used automatically as fallback when no specific function matches",
  //     examples: [
  //       "dimmi di più sulla mozzarella",
  //       "quanto ci vuole per ricevere",
  //       "tempi di consegna",
  //       "caratteristiche prodotto",
  //       "ingredienti",
  //     ],
  //     output:
  //       "Precise information from products, services, FAQs and documents database",
  //     notes:
  //       "FALLBACK function for specific searches. Used when no other function matches.",
  //   }
  // }

  public getToolDescriptions(): ToolDescription[] {
    return [
      this.getAllProducts(),
      this.getServices(),
      this.getOrdersListLink(),
      this.getShipmentTrackingLink(),
      this.getCustomerProfileLink(),
      this.getAllCategories(),
      this.getActiveOffers(),
      this.contactOperator(),
      // SearchRag is handled as fallback, not in tool list
    ]
  }
}
