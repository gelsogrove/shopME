import Joi from "joi"

export const createProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().allow(null, ""),
  price: Joi.number().required().min(0),
  stock: Joi.number().integer().min(0).default(0),
  sku: Joi.string().allow(null, ""),
  categoryId: Joi.string().allow(null, ""),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required()
    .messages({ 'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens' }),
  isActive: Joi.boolean().default(true),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK').default('ACTIVE')
})

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().allow(null, ""),
  price: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  sku: Joi.string().allow(null, ""),
  categoryId: Joi.string().allow(null, ""),
  slug: Joi.string().pattern(/^[a-z0-9-]+$/),
  isActive: Joi.boolean(),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK')
}).min(1)

export const productQuerySchema = Joi.object({
  workspaceId: Joi.string().required(),
  categoryId: Joi.string().allow(null, ""),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED', 'OUT_OF_STOCK'),
  isActive: Joi.boolean(),
  search: Joi.string().allow(null, ""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'stock').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
}) 