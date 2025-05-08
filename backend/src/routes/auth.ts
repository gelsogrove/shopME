import { Request, Response, Router } from "express"
import { login } from "../controllers/auth.controller"
import { wrapController } from "../utils/controller-wrapper"

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email dell'utente
 *         password:
 *           type: string
 *           format: password
 *           description: Password dell'utente
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token per l'autenticazione
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: ID dell'utente
 *             email:
 *               type: string
 *               description: Email dell'utente
 *             firstName:
 *               type: string
 *               description: Nome dell'utente
 *             lastName:
 *               type: string
 *               description: Cognome dell'utente
 */

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Verifica lo stato del servizio di autenticazione
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Servizio attivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Effettua il login di un utente
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenziali non valide
 *       400:
 *         description: Dati mancanti o non validi
 */
// Login endpoint
router.post("/login", wrapController(login))

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ottiene i dati dell'utente autenticato
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dati dell'utente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID dell'utente
 *                     email:
 *                       type: string
 *                       description: Email dell'utente
 *                     firstName:
 *                       type: string
 *                       description: Nome dell'utente
 *                     lastName:
 *                       type: string
 *                       description: Cognome dell'utente
 *                     role:
 *                       type: string
 *                       description: Ruolo dell'utente
 *       401:
 *         description: Utente non autenticato
 *       404:
 *         description: Utente non trovato
 */
// Get current user endpoint
router.get("/me", wrapController(async (req: Request, res: Response) => {
  // The user is already attached to the request by the authMiddleware
  const user = req.user as any; // Type assertion to avoid TypeScript errors
  
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  })
}))

export default router 