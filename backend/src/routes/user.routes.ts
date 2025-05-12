// @ts-nocheck
import { Router } from "express"
import { UserController } from "../interfaces/http/controllers/user.controller"
import { authMiddleware } from "../interfaces/http/middlewares/auth.middleware"

export const createUserRouter = (userController: UserController): Router => {
  const router = Router()

  // Tutte le rotte utente richiedono autenticazione
  router.use(authMiddleware)

  // Rotta per ottenere il profilo utente
  router.get("/me", (req, res, next) => userController.getCurrentUser(req, res, next))

  // Rotta per ottenere un utente specifico
  router.get("/:id", (req, res, next) => userController.getUserById(req, res, next))

  // Rotta per ottenere tutti gli utenti
  router.get("/", (req, res, next) => userController.getAllUsers(req, res, next))

  // Rotta per creare un nuovo utente
  router.post("/", (req, res, next) => userController.createUser(req, res, next))

  // Rotta per aggiornare un utente
  router.put("/:id", (req, res, next) => userController.updateUser(req, res, next))

  // Rotta per eliminare un utente
  router.delete("/:id", (req, res, next) => userController.deleteUser(req, res, next))

  return router
}

export default createUserRouter; 