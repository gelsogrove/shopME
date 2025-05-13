import Joi from "joi"

export const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().allow(null, ""),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required()
    .messages({ 'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens' }),
  isActive: Joi.boolean().default(true),
  workspaceId: Joi.string().required()
})

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().allow(null, ""),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/),
  isActive: Joi.boolean()
}).min(1)

export const categoryQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  isActive: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
}) 