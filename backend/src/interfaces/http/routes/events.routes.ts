import { Router } from "express"
import { EventsController } from "../controllers/events.controller"
import { authMiddleware } from "../middlewares/auth.middleware"

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - workspaceId
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique ID of the event
 *         name:
 *           type: string
 *           description: Name of the event
 *         description:
 *           type: string
 *           description: Description of the event
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date and time of the event
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date and time of the event
 *         location:
 *           type: string
 *           description: Location of the event
 *         price:
 *           type: number
 *           description: Price of the event
 *         currency:
 *           type: string
 *           description: Currency for the price
 *         isActive:
 *           type: boolean
 *           description: Whether the event is active
 *         maxAttendees:
 *           type: integer
 *           description: Maximum number of attendees
 *         currentAttendees:
 *           type: integer
 *           description: Current number of attendees
 *         workspaceId:
 *           type: string
 *           description: ID of the workspace the event belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the event was last updated
 */

export const eventsRouter = (controller: EventsController): Router => {
  const router = Router()

  // All routes require authentication
  router.use(authMiddleware)

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/events:
   *   get:
   *     summary: Get all events for a workspace
   *     tags: [Events]
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
   *         description: List of events
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Event'
   *       500:
   *         description: Server error
   */
  router.get("/", controller.getEventsForWorkspace.bind(controller))

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/events:
   *   post:
   *     summary: Create a new event
   *     tags: [Events]
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
   *               - startDate
   *               - endDate
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the event
   *               description:
   *                 type: string
   *                 description: Description of the event
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Start date and time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: End date and time
   *               location:
   *                 type: string
   *                 description: Location of the event
   *               price:
   *                 type: number
   *                 description: Price of the event
   *               currency:
   *                 type: string
   *                 description: Currency for the price
   *               isActive:
   *                 type: boolean
   *                 description: Whether the event is active
   *               maxAttendees:
   *                 type: integer
   *                 description: Maximum number of attendees
   *     responses:
   *       201:
   *         description: Event created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       500:
   *         description: Server error
   */
  router.post("/", controller.createEvent.bind(controller))

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/events/{id}:
   *   get:
   *     summary: Get an event by ID
   *     tags: [Events]
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
   *         description: ID of the event
   *     responses:
   *       200:
   *         description: Event details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.get("/:id", controller.getEventById.bind(controller))

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/events/{id}:
   *   put:
   *     summary: Update an event
   *     tags: [Events]
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
   *         description: ID of the event
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 description: Name of the event
   *               description:
   *                 type: string
   *                 description: Description of the event
   *               startDate:
   *                 type: string
   *                 format: date-time
   *                 description: Start date and time
   *               endDate:
   *                 type: string
   *                 format: date-time
   *                 description: End date and time
   *               location:
   *                 type: string
   *                 description: Location of the event
   *               price:
   *                 type: number
   *                 description: Price of the event
   *               currency:
   *                 type: string
   *                 description: Currency for the price
   *               isActive:
   *                 type: boolean
   *                 description: Whether the event is active
   *               maxAttendees:
   *                 type: integer
   *                 description: Maximum number of attendees
   *               currentAttendees:
   *                 type: integer
   *                 description: Current number of attendees
   *     responses:
   *       200:
   *         description: Event updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.put("/:id", controller.updateEvent.bind(controller))

  /**
   * @swagger
   * /api/workspaces/{workspaceId}/events/{id}:
   *   delete:
   *     summary: Delete an event
   *     tags: [Events]
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
   *         description: ID of the event
   *     responses:
   *       204:
   *         description: Event deleted successfully
   *       404:
   *         description: Event not found
   *       500:
   *         description: Server error
   */
  router.delete("/:id", controller.deleteEvent.bind(controller))

  return router
} 