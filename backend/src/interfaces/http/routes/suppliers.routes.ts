import { Router } from "express";
import { SuppliersController } from "../controllers/suppliers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the supplier
 *         name:
 *           type: string
 *           description: Name of the supplier
 *         slug:
 *           type: string
 *           description: URL-friendly version of the supplier name
 *         description:
 *           type: string
 *           description: Description of the supplier
 *         address:
 *           type: string
 *           description: Address of the supplier
 *         website:
 *           type: string
 *           description: Website URL of the supplier
 *         phone:
 *           type: string
 *           description: Phone number of the supplier
 *         email:
 *           type: string
 *           description: Email address of the supplier
 *         contactPerson:
 *           type: string
 *           description: Name of the contact person at the supplier
 *         notes:
 *           type: string
 *           description: Additional notes about the supplier
 *         isActive:
 *           type: boolean
 *           description: Indicates if the supplier is active
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace this supplier belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date of the supplier
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date of the supplier
 */

export const suppliersRouter = (controller: SuppliersController): Router => {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers:
   *   get:
   *     summary: Get all suppliers for a workspace
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: List of suppliers
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Supplier'
   */
  router.get("/workspaces/:workspaceId/suppliers", controller.getSuppliersForWorkspace.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers/active:
   *   get:
   *     summary: Get all active suppliers for a workspace
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: List of active suppliers
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Supplier'
   */
  router.get("/workspaces/:workspaceId/suppliers/active", controller.getActiveSuppliersForWorkspace.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers:
   *   post:
   *     summary: Create a new supplier
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
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
   *                 description: Name of the supplier
   *               description:
   *                 type: string
   *                 description: Description of the supplier
   *               address:
   *                 type: string
   *                 description: Address of the supplier
   *               website:
   *                 type: string
   *                 description: Website URL of the supplier
   *               phone:
   *                 type: string
   *                 description: Phone number of the supplier
   *               email:
   *                 type: string
   *                 description: Email address of the supplier
   *               contactPerson:
   *                 type: string
   *                 description: Name of the contact person at the supplier
   *               notes:
   *                 type: string
   *                 description: Additional notes about the supplier
   *               isActive:
   *                 type: boolean
   *                 description: Indicates if the supplier is active
   *                 default: true
   *     responses:
   *       201:
   *         description: Supplier created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Supplier'
   */
  router.post("/workspaces/:workspaceId/suppliers", controller.createSupplier.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers/{id}:
   *   get:
   *     summary: Get a specific supplier
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the supplier
   *     responses:
   *       200:
   *         description: Supplier details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Supplier'
   *       404:
   *         description: Supplier not found
   */
  router.get("/workspaces/:workspaceId/suppliers/:id", controller.getSupplierById.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers/{id}:
   *   put:
   *     summary: Update an existing supplier
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the supplier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the supplier
   *               description:
   *                 type: string
   *                 description: Description of the supplier
   *               address:
   *                 type: string
   *                 description: Address of the supplier
   *               website:
   *                 type: string
   *                 description: Website URL of the supplier
   *               phone:
   *                 type: string
   *                 description: Phone number of the supplier
   *               email:
   *                 type: string
   *                 description: Email address of the supplier
   *               contactPerson:
   *                 type: string
   *                 description: Name of the contact person at the supplier
   *               notes:
   *                 type: string
   *                 description: Additional notes about the supplier
   *               isActive:
   *                 type: boolean
   *                 description: Indicates if the supplier is active
   *     responses:
   *       200:
   *         description: Supplier updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Supplier'
   *       404:
   *         description: Supplier not found
   */
  router.put("/workspaces/:workspaceId/suppliers/:id", controller.updateSupplier.bind(controller));
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/suppliers/{id}:
   *   delete:
   *     summary: Delete a supplier
   *     tags: [Suppliers]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the supplier
   *     responses:
   *       204:
   *         description: Supplier deleted successfully
   *       404:
   *         description: Supplier not found
   *       409:
   *         description: Cannot delete supplier that is used by products
   */
  router.delete("/workspaces/:workspaceId/suppliers/:id", controller.deleteSupplier.bind(controller));

  return router;
}; 