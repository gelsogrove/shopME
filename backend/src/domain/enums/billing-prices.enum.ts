/**
 * Enum containing all billing prices for the system.
 * All prices are in EUR.
 */
export enum BillingPrices {
  // Monthly fixed costs
  MONTHLY_CHANNEL_COST = 19.0,

  // Per-action costs - SIMPLIFIED: ogni messaggio costa €0.15
  MESSAGE = 0.15, // Cost per message/interaction
  NEW_CUSTOMER = 1.5, // Cost for new customer
  HUMAN_SUPPORT = 1.0, // Cost for human support escalation
  PUSH_MESSAGE = 1.0, // Cost for push notification
  NEW_ORDER = 1.5, // Cost for new order
  NEW_FAQ = 0.5, // Cost for new FAQ creation
  ACTIVE_OFFER = 0.5, // Cost for active offer
}
