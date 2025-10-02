import { NextFunction, Request, Response } from "express"
import { CustomerService } from "../../../application/services/customer.service"
import { pushMessagingService } from "../../../services/push-messaging.service"
import logger from "../../../utils/logger"

export class CustomersController {
  private customerService: CustomerService
  private pushMessagingService = pushMessagingService

  constructor() {
    this.customerService = new CustomerService()
  }

  async getCustomersForWorkspace(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { workspaceId } = req.params

      const customers =
        await this.customerService.getActiveForWorkspace(workspaceId)

      res.json({ data: customers })
    } catch (error) {
      logger.error("Error getting customers:", error)
      next(error)
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params

      const customer = await this.customerService.getById(id, workspaceId)

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" })
      }

      res.json(customer)
    } catch (error) {
      const id = req.params.id
      logger.error(`Error getting customer ${id}:`, error)
      next(error)
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params
      const {
        name,
        email,
        phone,
        address,
        company,
        discount,
        language,
        notes,
        serviceIds,
        isActive,
        last_privacy_version_accepted,
        push_notifications_consent,
        gdprConsent,
        pushNotificationsConsent,
        activeChatbot,
        isBlacklisted,
        invoiceAddress,
      } = req.body

      const customerData = {
        name,
        email,
        phone,
        address,
        company,
        discount,
        language,
        notes,
        serviceIds,
        workspaceId,
        isActive: isActive !== undefined ? isActive : true,
        activeChatbot: activeChatbot !== undefined ? activeChatbot : true,
        isBlacklisted: isBlacklisted !== undefined ? isBlacklisted : false,
        last_privacy_version_accepted: gdprConsent
          ? "v1.0"
          : last_privacy_version_accepted,
        push_notifications_consent:
          pushNotificationsConsent !== undefined
            ? pushNotificationsConsent
            : push_notifications_consent || false,
        push_notifications_consent_at:
          pushNotificationsConsent || push_notifications_consent
            ? new Date()
            : undefined,
        privacy_accepted_at: gdprConsent
          ? new Date()
          : last_privacy_version_accepted
            ? new Date()
            : undefined,
        invoiceAddress,
      }

      const customer = await this.customerService.create(customerData)

      res.status(201).json(customer)
    } catch (error: any) {
      logger.error("Error creating customer:", error)
      if (
        error.message === "A customer with this email already exists" ||
        error.message === "A customer with this phone number already exists" ||
        error.message === "Invalid customer data"
      ) {
        return res.status(400).json({ message: error.message })
      }
      next(error)
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params
      const {
        name,
        email,
        phone,
        address,
        isActive,
        company,
        discount,
        language,
        notes,
        serviceIds,
        last_privacy_version_accepted,
        push_notifications_consent,
        gdprConsent,
        pushNotificationsConsent,
        activeChatbot,
        invoiceAddress,
        isBlacklisted,
      } = req.body

      // Get original customer data to compare changes
      const originalCustomer = await this.customerService.getById(
        id,
        workspaceId
      )
      if (!originalCustomer) {
        return res.status(404).json({ message: "Customer not found" })
      }

      // Validate required fields if attempting to update them
      if (name !== undefined && (!name || name.trim() === "")) {
        return res.status(400).json({ message: "Name is required" })
      }

      if (email !== undefined && (!email || email.trim() === "")) {
        return res.status(400).json({ message: "Email is required" })
      }

      // If no valid update fields are provided, return 400
      if (Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ message: "No valid update data provided" })
      }

      // Prepare update data with only defined values
      const customerData: any = {}

      if (name !== undefined) customerData.name = name
      if (email !== undefined) customerData.email = email
      if (phone !== undefined) customerData.phone = phone
      if (address !== undefined) customerData.address = address
      if (isActive !== undefined) customerData.isActive = isActive
      if (company !== undefined) customerData.company = company
      if (discount !== undefined) customerData.discount = discount
      if (language !== undefined) customerData.language = language
      if (notes !== undefined) customerData.notes = notes
      if (serviceIds !== undefined) customerData.serviceIds = serviceIds
      if (last_privacy_version_accepted !== undefined) {
        customerData.last_privacy_version_accepted =
          last_privacy_version_accepted
        customerData.privacy_accepted_at = new Date()
      }
      if (gdprConsent !== undefined) {
        customerData.last_privacy_version_accepted = gdprConsent
          ? "v1.0"
          : undefined
        customerData.privacy_accepted_at = gdprConsent ? new Date() : undefined
      }
      if (push_notifications_consent !== undefined) {
        customerData.push_notifications_consent = push_notifications_consent
        if (push_notifications_consent) {
          customerData.push_notifications_consent_at = new Date()
        }
      }
      if (pushNotificationsConsent !== undefined) {
        customerData.push_notifications_consent = pushNotificationsConsent
        if (pushNotificationsConsent) {
          customerData.push_notifications_consent_at = new Date()
        }
      }
      if (activeChatbot !== undefined)
        customerData.activeChatbot = activeChatbot
      if (invoiceAddress !== undefined)
        customerData.invoiceAddress = invoiceAddress
      if (isBlacklisted !== undefined)
        customerData.isBlacklisted = isBlacklisted

      logger.info("Updating customer with data:", {
        id,
        workspaceId,
        ...customerData,
      })

      const updatedCustomer = await this.customerService.update(
        id,
        workspaceId,
        customerData
      )

      // Handle automatic push messages for relevant changes
      await this.handleAutomaticPushMessages(originalCustomer, updatedCustomer)

      res.json({ data: updatedCustomer })
    } catch (error) {
      logger.error("Error updating customer:", error)
      next(error)
    }
  }

  /**
   * Handle automatic push messages when customer data changes
   */
  private async handleAutomaticPushMessages(
    originalCustomer: any,
    updatedCustomer: any
  ) {
    try {
      // Check if discount changed
      if (originalCustomer.discount !== updatedCustomer.discount) {
        logger.info(
          `Customer discount changed from ${originalCustomer.discount}% to ${updatedCustomer.discount}%`,
          {
            customerId: updatedCustomer.id,
            workspaceId: updatedCustomer.workspaceId,
          }
        )

        await this.pushMessagingService.sendDiscountUpdate(
          updatedCustomer.id,
          updatedCustomer.phone,
          updatedCustomer.workspaceId,
          updatedCustomer.discount
        )
      }

      // Check if chatbot status changed
      if (originalCustomer.activeChatbot !== updatedCustomer.activeChatbot) {
        logger.info(
          `Customer chatbot status changed from ${originalCustomer.activeChatbot} to ${updatedCustomer.activeChatbot}`,
          {
            customerId: updatedCustomer.id,
            workspaceId: updatedCustomer.workspaceId,
          }
        )

        // Only send push notification if chatbot was reactivated (false -> true)
        if (!originalCustomer.activeChatbot && updatedCustomer.activeChatbot) {
          const pushResult = await this.pushMessagingService.sendChatbotReactivated(
            updatedCustomer.id,
            updatedCustomer.phone,
            updatedCustomer.workspaceId
          )
          
          logger.info(
            `Push notification ${pushResult ? 'sent successfully' : 'failed'} for customer ${updatedCustomer.id}`
          )
        }
      }
    } catch (error) {
      logger.error("Error handling automatic push messages:", error)
      // Don't throw error - automatic push failures shouldn't break customer update
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params

      logger.info("Starting customer deletion process:", { id, workspaceId })

      try {
        const success = await this.customerService.delete(id, workspaceId)

        if (!success) {
          return res.status(404).json({ message: "Customer not found" })
        }

        logger.info("Customer deletion completed successfully")
        return res.status(204).send()
      } catch (error: any) {
        if (error.message === "Customer not found") {
          return res.status(404).json({ message: "Customer not found" })
        }
        throw error
      }
    } catch (error) {
      logger.error("Error deleting customer:", error)
      // Send a more detailed error response
      res.status(500).json({
        message: "Failed to delete customer",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  /**
   * Block a customer (set isBlacklisted to true)
   */
  async blockCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params

      // Rileva se si tratta dell'endpoint alternativo con 'bloc'
      const isAlternativeEndpoint =
        req.originalUrl.includes("/bloc") && !req.originalUrl.includes("/block")

      logger.info("⛔ Blocking customer API call received:", {
        id,
        workspaceId,
        originalUrl: req.originalUrl,
        method: req.method,
        path: req.path,
        params: req.params,
        route: req.route,
        isAlternativeEndpoint,
      })

      try {
        const customer = await this.customerService.blockCustomer(
          id,
          workspaceId
        )

        logger.info("Customer blocked successfully")
        return res.status(200).json({
          message: "Customer blocked successfully",
          customer,
        })
      } catch (error: any) {
        if (error.message === "Customer not found") {
          return res.status(404).json({ message: "Customer not found" })
        }
        throw error
      }
    } catch (error) {
      logger.error("Error blocking customer:", error)
      next(error)
    }
  }

  /**
   * Unblock a customer (set isBlacklisted to false)
   */
  async unblockCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, workspaceId } = req.params

      logger.info("✅ Unblocking customer API call received:", {
        id,
        workspaceId,
        originalUrl: req.originalUrl,
        method: req.method,
        path: req.path,
        params: req.params,
        route: req.route,
      })

      try {
        const customer = await this.customerService.unblockCustomer(
          id,
          workspaceId
        )

        logger.info("Customer unblocked successfully")
        return res.status(200).json({
          message: "Customer unblocked successfully",
          customer,
        })
      } catch (error: any) {
        if (error.message === "Customer not found") {
          return res.status(404).json({ message: "Customer not found" })
        }
        throw error
      }
    } catch (error) {
      logger.error("Error unblocking customer:", error)
      next(error)
    }
  }

  /**
   * Count all "Unknown Customer" records in a workspace
   */
  async countUnknownCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params

      const count =
        await this.customerService.countUnknownCustomers(workspaceId)

      res.json({ count })
    } catch (error) {
      logger.error("Error counting unknown customers:", error)
      next(error)
    }
  }

  /**
   * TASK 3: Operator Control Release Mechanism
   *
   * Endpoint specifico per gestire il controllo del chatbot.
   * Permette agli operatori di rilasciare/riprendere il controllo AI.
   *
   * PUT /api/workspaces/:workspaceId/customers/:customerId/chatbot-control
   * Body: { activeChatbot: boolean, reason?: string }
   */
  async updateChatbotControl(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, workspaceId } = req.params
      const { activeChatbot, reason } = req.body

      // Validazione input
      if (typeof activeChatbot !== "boolean") {
        return res.status(400).json({
          message: "activeChatbot must be a boolean value",
        })
      }

      logger.info(
        `[TASK3] CHATBOT_CONTROL_CHANGE_REQUEST: customer-${customerId} activeChatbot=${activeChatbot} in workspace-${workspaceId}`,
        {
          customerId,
          workspaceId,
          activeChatbot,
          reason: reason || "No reason provided",
          requestedBy: req.user?.id || req.user?.userId || "unknown", // Compatibility with different token formats
        }
      )

      // Verifica che il customer esista
      const existingCustomer = await this.customerService.getById(
        customerId,
        workspaceId
      )
      if (!existingCustomer) {
        logger.warn(
          `[TASK3] CHATBOT_CONTROL_CHANGE_FAILED: customer-${customerId} not found in workspace-${workspaceId}`
        )
        return res.status(404).json({ message: "Customer not found" })
      }

      // Aggiorna solo il campo activeChatbot
      const updateData = {
        activeChatbot,
        // Aggiungiamo metadata per tracking
        chatbotControlChangedAt: new Date(),
        chatbotControlChangedBy: req.user?.id || req.user?.userId || "unknown",
        chatbotControlChangeReason: reason || null,
      }

      const updatedCustomer = await this.customerService.update(
        customerId,
        workspaceId,
        updateData
      )

      // Logging dettagliato per audit
      logger.info(
        `[TASK3] CHATBOT_CONTROL_CHANGED: customer-${customerId} activeChatbot=${activeChatbot} by user-${req.user?.id || req.user?.userId || "unknown"}`,
        {
          customerId,
          workspaceId,
          previousState: existingCustomer.activeChatbot,
          newState: activeChatbot,
          reason: reason || "No reason provided",
          changedBy: req.user?.id || req.user?.userId || "unknown",
          timestamp: new Date().toISOString(),
        }
      )

      // Risposta con informazioni utili
      res.json({
        success: true,
        customer: {
          id: updatedCustomer.id,
          name: updatedCustomer.name,
          phone: updatedCustomer.phone,
          activeChatbot: updatedCustomer.activeChatbot,
        },
        change: {
          previousState: existingCustomer.activeChatbot,
          newState: activeChatbot,
          reason: reason || null,
          changedAt: new Date().toISOString(),
          changedBy: req.user?.id || req.user?.userId || "unknown",
        },
        message: activeChatbot
          ? "Chatbot control activated - AI will handle messages"
          : "Chatbot control deactivated - Manual operator control active",
      })
    } catch (error: any) {
      logger.error(
        `[TASK3] CHATBOT_CONTROL_CHANGE_ERROR: customer-${req.params.customerId}:`,
        error
      )

      if (error.message === "Customer not found") {
        return res.status(404).json({ message: "Customer not found" })
      }

      next(error)
    }
  }
}
