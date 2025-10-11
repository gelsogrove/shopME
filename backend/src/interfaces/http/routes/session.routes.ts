import { Router } from "express"
import { sessionController } from "../controllers/session.controller"

const router = Router()

/**
 * Session Routes
 * Gestione validazione sessioni admin
 */

// Valida sessione corrente (usato da ProtectedRoute frontend)
// IMPORTANTE: Questo endpoint NON usa sessionValidationMiddleware
// (altrimenti loop infinito: validate richiede sessionId valido per validare sessionId)
router.get("/validate", sessionController.validate.bind(sessionController))

// Statistiche sessioni attive (richiede auth)
router.get("/stats", sessionController.getStats.bind(sessionController))

export { router as sessionRoutes }
