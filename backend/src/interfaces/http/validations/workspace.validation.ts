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
  currency: Joi.string().valid('EUR', 'USD', 'GBP'),
  language: Joi.string().valid('en', 'it', 'es', 'pr','fr','de'),
  welcomeMessages: Joi.object({
    it: Joi.string().allow(null, ""),
    en: Joi.string().allow(null, ""),
    es: Joi.string().allow(null, ""),
    pr: Joi.string().allow(null, ""),
    fr: Joi.string().allow(null, ""),
    de: Joi.string().allow(null, "")
  }).allow(null)
}).min(1)
