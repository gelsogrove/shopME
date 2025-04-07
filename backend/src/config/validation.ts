import { Config } from "./index"

export function validateConfig(config: Config): void {
  const requiredFields = {
    "database.url": config.database.url,
    "redis.url": config.redis.url,
    "redis.password": config.redis.password,
    "jwt.secret": config.jwt.secret,
  }

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration fields: ${missingFields.join(", ")}`
    )
  }

  // Validate port is a number
  if (typeof config.port !== "number" && typeof config.port !== "string") {
    throw new Error("Port must be a number or string")
  }

  // Validate CORS origins
  if (!Array.isArray(config.cors.origin)) {
    throw new Error("CORS origins must be an array")
  }

  // Validate logging level
  const validLogLevels = ["error", "warn", "info", "debug"]
  if (!validLogLevels.includes(config.logging.level)) {
    throw new Error(
      `Invalid logging level. Must be one of: ${validLogLevels.join(", ")}`
    )
  }
}
