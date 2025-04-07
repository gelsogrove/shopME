import { PrismaClient } from "@prisma/client"
import app from "./app"

const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

async function main() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("Database connection established")

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
