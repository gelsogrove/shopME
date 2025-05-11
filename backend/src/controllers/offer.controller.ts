import { Request, Response, Router } from 'express';
import { OfferService } from '../application/services/offer.service';
import logger from '../utils/logger';

// Create a new router instance
const router = Router();
const offerService = new OfferService();

/**
 * Get all offers
 * GET /offers
 */
// @ts-ignore - Express typing issues
router.get('/', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offers = await offerService.getAllOffers(workspaceId as string);
    return res.json(offers);
  } catch (error) {
    logger.error('Error getting offers:', error);
    return res.status(500).json({ error: 'Failed to get offers' });
  }
});

/**
 * Get active offers
 * GET /offers/active
 */
// @ts-ignore - Express typing issues
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { workspaceId, categoryId } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offers = await offerService.getActiveOffers(
      workspaceId as string, 
      categoryId as string | undefined
    );
    return res.json(offers);
  } catch (error) {
    logger.error('Error getting active offers:', error);
    return res.status(500).json({ error: 'Failed to get active offers' });
  }
});

/**
 * Get offer by ID
 * GET /offers/:id
 */
// @ts-ignore - Express typing issues
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workspaceId } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offer = await offerService.getOfferById(id, workspaceId as string);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    return res.json(offer);
  } catch (error) {
    logger.error(`Error getting offer ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to get offer' });
  }
});

/**
 * Create a new offer
 * POST /offers
 */
// @ts-ignore - Express typing issues
router.post('/', async (req: Request, res: Response) => {
  try {
    const offer = await offerService.createOffer(req.body);
    return res.status(201).json(offer);
  } catch (error) {
    logger.error('Error creating offer:', error);
    return res.status(500).json({ error: 'Failed to create offer' });
  }
});

/**
 * Update an offer
 * PUT /offers/:id
 */
// @ts-ignore - Express typing issues
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await offerService.updateOffer(id, req.body);
    return res.json(offer);
  } catch (error) {
    logger.error(`Error updating offer ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update offer' });
  }
});

/**
 * Delete an offer
 * DELETE /offers/:id
 */
// @ts-ignore - Express typing issues
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await offerService.deleteOffer(id);
    return res.json({ success: result });
  } catch (error) {
    logger.error(`Error deleting offer ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete offer' });
  }
});

export default router; 