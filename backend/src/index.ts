import { PrismaClient } from "@prisma/client"
import express from "express"

const prisma = new PrismaClient()
const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
