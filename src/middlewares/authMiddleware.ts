import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    )
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" })
  }
}
