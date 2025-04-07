import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { RedisClient } from "../../../infrastructure/services/redis.client"
import logger from "../../../utils/logger"

export class HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: RedisClient
  ) {}

  async check(req: Request, res: Response) {
    let dbStatus = "unhealthy"
    let redisStatus = "unhealthy"

    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`
      dbStatus = "healthy"
    } catch (error) {
      logger.error("Database health check failed", error)
    }

    try {
      // Check Redis connection
      await this.redis.ping()
      redisStatus = "healthy"
    } catch (error) {
      logger.error("Redis health check failed", error)
    }

    // Get package version
    const { version } = require("../../../../package.json")

    const health = {
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

    const statusCode = health.status === "ok" ? 200 : 503
    res.status(statusCode).json(health)
  }
}
