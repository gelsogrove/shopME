import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"

export class HealthController {
  constructor(private readonly prisma: PrismaClient) {}

  async check(_req: Request, res: Response): Promise<void> {
    let dbStatus = "unhealthy"
    let redisStatus = "unhealthy"

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`
      dbStatus = "healthy"
    } catch (error) {
      console.error("Database health check failed:", error)
    }

    // TODO: Add Redis health check when Redis is integrated
    try {
      // Placeholder for Redis health check
      redisStatus = "healthy"
    } catch (error) {
      console.error("Redis health check failed:", error)
    }

    // Get application version from package.json
    const version = process.env.npm_package_version || "unknown"

    const healthResponse = {
      status:
        dbStatus === "healthy" && redisStatus === "healthy" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      version,
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      uptime: process.uptime(),
    }

    res.status(healthResponse.status === "ok" ? 200 : 503).json(healthResponse)
  }
}
