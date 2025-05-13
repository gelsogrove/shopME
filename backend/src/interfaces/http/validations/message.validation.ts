import Joi from "joi"

export const createMessageSchema = Joi.object({
  content: Joi.string().required().max(4096), // WhatsApp message size limit
  direction: Joi.string().valid('INBOUND', 'OUTBOUND').required(),
  chatSessionId: Joi.string().required(),
  type: Joi.string().valid('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CONTACT').default('TEXT'),
  metadata: Joi.object().allow(null)
})

export const createChatSessionSchema = Joi.object({
  customerId: Joi.string().required(),
  workspaceId: Joi.string().required(),
  metadata: Joi.object().allow(null)
})

export const messageQuerySchema = Joi.object({
  chatSessionId: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  startDate: Joi.date(),
  endDate: Joi.date()
})

export const chatSessionQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  customerId: Joi.string(),
  active: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'lastActivity').default('lastActivity'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
})

// Validazione per webhook di messaggi WhatsApp
export const whatsappWebhookSchema = Joi.object({
  object: Joi.string().valid('whatsapp_business_account').required(),
  entry: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      changes: Joi.array().items(
        Joi.object({
          value: Joi.object({
            messaging_product: Joi.string().valid('whatsapp').required(),
            metadata: Joi.object({
              display_phone_number: Joi.string().required(),
              phone_number_id: Joi.string().required()
            }).required(),
            contacts: Joi.array().items(
              Joi.object({
                profile: Joi.object({
                  name: Joi.string()
                }),
                wa_id: Joi.string().required()
              })
            ),
            messages: Joi.array().items(
              Joi.object({
                from: Joi.string().required(),
                id: Joi.string().required(),
                timestamp: Joi.string().required(),
                text: Joi.object({
                  body: Joi.string().required()
                }),
                type: Joi.string().required()
              })
            )
          }).required(),
          field: Joi.string().required()
        })
      ).required()
    })
  ).required()
}) 