/**
 * Script per verificare e correggere i prezzi nel database
 * Elimina record con prezzi > 0.15 e mantiene solo i messaggi da €0.15
 */

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function cleanOldPricing() {
  try {
    console.log("🔍 PULIZIA PREZZI VECCHI\n")

    // 1. Conta i record da pulire
    const usageToClean = await prisma.usage.count({
      where: { price: { gt: 0.15 } },
    })

    const billingToClean = await prisma.billing.count({
      where: { amount: { gt: 0.15 }, type: { not: "MONTHLY_CHANNEL" } },
    })

    console.log(`📊 Record da pulire:`)
    console.log(`  Usage: ${usageToClean} record con prezzo > €0.15`)
    console.log(`  Billing: ${billingToClean} record con prezzo > €0.15\n`)

    if (usageToClean === 0 && billingToClean === 0) {
      console.log("✅ Nessun record da pulire!")

      // Mostra i totali attuali
      const usageTotal = await prisma.usage.aggregate({
        _sum: { price: true },
      })
      const billingTotal = await prisma.billing.aggregate({
        _sum: { amount: true },
      })

      console.log(`\n💰 TOTALI CORRENTI:`)
      console.log(
        `  Usage (Analytics): €${(usageTotal._sum.price || 0).toFixed(2)}`
      )
      console.log(`  Billing: €${(billingTotal._sum.amount || 0).toFixed(2)}`)
      return
    }

    console.log("⚠️  ATTENZIONE: Sto per eliminare i record con prezzi vecchi!")
    console.log("Premi CTRL+C nei prossimi 5 secondi per annullare...\n")
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // 2. Elimina i record vecchi da Usage
    const deletedUsage = await prisma.usage.deleteMany({
      where: { price: { gt: 0.15 } },
    })
    console.log(`✅ Eliminati ${deletedUsage.count} record da Usage\n`)

    // 3. Elimina i record vecchi da Billing (tranne MONTHLY_CHANNEL)
    const deletedBilling = await prisma.billing.deleteMany({
      where: {
        amount: { gt: 0.15 },
        type: { not: "MONTHLY_CHANNEL" },
      },
    })
    console.log(`✅ Eliminati ${deletedBilling.count} record da Billing\n`)

    // 4. Mostra i nuovi totali
    const newUsageTotal = await prisma.usage.aggregate({
      _sum: { price: true },
    })
    const newBillingTotal = await prisma.billing.aggregate({
      _sum: { amount: true },
    })

    console.log(`💰 NUOVI TOTALI:`)
    console.log(
      `  Usage (Analytics): €${(newUsageTotal._sum.price || 0).toFixed(2)}`
    )
    console.log(`  Billing: €${(newBillingTotal._sum.amount || 0).toFixed(2)}`)

    const difference = Math.abs(
      (newBillingTotal._sum.amount || 0) - (newUsageTotal._sum.price || 0)
    )
    if (difference < 0.01) {
      console.log(`\n✅ I sistemi sono ora sincronizzati!`)
    } else {
      console.log(`\n⚠️  Differenza: €${difference.toFixed(2)}`)
    }
  } catch (error) {
    console.error("❌ Errore:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Esegui
if (require.main === module) {
  cleanOldPricing()
}

module.exports = { cleanOldPricing }
