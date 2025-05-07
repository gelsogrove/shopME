import { useWorkspace } from "@/hooks/use-workspace";

/**
 * Get the currency symbol based on the currency code
 * @param currencyCode The currency code (e.g., USD, EUR, GBP)
 * @returns The currency symbol (e.g., $, €, £)
 */
export const getCurrencySymbol = (currencyCode: string = 'EUR'): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  return symbols[currencyCode] || currencyCode;
};

/**
 * Format a price with the workspace currency symbol
 * @param price The price to format
 * @param currencyCode Optional currency code, defaults to workspace currency
 * @returns Formatted price with currency symbol (e.g., $10.00)
 */
export const formatPrice = (price: number, currencyCode?: string): string => {
  // Get workspace from hook if no currency code is provided
  let currency = currencyCode;
  
  if (!currency) {
    try {
      // Try to get from sessionStorage directly for SSR compatibility
      const workspaceJson = sessionStorage.getItem('currentWorkspace');
      if (workspaceJson) {
        const workspace = JSON.parse(workspaceJson);
        currency = workspace.currency;
      }
    } catch (e) {
      console.error('Error accessing workspace in formatPrice:', e);
      currency = 'EUR'; // Default fallback
    }
  }
  
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${price.toFixed(2)}`;
};

/**
 * Format a price with the workspace currency symbol - React hook version
 * This hook is preferable in React components where you have access to the context
 */
export const useFormatPrice = () => {
  const { workspace } = useWorkspace();
  
  return (price: number, currencyCode?: string): string => {
    const currency = currencyCode || workspace?.currency || 'EUR';
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${price.toFixed(2)}`;
  };
}; 