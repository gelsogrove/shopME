#!/usr/bin/env node

/**
 * Simple FAQ Creation and Test
 * Creates FAQ about delivery times and tests RAG search
 */

const http = require("http")

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = ""
      res.on("data", (chunk) => {
        responseBody += chunk
      })
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body: responseBody,
          headers: res.headers,
        })
      })
    })

    req.on("error", (err) => {
      reject(err)
    })

    if (data) {
      req.write(data)
    }
    req.end()
  })
}

async function testDeliveryFAQ() {
  console.log("🧪 Testing FAQ Creation and RAG Search")
  console.log("=====================================")

  try {
    const workspaceId = "clzd8x8z20000356cqhpe6yu0"

    // Test the RAG search for delivery questions BEFORE creating FAQ
    console.log("\n📋 Testing RAG search BEFORE creating FAQ...")
    const ragBefore = await makeRequest({
      hostname: "localhost",
      port: 3002,
      path: `/api/internal/test-rag-open?query=${encodeURIComponent("tempi di consegna")}`,
      method: "GET",
    })

    console.log(`Status: ${ragBefore.statusCode}`)
    const resultBefore = JSON.parse(ragBefore.body)
    console.log(
      `Results BEFORE - Products: ${resultBefore.results?.products?.length || 0}, FAQs: ${resultBefore.results?.faqs?.length || 0}, Services: ${resultBefore.results?.services?.length || 0}`
    )

    // Now let's use Prisma CLI to create a FAQ about delivery times
    console.log(
      "\n📝 I will now show you how to manually create a delivery FAQ in Prisma Studio..."
    )
    console.log("1. Go to http://localhost:5555 (Prisma Studio)")
    console.log('2. Open the "FAQ" table')
    console.log('3. Click "Add record"')
    console.log("4. Fill in:")
    console.log(`   - workspaceId: ${workspaceId}`)
    console.log('   - question: "In quanto tempo arriva l\'ordine?"')
    console.log(
      '   - answer: "Gli ordini vengono consegnati in 3-6 giorni lavorativi. Per ordini urgenti contattaci direttamente."'
    )
    console.log("   - active: true")
    console.log("5. Save the record")
    console.log(
      "\nAfter creating the FAQ, we can test the embedding regeneration!"
    )

    console.log(
      "\n🎉 Instructions ready - create the FAQ manually and then we can test!"
    )
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Run the test
testDeliveryFAQ().catch(console.error)
