import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import * as packageJson from "../../../../package.json"

export class HealthController {
  constructor(private readonly prisma: PrismaClient) {}

  async check(req: Request, res: Response): Promise<void> {
    let dbStatus = "unhealthy"

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`
      dbStatus = "healthy"
    } catch (error) {
      console.error("Database health check failed:", error)
    }

    const status = dbStatus === "healthy" ? "ok" : "error"
    const statusCode = status === "ok" ? 200 : 503

    const healthResponse = {
      status,
      timestamp: new Date().toISOString(),
      version: packageJson.version,
      services: {
        database: dbStatus,
      },
      uptime: process.uptime(),
    }

    res.status(statusCode).json(healthResponse)
  }
}
