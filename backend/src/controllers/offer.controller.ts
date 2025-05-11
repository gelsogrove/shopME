import { Request, Response, Router } from 'express';
import { OfferService } from '../application/services/offer.service';
import { authMiddleware } from '../interfaces/http/middlewares/auth.middleware';
import logger from '../utils/logger';

// Create a new router instance
const router = Router();
const offerService = new OfferService();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * Get all offers
 * GET /workspaces/:workspaceId/offers
 */
// @ts-ignore - Express typing issues
router.get('/', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offers = await offerService.getAllOffers(workspaceId);
    return res.json(offers);
  } catch (error) {
    logger.error('Error getting offers:', error);
    return res.status(500).json({ error: 'Failed to get offers' });
  }
});

/**
 * Get active offers
 * GET /workspaces/:workspaceId/offers/active
 */
// @ts-ignore - Express typing issues
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { categoryId } = req.query;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offers = await offerService.getActiveOffers(
      workspaceId, 
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
 * GET /workspaces/:workspaceId/offers/:id
 */
// @ts-ignore - Express typing issues
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id, workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const offer = await offerService.getOfferById(id, workspaceId);
    
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
 * POST /workspaces/:workspaceId/offers
 */
// @ts-ignore - Express typing issues
router.post('/', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const offerData = { ...req.body, workspaceId };
    const offer = await offerService.createOffer(offerData);
    return res.status(201).json(offer);
  } catch (error) {
    logger.error('Error creating offer:', error);
    return res.status(500).json({ error: 'Failed to create offer' });
  }
});

/**
 * Update an offer
 * PUT /workspaces/:workspaceId/offers/:id
 */
// @ts-ignore - Express typing issues
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id, workspaceId } = req.params;
    // Ensure the request belongs to the workspace
    const offerData = { ...req.body, workspaceId };
    const offer = await offerService.updateOffer(id, offerData);
    return res.json(offer);
  } catch (error) {
    logger.error(`Error updating offer ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to update offer' });
  }
});

/**
 * Delete an offer
 * DELETE /workspaces/:workspaceId/offers/:id
 */
// @ts-ignore - Express typing issues
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id, workspaceId } = req.params;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    
    const result = await offerService.deleteOffer(id);
    return res.json({ success: result });
  } catch (error) {
    logger.error(`Error deleting offer ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Failed to delete offer' });
  }
});

export default router; 