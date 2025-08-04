import { NextFunction, Request, Response } from "express"

/**
 * Middleware to authenticate N8N internal API calls
 * Supports both Bearer Token and Basic Auth for N8N compatibility
 */
export const n8nAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  // ANDREA DEBUG: Log tutti gli headers per capire cosa manda N8N
  console.log(
    "🔍 N8N AUTH DEBUG - All headers:",
    JSON.stringify(req.headers, null, 2)
  )
  console.log("🔍 N8N AUTH DEBUG - Authorization header:", authHeader)

  if (!authHeader) {
    console.log("🚨 N8N AUTH DEBUG - Missing authorization header")
    return res.status(401).json({
      status: "error",
      message: "Authorization header required for internal API access",
    })
  }

  // Support Bearer Token authentication
  if (authHeader.startsWith("Bearer ")) {
    console.log("🔍 N8N AUTH DEBUG - Trying Bearer token auth")
    const token = authHeader.replace("Bearer ", "")
    const internalSecret = process.env.INTERNAL_API_SECRET

    if (internalSecret && token === internalSecret) {
      console.log("✅ N8N AUTH DEBUG - Bearer token valid")
      return next()
    }
    console.log("🚨 N8N AUTH DEBUG - Bearer token invalid")
  }

  // Support Basic Auth authentication (for N8N workflow compatibility)
  if (authHeader.startsWith("Basic ")) {
    console.log("🔍 N8N AUTH DEBUG - Trying Basic auth")
    const credentials = Buffer.from(
      authHeader.split(" ")[1],
      "base64"
    ).toString("ascii")
    const [username, password] = credentials.split(":")

    console.log("🔍 N8N AUTH DEBUG - Decoded credentials:", {
      username,
      password: password ? "[HIDDEN]" : "missing",
    })

    // Allow admin:admin for N8N workflow calls
    if (username === "admin" && password === "admin") {
      console.log("✅ N8N AUTH DEBUG - Basic auth valid")
      return next()
    }
    console.log("🚨 N8N AUTH DEBUG - Basic auth invalid")
  }

  console.log("🚨 N8N AUTH DEBUG - No valid auth method found")
  return res.status(401).json({
    status: "error",
    message: "Invalid authorization format",
  })
}
