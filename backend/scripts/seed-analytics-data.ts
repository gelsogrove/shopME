/**
 * ANALYTICS DATA SEED SCRIPT
 * 
 * Creates realistic analytics data for the last 3 months:
 * - Customers with varied activity patterns
 * - Orders distributed across months with seasonal trends
 * - Chat sessions and messages with realistic timestamps
 * - Usage data with daily/weekly patterns
 * 
 * Run: npx ts-node scripts/seed-analytics-data.ts
 */

import { PrismaClient, OrderStatus } from "@prisma/client"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()
const mainWorkspaceId = "cm9hjgq9v00014qk8fsdy4ujv"

// Helper function to get random date in last N days
function getRandomDateInLastDays(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * days))
  return date
}

// Helper function to get start of month for a given date
function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Helper function to get Italian customer names
function getRandomItalianName(): { firstName: string; lastName: string; fullName: string } {
  const firstNames = [
    "Giuseppe", "Francesco", "Antonio", "Mario", "Luigi", "Giovanni", "Vincenzo", "Salvatore",
    "Maria", "Anna", "Francesca", "Rosa", "Giuseppina", "Lucia", "Angela", "Giovanna"
  ]
  const lastNames = [
    "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci",
    "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa"
  ]
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  }
}

// Helper function to get Spanish customer names
function getRandomSpanishName(): { firstName: string; lastName: string; fullName: string } {
  const firstNames = [
    "José", "Antonio", "Manuel", "Francisco", "David", "Juan", "Javier", "Daniel",
    "María", "Carmen", "Josefa", "Isabel", "Ana", "Dolores", "Pilar", "Teresa"
  ]
  const lastNames = [
    "García", "González", "Rodríguez", "Fernández", "López", "Martínez", "Sánchez", "Pérez",
    "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno", "Muñoz"
  ]
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  }
}

async function seedAnalyticsData() {
  console.log("🔄 Starting Analytics Data Seeding...")
  console.log("=====================================")

  // Get existing products and services
  const products = await prisma.products.findMany({
    where: { workspaceId: mainWorkspaceId, status: "ACTIVE" },
    include: { category: true }
  })

  const services = await prisma.services.findMany({
    where: { workspaceId: mainWorkspaceId }
  })

  console.log(`Found ${products.length} products and ${services.length} services`)

  if (products.length === 0) {
    console.error("❌ No products found. Please run main seed first.")
    return
  }

  // 1. CREATE ADDITIONAL CUSTOMERS (15 new customers)
  console.log("👥 Creating additional customers...")
  
  const newCustomers = []
  for (let i = 0; i < 15; i++) {
    const isItalian = Math.random() < 0.6 // 60% Italian, 40% Spanish
    const nameData = isItalian ? getRandomItalianName() : getRandomSpanishName()
    const language = isItalian ? "it" : "es"
    const phonePrefix = isItalian ? "+39" : "+34"
    const domains = isItalian 
      ? ["gmail.com", "libero.it", "virgilio.it", "alice.it", "tiscali.it"]
      : ["gmail.com", "hotmail.es", "yahoo.es", "outlook.es", "telefonica.net"]
    
    const email = `${nameData.firstName.toLowerCase()}.${nameData.lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`
    const phone = `${phonePrefix}${Math.floor(100000000 + Math.random() * 900000000)}`
    
    // Customer registration spread over last 90 days
    const registrationDate = getRandomDateInLastDays(90)
    
    try {
      const customer = await prisma.customers.create({
        data: {
          name: nameData.fullName,
          email: email,
          phone: phone,
          address: isItalian ? 
            `Via ${['Roma', 'Milano', 'Napoli', 'Firenze', 'Bologna'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}` :
            `Calle ${['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}`,
          language: language,
          currency: "EUR",
          workspaceId: mainWorkspaceId,
          activeChatbot: true,
          privacy_accepted_at: registrationDate,
          push_notifications_consent: Math.random() < 0.8, // 80% consent rate
          push_notifications_consent_at: Math.random() < 0.8 ? registrationDate : null,
          createdAt: registrationDate
        }
      })
      
      newCustomers.push(customer)
      console.log(`✅ Customer created: ${customer.name} (${customer.language})`)
    } catch (error) {
      console.log(`⚠️ Error creating customer ${nameData.fullName}:`, error.message)
    }
  }

  // Get all customers (existing + new)
  const allCustomers = await prisma.customers.findMany({
    where: { workspaceId: mainWorkspaceId }
  })
  console.log(`📊 Total customers: ${allCustomers.length}`)

  // 2. CREATE ORDERS WITH REALISTIC PATTERNS
  console.log("📦 Creating orders with seasonal patterns...")
  
  const ordersToCreate = 45 // 15 orders per month on average
  const orderStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"]
  const statusWeights = [0.15, 0.25, 0.55, 0.05] // 55% delivered, 25% processing, 15% pending, 5% cancelled

  // Create orders distributed over 3 months with realistic patterns
  for (let i = 0; i < ordersToCreate; i++) {
    // Create seasonal patterns - more orders in recent months
    const daysAgo = Math.random() < 0.5 ? 
      Math.floor(Math.random() * 30) : // 50% in last 30 days
      Math.floor(Math.random() * 90)   // 50% in last 90 days
    
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - daysAgo)
    
    // Random customer
    const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)]
    
    // Random status based on weights
    let randomValue = Math.random()
    let statusIndex = 0
    for (let j = 0; j < statusWeights.length; j++) {
      randomValue -= statusWeights[j]
      if (randomValue <= 0) {
        statusIndex = j
        break
      }
    }
    const status = orderStatuses[statusIndex]
    
    // Order value varies by customer and season
    const baseAmount = 25 + Math.random() * 150 // 25-175 base
    const seasonalMultiplier = daysAgo < 30 ? 1.2 : 1.0 // Recent orders higher value
    const totalAmount = Number((baseAmount * seasonalMultiplier).toFixed(2))
    
    try {
      const order = await prisma.orders.create({
        data: {
          orderCode: `ORD-${Date.now()}-${i.toString().padStart(3, '0')}`,
          customerId: customer.id,
          workspaceId: mainWorkspaceId,
          status: status,
          totalAmount: totalAmount,
          shippingAddress: {
            name: customer.name,
            street: customer.address?.split(',')[0] || "Via Roma 1",
            city: customer.language === 'it' ? 
              ['Milano', 'Roma', 'Napoli', 'Torino', 'Palermo'][Math.floor(Math.random() * 5)] :
              ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][Math.floor(Math.random() * 5)],
            postalCode: customer.language === 'it' ? 
              `${Math.floor(10000 + Math.random() * 90000)}` :
              `${Math.floor(10000 + Math.random() * 90000)}`,
            country: customer.language === 'it' ? "Italia" : "España",
            phone: customer.phone
          },
          createdAt: orderDate
        }
      })

      // Add 1-4 random products to each order
      const itemsCount = 1 + Math.floor(Math.random() * 4)
      let orderTotal = 0
      
      for (let j = 0; j < itemsCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const quantity = 1 + Math.floor(Math.random() * 3)
        const unitPrice = product.price
        const itemTotal = unitPrice * quantity
        
        await prisma.orderItems.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: itemTotal
          }
        })
        
        orderTotal += itemTotal
      }

      // Update order total to match actual items
      await prisma.orders.update({
        where: { id: order.id },
        data: { totalAmount: Number(orderTotal.toFixed(2)) }
      })

      if (i % 10 === 0) {
        console.log(`📦 Created ${i + 1}/${ordersToCreate} orders`)
      }
    } catch (error) {
      console.log(`⚠️ Error creating order ${i + 1}:`, error.message)
    }
  }

  // 3. CREATE CHAT SESSIONS AND MESSAGES
  console.log("💬 Creating chat sessions and messages...")
  
  // Create chat sessions for 80% of customers
  const customersWithChats = allCustomers.filter(() => Math.random() < 0.8)
  
  for (const customer of customersWithChats) {
    // 1-3 chat sessions per customer
    const sessionsCount = 1 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < sessionsCount; i++) {
      const sessionDate = getRandomDateInLastDays(90)
      
      try {
        const chatSession = await prisma.chatSession.create({
          data: {
            customerId: customer.id,
            workspaceId: mainWorkspaceId,
            status: Math.random() < 0.7 ? "active" : "completed",
            context: {
              language: customer.language,
              userRegistered: true,
              lastActivity: sessionDate.toISOString()
            },
            createdAt: sessionDate
          }
        })

        // 3-15 messages per session
        const messagesCount = 3 + Math.floor(Math.random() * 13)
        
        for (let j = 0; j < messagesCount; j++) {
          const messageDate = new Date(sessionDate)
          messageDate.setMinutes(sessionDate.getMinutes() + (j * 2)) // 2 minutes apart
          
          const isInbound = j % 2 === 0 // Alternate between inbound/outbound
          
          const messages = {
            it: {
              inbound: ["Ciao", "Avete mozzarella?", "Quanto costa?", "Vorrei ordinare", "Grazie"],
              outbound: ["Ciao! Come posso aiutarti?", "Sì, abbiamo mozzarella fresca!", "Il prezzo è €12.50", "Perfetto! Ti aiuto con l'ordine", "Prego!"]
            },
            es: {
              inbound: ["Hola", "¿Tienen mozzarella?", "¿Cuánto cuesta?", "Quiero pedir", "Gracias"],
              outbound: ["¡Hola! ¿En qué puedo ayudarte?", "¡Sí, tenemos mozzarella fresca!", "El precio es €12.50", "¡Perfecto! Te ayudo con el pedido", "¡De nada!"]
            }
          }
          
          const langMessages = messages[customer.language as 'it' | 'es'] || messages.it
          const content = isInbound ? 
            langMessages.inbound[j % langMessages.inbound.length] :
            langMessages.outbound[j % langMessages.outbound.length]

          await prisma.message.create({
            data: {
              chatSessionId: chatSession.id,
              direction: isInbound ? "INBOUND" : "OUTBOUND",
              content: content,
              type: "TEXT",
              status: "sent",
              aiGenerated: !isInbound,
              metadata: {
                timestamp: messageDate.toISOString(),
                source: "whatsapp"
              },
              createdAt: messageDate
            }
          })
        }
      } catch (error) {
        console.log(`⚠️ Error creating chat for ${customer.name}:`, error.message)
      }
    }
  }

  // 4. CREATE USAGE DATA WITH REALISTIC PATTERNS
  console.log("💰 Creating usage data...")
  
  const usageRecords = []
  const today = new Date()
  
  // Create usage for last 90 days
  for (let day = 89; day >= 0; day--) {
    const date = new Date(today)
    date.setDate(date.getDate() - day)
    
    // More usage on weekdays, less on weekends
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5
    const baseMessages = isWeekday ? 12 : 5
    const variation = Math.floor(Math.random() * 8) // Random variation
    const dailyMessages = baseMessages + variation
    
    // Create messages throughout the day
    for (let i = 0; i < dailyMessages; i++) {
      const messageTime = new Date(date)
      
      // Peak hours: 9-12 and 14-18 on weekdays
      let hour
      if (isWeekday && Math.random() < 0.7) {
        hour = Math.random() < 0.5 ? 
          9 + Math.floor(Math.random() * 4) :  // 9-12
          14 + Math.floor(Math.random() * 5)   // 14-18
      } else {
        hour = Math.floor(Math.random() * 24)
      }
      
      messageTime.setHours(
        hour,
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      )
      
      // Random customer
      const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)]
      
      usageRecords.push({
        workspaceId: mainWorkspaceId,
        clientId: customer.id,
        price: 0.005, // €0.005 per message
        createdAt: messageTime
      })
    }
  }

  // Create usage records in batches
  const batchSize = 100
  for (let i = 0; i < usageRecords.length; i += batchSize) {
    const batch = usageRecords.slice(i, i + batchSize)
    
    try {
      await prisma.usage.createMany({
        data: batch,
        skipDuplicates: true
      })
      
      if (i % 500 === 0) {
        console.log(`💰 Created ${i + batch.length}/${usageRecords.length} usage records`)
      }
    } catch (error) {
      console.log(`⚠️ Error creating usage batch ${i}:`, error.message)
    }
  }

  // 5. UPDATE PRODUCT STOCK BASED ON ORDERS
  console.log("📦 Updating product stock based on order history...")
  
  for (const product of products) {
    // Calculate total sold from order items
    const orderItems = await prisma.orderItems.findMany({
      where: {
        productId: product.id,
        order: {
          status: { in: ["PROCESSING", "DELIVERED"] }
        }
      }
    })
    
    const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0)
    
    // Update product stock to reflect sales + remaining stock
    const newStock = Math.max(0, product.stock - Math.floor(totalSold * 0.3)) // Reduce by 30% of sales
    
    await prisma.products.update({
      where: { id: product.id },
      data: { stock: newStock }
    })
    
    console.log(`📦 ${product.name}: ${totalSold} sold, stock updated to ${newStock}`)
  }

  // SUMMARY
  console.log("\n🎉 ANALYTICS DATA SEEDING COMPLETED!")
  console.log("=====================================")
  
  const summary = {
    customers: allCustomers.length,
    orders: await prisma.orders.count({ where: { workspaceId: mainWorkspaceId }}),
    chatSessions: await prisma.chatSession.count({ where: { workspaceId: mainWorkspaceId }}),
    messages: await prisma.message.count({ 
      where: { 
        chatSession: { workspaceId: mainWorkspaceId }
      }
    }),
    usageRecords: usageRecords.length,
    totalUsageCost: (usageRecords.length * 0.005).toFixed(4)
  }
  
  console.log(`👥 Total Customers: ${summary.customers}`)
  console.log(`📦 Total Orders: ${summary.orders}`)
  console.log(`💬 Total Chat Sessions: ${summary.chatSessions}`)
  console.log(`📨 Total Messages: ${summary.messages}`)
  console.log(`💰 Total Usage Records: ${summary.usageRecords}`)
  console.log(`💵 Total Usage Cost: €${summary.totalUsageCost}`)
  console.log("\n✅ Analytics Dashboard ready with 3 months of data!")
}

async function main() {
  try {
    await seedAnalyticsData()
  } catch (error) {
    console.error("❌ Error seeding analytics data:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { seedAnalyticsData }