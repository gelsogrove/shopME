import Joi from "joi"

// Invoice address validation schema
const invoiceAddressSchema = Joi.object({
  firstName: Joi.string().allow(null, "").max(50),
  lastName: Joi.string().allow(null, "").max(50),
  company: Joi.string().allow(null, "").max(100),
  address: Joi.string().allow(null, "").max(200),
  city: Joi.string().allow(null, "").max(50),
  postalCode: Joi.string().allow(null, "").max(10),
  country: Joi.string().allow(null, "").max(50),
  vatNumber: Joi.string().allow(null, "").max(20),
  phone: Joi.string().allow(null, "").max(20)
}).allow(null)

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
  activeChatbot: Joi.boolean().default(true),
  invoiceAddress: invoiceAddressSchema
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
  activeChatbot: Joi.boolean(),
  invoiceAddress: invoiceAddressSchema
}).min(1)

export const customerQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  isBlacklisted: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
}) 