import { Customers } from '@prisma/client';
import logger from '../utils/logger';

export interface PromptTemplateVariables {
  nameUser: string;
  discountUser: string;
  languageUser: string;
  phoneUser: string;
}

// Simple customer interface for template processing
export interface TemplateCustomer {
  id: string;
  name: string;
  phone: string;
  discount?: number;
  language?: string;
}

export class PromptTemplateService {
  
  /**
   * Process prompt template by replacing placeholders with customer data
   */
  static processPromptTemplate(promptTemplate: string, customer: Customers | TemplateCustomer): string {
    try {
      logger.info(`🔧 Processing prompt template for customer: ${customer.phone}`);
      
      // Extract customer information
      const variables: PromptTemplateVariables = {
        nameUser: customer.name || 'Customer',
        discountUser: customer.discount ? `${customer.discount}%` : '0%',
        languageUser: customer.language || 'en',
        phoneUser: customer.phone || 'unknown'
      };

      // Replace all placeholders
      let processedPrompt = promptTemplate;
      
      // Replace each variable
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), value);
      });

      logger.info(`🔧 Prompt template processed successfully`);
      logger.debug(`🔧 Variables used:`, variables);
      
      return processedPrompt;
      
    } catch (error) {
      logger.error('❌ Error processing prompt template:', error);
      // Return original prompt if processing fails
      return promptTemplate;
    }
  }

  /**
   * Get available template variables for documentation
   */
  static getAvailableVariables(): Record<string, string> {
    return {
      '{{nameUser}}': 'Customer name',
      '{{discountUser}}': 'Customer discount percentage',
      '{{languageUser}}': 'Customer preferred language',
      '{{phoneUser}}': 'Customer phone number'
    };
  }

  /**
   * Validate template syntax
   */
  static validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const availableVars = Object.keys(this.getAvailableVariables());
    
    // Find all placeholders in template
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    const matches = Array.from(template.matchAll(placeholderRegex));
    
    for (const match of matches) {
      const placeholder = `{{${match[1]}}}`;
      if (!availableVars.includes(placeholder)) {
        errors.push(`Unknown placeholder: ${placeholder}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
