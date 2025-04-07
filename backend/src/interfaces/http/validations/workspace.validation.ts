import Joi from "joi"

export const createWorkspaceSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().allow(null, ""),
  whatsappPhoneNumber: Joi.string().allow(null, ""),
  whatsappApiToken: Joi.string().allow(null, ""),
  whatsappWebhookUrl: Joi.string().uri().allow(null, ""),
})

export const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().allow(null, ""),
  whatsappPhoneNumber: Joi.string().allow(null, ""),
  whatsappApiToken: Joi.string().allow(null, ""),
  whatsappWebhookUrl: Joi.string().uri().allow(null, ""),
  isActive: Joi.boolean(),
}).min(1)
