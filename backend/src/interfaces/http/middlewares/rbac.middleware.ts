import { NextFunction, Request, Response } from "express"
import { AppError } from "./error.middleware"

export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}

export const hasRole = (requiredRole: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    if (!userRole) {
      throw new AppError(401, "Unauthorized")
    }

    const roles = Object.values(UserRole)
    const userRoleIndex = roles.indexOf(userRole as UserRole)
    const requiredRoleIndex = roles.indexOf(requiredRole)

    if (userRoleIndex === -1 || userRoleIndex > requiredRoleIndex) {
      throw new AppError(403, "Insufficient permissions")
    }

    next()
  }
}

export const isAdmin = hasRole(UserRole.ADMIN)
export const isOwner = hasRole(UserRole.OWNER)
export const isMember = hasRole(UserRole.MEMBER)
