import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import {
  EmailService,
  OperatorNotificationEmailData,
} from "../../../application/services/email.service"

const prisma = new PrismaClient()
const emailService = new EmailService()

export class OperatorController {
  /**
   * Handle operator contact request: send email to operator notificationEmail
   */
  async contactOperator(req: Request, res: Response): Promise<void> {
    const { workspaceId } = req.params
    const { clientId, message } = req.body

    // Validate input
    if (!clientId || !message) {
      res.status(400).json({ error: "clientId and message are required" })
      return
    }

    // Fetch workspace to get notificationEmail and name
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { notificationEmail: true, name: true },
    })

    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" })
      return
    }

    const to = workspace.notificationEmail
    if (!to) {
      res
        .status(400)
        .json({
          error: "Operator notification email not configured for workspace",
        })
      return
    }

    // Fetch customer name
    const customer = await prisma.customers.findUnique({
      where: { id: clientId },
      select: { name: true },
    })

    if (!customer) {
      res.status(404).json({ error: "Customer not found" })
      return
    }

    // Prepare email data
    const emailData: OperatorNotificationEmailData = {
      to,
      customerName: customer.name,
      chatSummary: message,
      workspaceName: workspace.name,
    }

    const sent = await emailService.sendOperatorNotificationEmail(emailData)
    if (!sent) {
      res
        .status(500)
        .json({ error: "Failed to send operator notification email" })
      return
    }

    res
      .status(200)
      .json({ success: true, message: "Operator notified successfully" })
  }
}
