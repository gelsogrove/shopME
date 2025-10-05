/**
 * Script per convertire i vecchi BillingType (MESSAGE_BASE, LLM_RESPONSE)
 * nel nuovo tipo unificato MESSAGE (€0.15)
 */

const { PrismaClient } = require("@prisma/client")

async function migrateBillingTypes() {
  const prisma = new PrismaClient()

  try {
    console.log("🔍 Controllo record da migrare...")

    // Conta i record con vecchi tipi
    const messageBaseCount = await prisma.billing.count({
      where: { type: "MESSAGE_BASE" },
    })

    const llmResponseCount = await prisma.billing.count({
      where: { type: "LLM_RESPONSE" },
    })

    console.log(`📊 Record trovati:`)
    console.log(`- MESSAGE_BASE: ${messageBaseCount}`)
    console.log(`- LLM_RESPONSE: ${llmResponseCount}`)

    if (messageBaseCount === 0 && llmResponseCount === 0) {
      console.log("✅ Nessun record da migrare")
      return
    }

    // Leggi tutti i record con vecchi tipi
    const oldRecords = await prisma.billing.findMany({
      where: {
        OR: [{ type: "MESSAGE_BASE" }, { type: "LLM_RESPONSE" }],
      },
    })

    console.log(`🔄 Migrazione di ${oldRecords.length} record...`)

    // Migra ogni record
    for (const record of oldRecords) {
      await prisma.billing.update({
        where: { id: record.id },
        data: {
          type: "MESSAGE",
          amount: 0.15, // Nuovo prezzo unificato €0.15
          description: `[MIGRATED] ${record.description || "Message interaction"}`,
        },
      })
    }

    console.log("✅ Migrazione completata!")
    console.log(
      `📈 Tutti i ${oldRecords.length} record ora usano MESSAGE (€0.15)`
    )
  } catch (error) {
    console.error("❌ Errore durante la migrazione:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  migrateBillingTypes()
}

module.exports = { migrateBillingTypes }
