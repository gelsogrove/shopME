#!/usr/bin/env node

/**
 * Test Embedding Regeneration
 * This script tests the enhanced embedding regeneration system
 */

const { PrismaClient } = require("@prisma/client")
const path = require("path")

// Import the embedding service
const embeddingServicePath = path.join(
  __dirname,
  "../backend/dist/src/services/embeddingService.js"
)
const { EmbeddingService } = require(embeddingServicePath)

const prisma = new PrismaClient()
const embeddingService = new EmbeddingService()

async function testEmbeddingRegeneration() {
  console.log("🧪 Testing Embedding Regeneration System")
  console.log("=========================================")

  try {
    // Test workspace ID
    const workspaceId = "clzd8x8z20000356cqhpe6yu0"

    console.log(`📋 Testing FAQ embeddings for workspace: ${workspaceId}`)

    // Get FAQ count before
    const faqsBefore = await prisma.faq.count({ where: { workspaceId } })
    console.log(`📊 Found ${faqsBefore} FAQs in workspace`)

    if (faqsBefore === 0) {
      console.log("⚠️ No FAQs found - creating a test FAQ")
      await prisma.faq.create({
        data: {
          question: "Test embedding question?",
          answer: "This is a test answer for embedding regeneration testing.",
          workspaceId: workspaceId,
          active: true,
        },
      })
      console.log("✅ Test FAQ created")
    }

    // Test embedding regeneration
    console.log("🔄 Starting FAQ embedding regeneration...")
    await embeddingService.generateFAQEmbeddings(workspaceId)
    console.log("✅ FAQ embedding regeneration completed")

    // Check embedding chunks
    const chunks = await prisma.embeddingChunk.count({
      where: {
        workspaceId,
        type: "FAQ",
      },
    })
    console.log(`📊 Found ${chunks} FAQ embedding chunks after regeneration`)

    console.log("🎉 Test completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error)
    console.error("Stack:", error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testEmbeddingRegeneration().catch(console.error)
