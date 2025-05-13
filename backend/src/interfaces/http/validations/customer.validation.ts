import Joi from "joi"

export const createCustomerSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ""),
  address: Joi.string().allow(null, ""),
  company: Joi.string().allow(null, ""),
  discount: Joi.number().min(0).max(100).default(0),
  language: Joi.string().valid('ENG', 'IT', 'ES', 'PT').default('ENG'),
  currency: Joi.string().valid('EUR', 'USD', 'GBP').default('EUR'),
  notes: Joi.string().allow(null, ""),
  serviceIds: Joi.array().items(Joi.string()).default([]),
  isBlacklisted: Joi.boolean().default(false),
  workspaceId: Joi.string().required(),
  last_privacy_version_accepted: Joi.string().allow(null),
  privacy_accepted_at: Joi.date().allow(null),
  push_notifications_consent: Joi.boolean().default(false),
  activeChatbot: Joi.boolean().default(true)
})

export const updateCustomerSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  email: Joi.string().email(),
  phone: Joi.string().allow(null, ""),
  address: Joi.string().allow(null, ""),
  company: Joi.string().allow(null, ""),
  discount: Joi.number().min(0).max(100),
  language: Joi.string().valid('ENG', 'IT', 'ES', 'PT'),
  currency: Joi.string().valid('EUR', 'USD', 'GBP'),
  notes: Joi.string().allow(null, ""),
  serviceIds: Joi.array().items(Joi.string()),
  isBlacklisted: Joi.boolean(),
  last_privacy_version_accepted: Joi.string().allow(null),
  privacy_accepted_at: Joi.date().allow(null),
  push_notifications_consent: Joi.boolean(),
  push_notifications_consent_at: Joi.date(),
  activeChatbot: Joi.boolean()
}).min(1)

export const customerQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  isBlacklisted: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
}) 