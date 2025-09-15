console.log(`🚨🚨🚨 SERVER INDEX.TS STARTED - MODIFIED VERSION 🚨🚨🚨`)
console.log(`🔧 DEBUG: Server is using modified code - FIRST LINE`)

import { PrismaClient } from "@prisma/client";
import 'dotenv/config';
import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

// Start the server
async function startServer() {
  try {
    console.log("🚀🚀🚀 SERVER STARTING - MODIFIED VERSION 🚀🚀🚀")
    console.log("🔧 DEBUG: Server is using modified code with console.log")
    console.log("🔧 DEBUG: FORCE RELOAD - SERVER SHOULD RESTART NOW")
    console.log("🔧 DEBUG: SERVER IS USING MODIFIED CODE - CONSOLE.LOG ADDED")
    console.log("🔧 DEBUG: FINAL TEST - SERVER MUST RESTART NOW")
    
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
