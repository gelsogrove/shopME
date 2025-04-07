import { PrismaClient } from "@prisma/client"
import app from "./app"

const PORT = process.env.PORT || 3001
const prisma = new PrismaClient()

async function startServer() {
  try {
    await prisma.$connect()
    console.log("Connected to database")

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
