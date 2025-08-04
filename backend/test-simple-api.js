#!/usr/bin/env node

/**
 * Simple Test Script to Monitor Server for Embedding Regeneration
 * This will validate our enhanced logging is working by calling endpoints
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

async function testEmbeddingSystem() {
  console.log("🧪 Testing Embedding System via HTTP")
  console.log("====================================")

  try {
    // Test the open RAG endpoint first
    console.log("📋 Testing open RAG endpoint...")
    const ragResponse = await makeRequest({
      hostname: "localhost",
      port: 3002,
      path: "/api/internal/test-rag-open",
      method: "GET",
    })

    console.log(`✅ RAG Test Status: ${ragResponse.statusCode}`)
    console.log(`📊 Response: ${ragResponse.body}`)

    // Test a few different queries
    const queries = ["consegna", "delivery", "mozzarella", "formaggio"]

    for (const query of queries) {
      console.log(`\n🔍 Testing query: "${query}"`)
      const response = await makeRequest({
        hostname: "localhost",
        port: 3002,
        path: `/api/internal/test-rag-open?query=${encodeURIComponent(query)}`,
        method: "GET",
      })

      console.log(`Status: ${response.statusCode}`)
      const result = JSON.parse(response.body)
      if (result.results) {
        console.log(
          `Results - Products: ${result.results.products?.length || 0}, FAQs: ${result.results.faqs?.length || 0}, Services: ${result.results.services?.length || 0}`
        )
      }
    }

    console.log(
      "\n🎉 Test completed - Check server logs for embedding activity!"
    )
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Run the test
testEmbeddingSystem().catch(console.error)
