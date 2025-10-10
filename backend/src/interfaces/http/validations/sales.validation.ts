import Joi from "joi"

export const createSalesSchema = Joi.object({
  firstName: Joi.string().required().min(1).max(100),
  lastName: Joi.string().required().min(1).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(null, ""),
  isActive: Joi.boolean().default(true),
  workspaceId: Joi.string().required(),
})

export const updateSalesSchema = Joi.object({
  firstName: Joi.string().min(1).max(100),
  lastName: Joi.string().min(1).max(100),
  email: Joi.string().email(),
  phone: Joi.string().allow(null, ""),
  isActive: Joi.boolean(),
}).min(1)

export const salesQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  isActive: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
})
