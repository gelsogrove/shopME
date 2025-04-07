import { NextFunction, Request, Response } from "express"
import { Schema } from "joi"
import { AppError } from "./error.middleware"

export const validate = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    })

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ")
      throw new AppError(400, message)
    }

    next()
  }
}
