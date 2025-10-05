import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { BillingService } from "../../../application/services/billing.service"
import { FaqService } from "../../../application/services/faq.service"
import { embeddingService } from "../../../services/embeddingService"
import logger from "../../../utils/logger"

const prisma = new PrismaClient()

/**
 * FaqController class
 * Handles HTTP requests related to FAQs
 */
export class FaqController {
  private faqService: FaqService
  private billingService: BillingService

  constructor() {
    this.faqService = new FaqService()
    this.billingService = new BillingService(prisma)
  }

  /**
   * Get all FAQs for a workspace
   * @swagger
   * /api/workspaces/{workspaceId}/faqs:
   *   get:
   *     summary: Get all FAQs for a workspace
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: List of FAQs
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/FAQ'
   *       400:
   *         description: Workspace ID is required
   *       500:
   *         description: Failed to get FAQs
   */
  async getAllFaqs(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      const faqs = await this.faqService.getAllForWorkspace(workspaceId)
      return res.json(faqs)
    } catch (error) {
      logger.error("Error getting FAQs:", error)
      return res.status(500).json({ error: "Failed to get FAQs" })
    }
  }

  /**
   * Get FAQ by ID
   * @swagger
   * /api/workspaces/{workspaceId}/faqs/{id}:
   *   get:
   *     summary: Get FAQ by ID
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: FAQ ID
   *     responses:
   *       200:
   *         description: FAQ details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FAQ'
   *       404:
   *         description: FAQ not found
   *       500:
   *         description: Failed to get FAQ
   */
  async getFaqById(req: Request, res: Response): Promise<Response> {
    try {
      const { id, workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      const faq = await this.faqService.getById(id, workspaceId)

      if (!faq) {
        return res.status(404).json({ error: "FAQ not found" })
      }

      return res.json(faq)
    } catch (error) {
      logger.error(`Error getting FAQ ${req.params.id}:`, error)
      return res.status(500).json({ error: "Failed to get FAQ" })
    }
  }

  /**
   * Create a new FAQ
   * @swagger
   * /api/workspaces/{workspaceId}/faqs:
   *   post:
   *     summary: Create a new FAQ
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateFAQRequest'
   *     responses:
   *       201:
   *         description: FAQ created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FAQ'
   *       400:
   *         description: Invalid FAQ data or missing required fields
   *       500:
   *         description: Failed to create FAQ
   */
  async createFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      const { question, answer, isActive } = req.body
      const faqData = {
        question,
        answer,
        isActive: isActive !== undefined ? isActive : true,
        workspaceId,
      }

      const faq = await this.faqService.create(faqData)

      // 💰 BILLING: Track NEW_FAQ (€0.50)
      try {
        await this.billingService.trackNewFAQ(
          workspaceId,
          null, // FAQ created by admin, no specific customer
          `FAQ created: ${question.substring(0, 50)}...`
        )
        logger.info(
          `[BILLING] 💰 New FAQ created: €0.50 charged (workspace: ${workspaceId})`
        )
      } catch (billingError) {
        logger.error(
          `[BILLING] ❌ Failed to track new FAQ billing:`,
          billingError
        )
        // Don't fail FAQ creation if billing fails
      }

      // Fire-and-forget: trigger embedding regeneration for FAQs
      embeddingService
        .generateFAQEmbeddings(workspaceId)
        .catch((err) =>
          logger.error("Embedding generation error (create):", err)
        )
      return res.status(201).json(faq)
    } catch (error: any) {
      logger.error("Error creating FAQ:", error)

      if (
        error.message === "Missing required fields" ||
        error.message === "Invalid FAQ data"
      ) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(500).json({ error: "Failed to create FAQ" })
    }
  }

  /**
   * Update a FAQ
   * @swagger
   * /api/workspaces/{workspaceId}/faqs/{id}:
   *   put:
   *     summary: Update a FAQ
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: FAQ ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateFAQRequest'
   *     responses:
   *       200:
   *         description: FAQ updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FAQ'
   *       400:
   *         description: Invalid FAQ data
   *       404:
   *         description: FAQ not found
   *       500:
   *         description: Failed to update FAQ
   */
  async updateFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { id, workspaceId } = req.params
      const { question, answer, isActive } = req.body

      if (!workspaceId) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      const faq = await this.faqService.update(id, workspaceId, {
        question,
        answer,
        isActive,
      })

      // Fire-and-forget: trigger embedding regeneration for FAQs
      logger.info(
        `🔄 FAQ updated, triggering embedding regeneration for workspace: ${workspaceId}, FAQ ID: ${id}`
      )
      embeddingService
        .generateFAQEmbeddings(workspaceId)
        .then((result) => {
          logger.info(
            `✅ FAQ embedding regeneration completed for workspace ${workspaceId}: processed ${result.processed} FAQs, errors: ${result.errors.length}`
          )
          if (result.errors.length > 0) {
            logger.warn(
              `⚠️ FAQ embedding regeneration warnings:`,
              result.errors
            )
          }
        })
        .catch((err) => {
          logger.error(
            `❌ FAQ embedding regeneration failed for workspace ${workspaceId}:`,
            err
          )
        })
      return res.json(faq)
    } catch (error: any) {
      logger.error(`Error updating FAQ ${req.params.id}:`, error)

      if (error.message === "FAQ not found") {
        return res.status(404).json({ error: "FAQ not found" })
      }

      if (error.message === "Invalid FAQ data") {
        return res.status(400).json({ error: error.message })
      }

      return res.status(500).json({ error: "Failed to update FAQ" })
    }
  }

  /**
   * Delete a FAQ
   * @swagger
   * /api/workspaces/{workspaceId}/faqs/{id}:
   *   delete:
   *     summary: Delete a FAQ
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: FAQ ID
   *     responses:
   *       204:
   *         description: FAQ deleted
   *       404:
   *         description: FAQ not found
   *       500:
   *         description: Failed to delete FAQ
   */
  async deleteFaq(req: Request, res: Response): Promise<Response> {
    try {
      const { id, workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({ error: "Workspace ID is required" })
      }

      try {
        await this.faqService.delete(id, workspaceId)
        // Fire-and-forget: trigger embedding regeneration for FAQs
        embeddingService
          .generateFAQEmbeddings(workspaceId)
          .catch((err) =>
            logger.error("Embedding generation error (delete):", err)
          )
        return res.status(204).send()
      } catch (error: any) {
        if (error.message === "FAQ not found") {
          return res.status(404).json({ error: "FAQ not found" })
        }

        throw error
      }
    } catch (error) {
      logger.error(`Error deleting FAQ ${req.params.id}:`, error)
      return res.status(500).json({ error: "Failed to delete FAQ" })
    }
  }

  /**
   * Generate embeddings for all active FAQs in a workspace
   * @swagger
   * /api/workspaces/{workspaceId}/faqs/generate-embeddings:
   *   post:
   *     summary: Generate embeddings for all active FAQs in a workspace
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the workspace
   *     responses:
   *       200:
   *         description: FAQ embedding generation completed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     workspaceId:
   *                       type: string
   *                     processed:
   *                       type: number
   *                     errors:
   *                       type: array
   *                       items:
   *                         type: string
   *                     hasErrors:
   *                       type: boolean
   *       400:
   *         description: Workspace ID is required
   *       500:
   *         description: Failed to generate FAQ embeddings
   */
  async generateEmbeddings(req: Request, res: Response): Promise<Response> {
    try {
      const { workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required",
        })
      }

      logger.info(
        `Starting FAQ embedding generation for workspace: ${workspaceId}`
      )

      const result = await embeddingService.generateFAQEmbeddings(workspaceId)

      return res.status(200).json({
        success: true,
        message: "FAQ embedding generation completed",
        data: {
          workspaceId: workspaceId,
          processed: result.processed,
          errors: result.errors,
          hasErrors: result.errors.length > 0,
        },
      })
    } catch (error) {
      logger.error("Error generating FAQ embeddings:", error)
      return res.status(500).json({
        success: false,
        message: "Failed to generate FAQ embeddings",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  /**
   * Test FAQ Embedding Regeneration
   * @swagger
   * /api/workspaces/{workspaceId}/faqs/test-embedding-regeneration:
   *   post:
   *     summary: Test FAQ embedding regeneration (for debugging)
   *     tags: [FAQs]
   *     parameters:
   *       - in: path
   *         name: workspaceId
   *         schema:
   *           type: string
   *         required: true
   *         description: Workspace ID
   *     responses:
   *       200:
   *         description: Embedding regeneration test completed
   *       500:
   *         description: Failed to test embedding regeneration
   */
  async testEmbeddingRegeneration(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { workspaceId } = req.params

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required",
        })
      }

      logger.info(
        `🧪 Testing FAQ embedding regeneration for workspace: ${workspaceId}`
      )

      const result = await embeddingService.generateFAQEmbeddings(workspaceId)

      return res.status(200).json({
        success: true,
        message: "FAQ embedding regeneration test completed",
        data: {
          workspaceId: workspaceId,
          processed: result.processed,
          errors: result.errors,
          hasErrors: result.errors.length > 0,
        },
      })
    } catch (error) {
      logger.error("Error testing FAQ embedding regeneration:", error)
      return res.status(500).json({
        success: false,
        message: "Failed to test FAQ embedding regeneration",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }
}
