import { Request, Response } from "express";
import { FaqService } from "../../../application/services/faq.service";
import logger from "../../../utils/logger";

/**
 * FaqController class
 * Handles HTTP requests related to FAQs
 */
export class FaqController {
  private faqService: FaqService;
  
  constructor() {
    this.faqService = new FaqService();
  }

  /**
   * Get all FAQs for a workspace
   */
  async getAllFaqs(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      
      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }
      
      const faqs = await this.faqService.getAllForWorkspace(workspaceId);
      return res.json(faqs);
    } catch (error) {
      logger.error("Error getting FAQs:", error);
      return res.status(500).json({ error: 'Failed to get FAQs' });
    }
  }

  /**
   * Get FAQ by ID
   */
  async getFaqById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      const faq = await this.faqService.getById(id);
      
      if (!faq) {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      
      return res.json(faq);
    } catch (error) {
      logger.error(`Error getting FAQ ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to get FAQ' });
    }
  }

  /**
   * Create a new FAQ
   */
  async createFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params;
      
      if (!workspaceId) {
        return res.status(400).json({ error: 'Workspace ID is required' });
      }
      
      const { question, answer, isActive } = req.body;
      const faqData = { 
        question, 
        answer, 
        isActive: isActive !== undefined ? isActive : true,
        workspaceId 
      };
      
      const faq = await this.faqService.create(faqData);
      return res.status(201).json(faq);
    } catch (error: any) {
      logger.error("Error creating FAQ:", error);
      
      if (error.message === 'Missing required fields' || error.message === 'Invalid FAQ data') {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to create FAQ' });
    }
  }

  /**
   * Update a FAQ
   */
  async updateFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { question, answer, isActive } = req.body;
      
      const faq = await this.faqService.update(id, {
        question,
        answer,
        isActive
      });
      
      return res.json(faq);
    } catch (error: any) {
      logger.error(`Error updating FAQ ${req.params.id}:`, error);
      
      if (error.message === 'FAQ not found') {
        return res.status(404).json({ error: 'FAQ not found' });
      }
      
      if (error.message === 'Invalid FAQ data') {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to update FAQ' });
    }
  }

  /**
   * Delete a FAQ
   */
  async deleteFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      try {
        await this.faqService.delete(id);
        return res.status(204).send();
      } catch (error: any) {
        if (error.message === 'FAQ not found') {
          return res.status(404).json({ error: 'FAQ not found' });
        }
        
        throw error;
      }
    } catch (error) {
      logger.error(`Error deleting FAQ ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to delete FAQ' });
    }
  }
} 