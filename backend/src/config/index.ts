import dotenv from "dotenv"
import development from "./environments/development"
import production from "./environments/production"
import test from "./environments/test"
import { validateConfig } from "./validation"

// Load environment variables from .env file
dotenv.config()

const env = process.env.NODE_ENV || "development"

const configs = {
  development,
  test,
  production,
}

const config = configs[env as keyof typeof configs]

if (!config) {
  throw new Error(`Invalid environment: ${env}`)
}

// Validate configuration
validateConfig(config)

export type Config = typeof development
export default config
