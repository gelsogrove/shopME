import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import logger from "../utils/logger"

const prisma = new PrismaClient()

/**
 * Controller che gestisce le operazioni CRUD per le FAQ
 */
export class FAQController {
  constructor() {
    // Bind all methods to ensure 'this' context is preserved
    this.getAllFAQs = this.getAllFAQs.bind(this)
    this.getFAQById = this.getFAQById.bind(this)
    this.createFAQ = this.createFAQ.bind(this)
    this.updateFAQ = this.updateFAQ.bind(this)
    this.deleteFAQ = this.deleteFAQ.bind(this)
  }

  /**
   * Ottiene tutte le FAQ per un workspace specifico
   */
  async getAllFAQs(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params

      const faqs = await prisma.fAQ.findMany({
        where: {
          workspaceId,
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      res.status(200).json(faqs)
    } catch (error) {
      logger.error("Error getting FAQs:", error)
      res.status(500).json({ error: "Failed to get FAQs" })
    }
  }

  /**
   * Ottiene una FAQ specifica per ID
   */
  async getFAQById(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, id } = req.params

      const faq = await prisma.fAQ.findFirst({
        where: {
          id,
          workspaceId,
        },
      })

      if (!faq) {
        res.status(404).json({ error: "FAQ not found" })
        return
      }

      res.status(200).json(faq)
    } catch (error) {
      logger.error(`Error getting FAQ with ID ${req.params.id}:`, error)
      res.status(500).json({ error: "Failed to get FAQ" })
    }
  }

  /**
   * Crea una nuova FAQ
   */
  async createFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId } = req.params
      const { question, answer, isActive = true } = req.body

      if (!question || !answer) {
        res.status(400).json({ error: "Question and answer are required" })
        return
      }

      const faq = await prisma.fAQ.create({
        data: {
          question,
          answer,
          isActive,
          workspace: {
            connect: { id: workspaceId },
          },
        },
      })

      res.status(201).json(faq)
    } catch (error) {
      logger.error("Error creating FAQ:", error)
      res.status(500).json({ error: "Failed to create FAQ" })
    }
  }

  /**
   * Aggiorna una FAQ esistente
   */
  async updateFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, id } = req.params
      const { question, answer, isActive } = req.body

      // Verifica se la FAQ esiste
      const existingFAQ = await prisma.fAQ.findFirst({
        where: {
          id,
          workspaceId,
        },
      })

      if (!existingFAQ) {
        res.status(404).json({ error: "FAQ not found" })
        return
      }

      // Prepara i dati da aggiornare
      const updateData: any = {}
      if (question !== undefined) updateData.question = question
      if (answer !== undefined) updateData.answer = answer
      if (isActive !== undefined) updateData.isActive = isActive

      // Aggiorna la FAQ
      const updatedFAQ = await prisma.fAQ.update({
        where: { id },
        data: updateData,
      })

      res.status(200).json(updatedFAQ)
    } catch (error) {
      logger.error(`Error updating FAQ with ID ${req.params.id}:`, error)
      res.status(500).json({ error: "Failed to update FAQ" })
    }
  }

  /**
   * Elimina una FAQ
   */
  async deleteFAQ(req: Request, res: Response): Promise<void> {
    try {
      const { workspaceId, id } = req.params

      // Verifica se la FAQ esiste
      const existingFAQ = await prisma.fAQ.findFirst({
        where: {
          id,
          workspaceId,
        },
      })

      if (!existingFAQ) {
        res.status(404).json({ error: "FAQ not found" })
        return
      }

      // Elimina la FAQ
      await prisma.fAQ.delete({
        where: { id },
      })

      res.status(200).json({ message: "FAQ deleted successfully" })
    } catch (error) {
      logger.error(`Error deleting FAQ with ID ${req.params.id}:`, error)
      res.status(500).json({ error: "Failed to delete FAQ" })
    }
  }
}

export const faqController = new FAQController()
