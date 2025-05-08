import { Router } from "express"
import { faqController } from "../controllers/faq.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { wrapController } from "../utils/controller-wrapper"

const router = Router({ mergeParams: true })

// Apply auth middleware to all routes
router.use(wrapController(authMiddleware))

// Routes for FAQ
router.get("/", wrapController(faqController.getAllFAQs))
router.get("/:id", wrapController(faqController.getFAQById))
router.post("/", wrapController(faqController.createFAQ))
router.put("/:id", wrapController(faqController.updateFAQ))
router.delete("/:id", wrapController(faqController.deleteFAQ))

export default router
