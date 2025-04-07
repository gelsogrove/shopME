import { NextFunction, Request, Response } from "express"
import Joi from "joi"

const createWorkspaceSchema = Joi.object({
  name: Joi.string().required().max(100),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .max(100),
  description: Joi.string().allow(null),
  whatsappPhoneNumber: Joi.string().allow(null),
  whatsappApiToken: Joi.string().allow(null),
  whatsappWebhookUrl: Joi.string().uri().allow(null),
})

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().max(100),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .max(100),
  description: Joi.string().allow(null),
  whatsappPhoneNumber: Joi.string().allow(null),
  whatsappApiToken: Joi.string().allow(null),
  whatsappWebhookUrl: Joi.string().uri().allow(null),
  isActive: Joi.boolean(),
})

export const validateCreateWorkspace = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = createWorkspaceSchema.validate(req.body)
  if (error) {
    res.status(400).json({ error: error.details[0].message })
    return
  }
  next()
}

export const validateUpdateWorkspace = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updateWorkspaceSchema.validate(req.body)
  if (error) {
    res.status(400).json({ error: error.details[0].message })
    return
  }
  next()
}
