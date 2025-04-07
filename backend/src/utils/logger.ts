import winston from "winston"
import "winston-daily-rotate-file"
import config from "../config"

const { combine, timestamp, printf, colorize, json } = winston.format

// Custom format for development environment
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const metaString = Object.keys(metadata).length
    ? `\n${JSON.stringify(metadata, null, 2)}`
    : ""
  return `${timestamp} ${level}: ${message}${metaString}`
})

// Create transports based on environment
const createTransports = () => {
  const transports: winston.transport[] = []

  // Console transport for all environments
  transports.push(
    new winston.transports.Console({
      format:
        config.env === "development" ? combine(colorize(), devFormat) : json(),
    })
  )

  // File transport for production and development
  if (config.env !== "test") {
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: "logs/application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: json(),
      })
    )

    // Separate error log file
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        level: "error",
        format: json(),
      })
    )
  }

  return transports
}

// Create the logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(timestamp(), json()),
  defaultMeta: { service: "shop-backend" },
  transports: createTransports(),
})

// Helper functions for structured logging
export const logInfo = (message: string, meta: object = {}) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error, meta: object = {}) => {
  logger.error(message, {
    ...meta,
    error: error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : undefined,
  })
}

export const logWarn = (message: string, meta: object = {}) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta: object = {}) => {
  logger.debug(message, meta)
}

export default logger
