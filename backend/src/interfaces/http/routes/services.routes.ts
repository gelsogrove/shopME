import { Router } from "express"
import { ServicesController } from "../controllers/services.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { workspaceContextMiddleware } from "../middlewares/workspace-context.middleware"

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - price
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: ID of the service
 *         name:
 *           type: string
 *           description: Name of the service
 *         description:
 *           type: string
 *           description: Description of the service
 *         price:
 *           type: number
 *           description: Price of the service
 *         currency:
 *           type: string
 *           description: Currency for the price
 *         duration:
 *           type: integer
 *           description: Duration of the service in minutes
 *         isActive:
 *           type: boolean
 *           description: Whether the service is active
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace this service belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 */

export const servicesRouter = (controller: ServicesController): Router => {
  const router = Router({ mergeParams: true })

  // All routes require authentication
  router.use(authMiddleware)
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/services:
   *   get:
   *     summary: Get all services for a workspace
   *     tags: [Services]
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
   *         description: List of services
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Service'
   */
  router.get("/", workspaceContextMiddleware, controller.getServicesForWorkspace.bind(controller))
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/services:
   *   post:
   *     summary: Create a new service
   *     tags: [Services]
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
   *               - price
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the service
   *               description:
   *                 type: string
   *                 description: Description of the service
   *               price:
   *                 type: number
   *                 description: Price of the service
   *               currency:
   *                 type: string
   *                 description: Currency for the price
   *                 default: EUR
   *               duration:
   *                 type: integer
   *                 description: Duration of the service in minutes
   *                 default: 60
   *               isActive:
   *                 type: boolean
   *                 description: Whether the service is active
   *     responses:
   *       201:
   *         description: Service created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Service'
   */
  router.post("/", workspaceContextMiddleware, controller.createService.bind(controller))

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/services/{id}:
   *   get:
   *     summary: Get a specific service
   *     tags: [Services]
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
   *         description: ID of the service
   *     responses:
   *       200:
   *         description: Service details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Service'
   *       404:
   *         description: Service not found
   */
  router.get("/:id", workspaceContextMiddleware, controller.getServiceById.bind(controller))
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/services/{id}:
   *   put:
   *     summary: Update an existing service
   *     tags: [Services]
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
   *         description: ID of the service
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the service
   *               description:
   *                 type: string
   *                 description: Description of the service
   *               price:
   *                 type: number
   *                 description: Price of the service
   *               currency:
   *                 type: string
   *                 description: Currency for the price
   *               duration:
   *                 type: integer
   *                 description: Duration of the service in minutes
   *               isActive:
   *                 type: boolean
   *                 description: Whether the service is active
   *     responses:
   *       200:
   *         description: Service updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Service'
   *       404:
   *         description: Service not found
   */
  router.put("/:id", workspaceContextMiddleware, controller.updateService.bind(controller))
  
  /**
   * @swagger
   * /api/workspaces/{workspaceId}/services/{id}:
   *   delete:
   *     summary: Delete a service
   *     tags: [Services]
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
   *         description: ID of the service
   *     responses:
   *       204:
   *         description: Service deleted successfully
   *       404:
   *         description: Service not found
   */
  router.delete("/:id", workspaceContextMiddleware, controller.deleteService.bind(controller))

  return router
} 