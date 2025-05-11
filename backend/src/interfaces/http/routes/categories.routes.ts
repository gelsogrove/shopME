import { Router } from "express";
import { CategoriesController } from "../controllers/categories.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: ID univoco della categoria
 *         name:
 *           type: string
 *           description: Nome della categoria
 *         slug:
 *           type: string
 *           description: Versione URL-friendly del nome della categoria
 *         description:
 *           type: string
 *           description: Descrizione della categoria
 *         isActive:
 *           type: boolean
 *           description: Indica se la categoria è attiva
 *         workspaceId:
 *           type: string
 *           description: ID del workspace a cui appartiene la categoria
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione della categoria
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data dell'ultimo aggiornamento della categoria
 */

export const categoriesRouter = (controller: CategoriesController): Router => {
  const router = Router({ mergeParams: true });

  // All routes require authentication
  router.use(authMiddleware);

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/categories:
   *   get:
   *     summary: Ottiene tutte le categorie di un workspace
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID del workspace
   *     responses:
   *       200:
   *         description: Lista delle categorie
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Category'
   */
  router.get("/", controller.getCategoriesForWorkspace.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/categories:
   *   post:
   *     summary: Crea una nuova categoria
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
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
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome della categoria
   *               description:
   *                 type: string
   *                 description: Descrizione della categoria
   *               isActive:
   *                 type: boolean
   *                 description: Indica se la categoria è attiva
   *                 default: true
   *     responses:
   *       201:
   *         description: Categoria creata con successo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */
  router.post("/", controller.createCategory.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/categories/{id}:
   *   get:
   *     summary: Ottiene una categoria specifica
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
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
   *         description: ID della categoria
   *     responses:
   *       200:
   *         description: Dettagli della categoria
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       404:
   *         description: Categoria non trovata
   */
  router.get("/:id", controller.getCategoryById.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/categories/{id}:
   *   put:
   *     summary: Aggiorna una categoria esistente
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
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
   *         description: ID della categoria
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Nome della categoria
   *               description:
   *                 type: string
   *                 description: Descrizione della categoria
   *               isActive:
   *                 type: boolean
   *                 description: Indica se la categoria è attiva
   *     responses:
   *       200:
   *         description: Categoria aggiornata con successo
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       404:
   *         description: Categoria non trovata
   */
  router.put("/:id", controller.updateCategory.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/categories/{id}:
   *   delete:
   *     summary: Elimina una categoria
   *     tags: [Categories]
   *     security:
   *       - bearerAuth: []
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
   *         description: ID della categoria
   *     responses:
   *       204:
   *         description: Categoria eliminata con successo
   *       404:
   *         description: Categoria non trovata
   *       400:
   *         description: Impossibile eliminare la categoria (potrebbe contenere prodotti)
   */
  router.delete("/:id", controller.deleteCategory.bind(controller));

  return router;
}; 