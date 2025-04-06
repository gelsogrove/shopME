import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Clean the database in reverse order of dependencies
  await prisma.orderItems.deleteMany()
  await prisma.cartItems.deleteMany()
  await prisma.orders.deleteMany()
  await prisma.carts.deleteMany()
  await prisma.products.deleteMany()
  await prisma.customers.deleteMany()
  await prisma.prompts.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.categories.deleteMany()
  await prisma.languages.deleteMany()
  await prisma.workspaces.deleteMany()

  try {
    // Create workspace
    const workspace = await prisma.workspaces.create({
      data: {
        name: "Italian Delights",
        description: "Authentic Italian DOP, IGP, and DOCG products",
        whatsappPhoneNumber: "+1234567890",
        whatsappApiToken: "dummy_token",
        whatsappWebhookUrl: "https://api.italiandelights.com/webhook",
      },
    })

    // Create languages
    await prisma.languages.createMany({
      data: [
        {
          workspaceId: workspace.id,
          code: "it",
          name: "Italiano",
          isDefault: true,
        },
        {
          workspaceId: workspace.id,
          code: "en",
          name: "English",
          isDefault: false,
        },
      ],
    })

    // Create categories
    const categories = await prisma.categories.createMany({
      data: [
        {
          workspaceId: workspace.id,
          name: "Formaggi DOP",
          description: "Formaggi italiani certificati DOP",
          slug: "formaggi-dop",
          imageUrl: "https://example.com/images/formaggi.jpg",
        },
        {
          workspaceId: workspace.id,
          name: "Aceti e Condimenti",
          description: "Aceti balsamici e condimenti tradizionali",
          slug: "aceti-condimenti",
          imageUrl: "https://example.com/images/aceti.jpg",
        },
        {
          workspaceId: workspace.id,
          name: "Vini DOCG",
          description: "Vini italiani certificati DOCG",
          slug: "vini-docg",
          imageUrl: "https://example.com/images/vini.jpg",
        },
      ],
    })

    // Create AI prompts
    const prompts = await prisma.prompts.createMany({
      data: [
        {
          workspaceId: workspace.id,
          name: "Benvenuto",
          content:
            "Ciao! Sono il tuo assistente virtuale di Italian Delights. Come posso aiutarti oggi?",
          category: "welcome",
          topP: 0.9,
          topK: 50,
          temperature: 0.7,
        },
        {
          workspaceId: workspace.id,
          name: "Informazioni Prodotto",
          content:
            "Ti racconto tutto su questo prodotto italiano certificato...",
          category: "product_info",
          topP: 0.8,
          topK: 40,
          temperature: 0.6,
        },
        {
          workspaceId: workspace.id,
          name: "Stato Ordine",
          content: "Il tuo ordine è in fase di {status}. Ecco i dettagli:",
          category: "order_status",
          topP: 0.95,
          topK: 30,
          temperature: 0.5,
        },
      ],
    })

    // Get category IDs
    const [formaggiCategory, acetiCategory, viniCategory] = await Promise.all([
      prisma.categories.findFirst({ where: { slug: "formaggi-dop" } }),
      prisma.categories.findFirst({ where: { slug: "aceti-condimenti" } }),
      prisma.categories.findFirst({ where: { slug: "vini-docg" } }),
    ])

    // Create products
    const products = await prisma.products.createMany({
      data: [
        {
          workspaceId: workspace.id,
          categoryId: formaggiCategory?.id,
          name: "Parmigiano Reggiano DOP 24 Mesi",
          description: "Il Re dei Formaggi stagionato 24 mesi",
          price: 25.9,
          imageUrl: "https://example.com/images/parmigiano.jpg",
          certification: "DOP",
          region: "Emilia-Romagna",
          producer: "Consorzio Parmigiano Reggiano",
          origin: "Parma",
          stock: 100,
        },
        {
          workspaceId: workspace.id,
          categoryId: acetiCategory?.id,
          name: "Aceto Balsamico di Modena IGP",
          description: "Aceto balsamico invecchiato tradizionale",
          price: 15.5,
          imageUrl: "https://example.com/images/balsamico.jpg",
          certification: "IGP",
          region: "Emilia-Romagna",
          producer: "Acetaia Tradizionale",
          origin: "Modena",
          stock: 150,
        },
        {
          workspaceId: workspace.id,
          categoryId: viniCategory?.id,
          name: "Brunello di Montalcino DOCG",
          description: "Vino rosso pregiato della Toscana",
          price: 45.0,
          imageUrl: "https://example.com/images/brunello.jpg",
          certification: "DOCG",
          region: "Toscana",
          producer: "Cantina Storica",
          origin: "Montalcino",
          stock: 75,
        },
      ],
    })

    // Create a demo customer
    const customer = await prisma.customers.create({
      data: {
        workspaceId: workspace.id,
        whatsappNumber: "+1987654321",
        name: "Mario Rossi",
        email: "mario.rossi@example.com",
      },
    })

    // Create a cart for the customer
    const cart = await prisma.carts.create({
      data: {
        workspaceId: workspace.id,
        customerId: customer.id,
      },
    })

    console.log("Seed data created successfully!")
    console.log({
      workspace: workspace.id,
      customer: customer.id,
      cart: cart.id,
    })
  } catch (error) {
    console.error("Error seeding data:", error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
