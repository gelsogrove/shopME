import { Request, Response, Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { asyncMiddleware } from '../middlewares/async.middleware';
// Commento temporaneamente per i test
// import { authMiddleware } from '../middlewares/auth.middleware';
import { prisma } from '../lib/prisma';

// Create controller instance
const productController = new ProductController();

// Create a router
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - price
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: ID univoco del prodotto
 *         name:
 *           type: string
 *           description: Nome del prodotto
 *         description:
 *           type: string
 *           description: Descrizione dettagliata del prodotto
 *         price:
 *           type: number
 *           format: float
 *           description: Prezzo del prodotto
 *         stock:
 *           type: integer
 *           description: Quantità disponibile in magazzino
 *         image:
 *           type: string
 *           description: URL dell'immagine del prodotto
 *         isActive:
 *           type: boolean
 *           description: Indica se il prodotto è attivo e disponibile
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, OUT_OF_STOCK]
 *           description: Stato del prodotto
 *         slug:
 *           type: string
 *           description: Versione URL-friendly del nome del prodotto
 *         workspaceId:
 *           type: string
 *           description: ID del workspace a cui appartiene il prodotto
 *         categoryId:
 *           type: string
 *           description: ID della categoria del prodotto
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione del prodotto
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data dell'ultimo aggiornamento del prodotto
 */

// Log per debug
console.log('Inizializzazione delle route dei prodotti');

// Endpoint di diagnostica per verificare tutti i prodotti nel DB
router.get('/debug/products', asyncMiddleware(async (req: Request, res: Response) => {
  // Conta il numero totale di prodotti
  const count = await prisma.products.count();
  
  // Prendi i primi 20 prodotti dal DB
  const products = await prisma.products.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' }
  });
  
  return res.json({
    totalCount: count,
    sample: products.map(p => ({
      id: p.id,
      name: p.name,
      workspaceId: p.workspaceId,
      isActive: p.isActive,
      status: p.status,
      createdAt: p.createdAt
    }))
  });
}));

// Endpoint di diagnostica per vedere tutti i prodotti di uno specifico workspace
router.get('/debug/workspaces/:workspaceId/products', asyncMiddleware(async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  
  if (!workspaceId) {
    return res.status(400).json({ error: 'WorkspaceId richiesto' });
  }
  
  // Conta il numero totale di prodotti nel workspace
  const count = await prisma.products.count({
    where: { workspaceId }
  });
  
  // Prendi tutti i prodotti del workspace (max 50)
  const products = await prisma.products.findMany({
    where: { workspaceId },
    take: 50,
    orderBy: { updatedAt: 'desc' }
  });
  
  return res.json({
    workspaceId,
    totalInWorkspace: count,
    products
  });
}));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products:
 *   get:
 *     summary: Ottiene tutti i prodotti di un workspace
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numero di pagina per la paginazione
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Numero di elementi per pagina
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termine di ricerca per filtrare i prodotti
 *     responses:
 *       200:
 *         description: Lista dei prodotti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
// Public routes - Tutte le route sono pubbliche per i test
router.get('/workspaces/:workspaceId/products', (req, res, next) => {
  console.log('GET /workspaces/:workspaceId/products chiamata', {
    workspaceId: req.params.workspaceId,
    query: req.query
  });
  return asyncMiddleware(productController.getAllProducts)(req, res, next);
});

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/category/{categoryId}:
 *   get:
 *     summary: Ottiene tutti i prodotti di una specifica categoria
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID della categoria
 *     responses:
 *       200:
 *         description: Lista dei prodotti della categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/workspaces/:workspaceId/products/category/:categoryId', (req, res, next) => {
  console.log('GET /workspaces/:workspaceId/products/category/:categoryId chiamata', {
    workspaceId: req.params.workspaceId,
    categoryId: req.params.categoryId
  });
  return asyncMiddleware(productController.getProductsByCategory)(req, res, next);
});

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/{id}:
 *   get:
 *     summary: Ottiene un prodotto specifico
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del prodotto
 *     responses:
 *       200:
 *         description: Dettagli del prodotto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Prodotto non trovato
 */
router.get('/workspaces/:workspaceId/products/:id', (req, res, next) => {
  console.log('GET /workspaces/:workspaceId/products/:id chiamata', {
    workspaceId: req.params.workspaceId,
    id: req.params.id
  });
  return asyncMiddleware(productController.getProductById)(req, res, next);
});

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products:
 *   post:
 *     summary: Crea un nuovo prodotto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Prodotto creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
// Tutte le route per ora sono pubbliche per i test
router.post('/workspaces/:workspaceId/products', asyncMiddleware(productController.createProduct));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/{id}:
 *   put:
 *     summary: Aggiorna un prodotto esistente
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del prodotto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Prodotto aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Prodotto non trovato
 */
router.put('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.updateProduct));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/{id}:
 *   delete:
 *     summary: Elimina un prodotto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del prodotto
 *     responses:
 *       204:
 *         description: Prodotto eliminato con successo
 *       404:
 *         description: Prodotto non trovato
 */
router.delete('/workspaces/:workspaceId/products/:id', asyncMiddleware(productController.deleteProduct));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/{id}/stock:
 *   patch:
 *     summary: Aggiorna la quantità di stock di un prodotto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del prodotto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock
 *             properties:
 *               stock:
 *                 type: integer
 *                 description: Nuova quantità di stock
 *     responses:
 *       200:
 *         description: Stock aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.patch('/workspaces/:workspaceId/products/:id/stock', asyncMiddleware(productController.updateProductStock));

/**
 * @swagger
 * /api/workspaces/{workspaceId}/products/{id}/status:
 *   patch:
 *     summary: Aggiorna lo stato di un prodotto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del prodotto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, OUT_OF_STOCK]
 *                 description: Nuovo stato del prodotto
 *     responses:
 *       200:
 *         description: Stato aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.patch('/workspaces/:workspaceId/products/:id/status', asyncMiddleware(productController.updateProductStatus));

console.log('Route dei prodotti inizializzate');

export default router; 