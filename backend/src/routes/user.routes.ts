import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { UserService } from "../application/services/user.service"
import { UserController } from "../interfaces/http/controllers/user.controller"
import { authMiddleware } from "../interfaces/http/middlewares/auth.middleware"

const router = Router()
const prisma = new PrismaClient()
const userService = new UserService(prisma)
const userController = new UserController(userService)

// Tutte le rotte utente richiedono autenticazione
router.use(authMiddleware)

// Rotta per ottenere il profilo utente
router.get("/me", (req, res) => userController.getProfile(req, res))

// Rotta per aggiornare il profilo utente
router.put("/profile", (req, res) => userController.updateProfile(req, res))

// Rotta per cambiare la password
router.post("/change-password", (req, res) => userController.changePassword(req, res))

export default router 