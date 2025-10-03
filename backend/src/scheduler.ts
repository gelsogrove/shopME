import { SchedulerService } from "./services/scheduler.service"
import logger from "./utils/logger"

const scheduler = new SchedulerService()
scheduler.startScheduledTasks()

logger.info("🕒 Scheduler service started independently")

// Mantieni il processo in vita
process.on("SIGINT", () => {
  logger.info("Shutting down scheduler...")
  process.exit(0)
})
