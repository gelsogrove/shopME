import logger from "./utils/logger"
import { PrismaClient } from "@prisma/client";
import app from "./app";

const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

// Start the server
async function startServer() {
  try {
    await prisma.$connect()
    logger.info("Connected to database")

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
// Force reload
// Force reload 2
// Force reload 3
// Force reload 4
