import { Router } from "express"
import { agentsController } from "../controllers/agents.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { wrapController } from "../utils/controller-wrapper"

/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - workspaceId
 *       properties:
 *         id:
 *           type: string
 *           description: ID univoco dell'agente
 *         name:
 *           type: string
 *           description: Nome dell'agente
 *         description:
 *           type: string
 *           description: Descrizione dell'agente
 *         isActive:
 *           type: boolean
 *           description: Indica se l'agente è attivo
 *         isRouter:
 *           type: boolean
 *           description: Indica se l'agente è un router
 *         department:
 *           type: string
 *           description: Dipartimento dell'agente
 *         promptId:
 *           type: string
 *           description: ID del prompt associato all'agente
 *         workspaceId:
 *           type: string
 *           description: ID del workspace a cui appartiene l'agente
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data di creazione dell'agente
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data dell'ultimo aggiornamento dell'agente
 */

const router = Router()

// Apply auth middleware to all routes
router.use(wrapController(authMiddleware))

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Ottiene tutti gli agenti di un workspace
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-workspace-id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *     responses:
 *       200:
 *         description: Lista degli agenti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agent'
 */
// Get all agents for a workspace
router.get("/", wrapController(agentsController.getAllForWorkspace))

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Ottiene un agente specifico
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID dell'agente
 *       - in: header
 *         name: x-workspace-id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *     responses:
 *       200:
 *         description: Dettagli dell'agente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agente non trovato
 */
// Get a specific agent
router.get("/:id", wrapController(agentsController.getById))

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Crea un nuovo agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-workspace-id
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
 *                 description: Nome dell'agente
 *               description:
 *                 type: string
 *                 description: Descrizione dell'agente
 *               isActive:
 *                 type: boolean
 *                 description: Indica se l'agente è attivo
 *                 default: true
 *               isRouter:
 *                 type: boolean
 *                 description: Indica se l'agente è un router
 *                 default: false
 *               department:
 *                 type: string
 *                 description: Dipartimento dell'agente
 *               promptId:
 *                 type: string
 *                 description: ID del prompt associato all'agente
 *     responses:
 *       201:
 *         description: Agente creato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 */
// Create a new agent
router.post("/", wrapController(agentsController.create))

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Aggiorna un agente esistente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID dell'agente
 *       - in: header
 *         name: x-workspace-id
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome dell'agente
 *               description:
 *                 type: string
 *                 description: Descrizione dell'agente
 *               isActive:
 *                 type: boolean
 *                 description: Indica se l'agente è attivo
 *               isRouter:
 *                 type: boolean
 *                 description: Indica se l'agente è un router
 *               department:
 *                 type: string
 *                 description: Dipartimento dell'agente
 *               promptId:
 *                 type: string
 *                 description: ID del prompt associato all'agente
 *     responses:
 *       200:
 *         description: Agente aggiornato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agente non trovato
 */
// Update an agent
router.put("/:id", wrapController(agentsController.update))

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Elimina un agente
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID dell'agente
 *       - in: header
 *         name: x-workspace-id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del workspace
 *     responses:
 *       204:
 *         description: Agente eliminato con successo
 *       404:
 *         description: Agente non trovato
 */
// Delete an agent
router.delete("/:id", wrapController(agentsController.delete))

export default router 