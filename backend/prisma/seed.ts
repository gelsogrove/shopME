import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Crea l'utente admin
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.create({
    data: {
      email: "admin@shop.me",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      status: "ACTIVE",
    },
  })

  // Crea il workspace demo
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Shop",
      slug: "demo-shop",
      isActive: true,
      settings: {
        create: {
          language: "it",
          currency: "EUR",
          timezone: "Europe/Rome",
        },
      },
      users: {
        create: {
          userId: admin.id,
          role: "ADMIN",
        },
      },
    },
  })

  // Crea le categorie
  const categories = await Promise.all([
    prisma.categories.create({
      data: {
        name: "Elettronica",
        slug: "elettronica",
        description: "Prodotti elettronici e accessori",
        workspaceId: workspace.id,
        isActive: true,
      },
    }),
    prisma.categories.create({
      data: {
        name: "Abbigliamento",
        slug: "abbigliamento",
        description: "Vestiti e accessori moda",
        workspaceId: workspace.id,
        isActive: true,
      },
    }),
    prisma.categories.create({
      data: {
        name: "Casa",
        slug: "casa",
        description: "Articoli per la casa e arredamento",
        workspaceId: workspace.id,
        isActive: true,
      },
    }),
    prisma.categories.create({
      data: {
        name: "Sport",
        slug: "sport",
        description: "Attrezzatura e abbigliamento sportivo",
        workspaceId: workspace.id,
        isActive: true,
      },
    }),
    prisma.categories.create({
      data: {
        name: "Libri",
        slug: "libri",
        description: "Libri, ebook e audiolibri",
        workspaceId: workspace.id,
        isActive: true,
      },
    }),
  ])

  // Crea i prodotti demo
  const products = await Promise.all([
    // Elettronica
    prisma.products.create({
      data: {
        name: "Smartphone XYZ",
        slug: "smartphone-xyz",
        description: "Smartphone di ultima generazione",
        price: 599.99,
        stock: 50,
        categoryId: categories[0].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    prisma.products.create({
      data: {
        name: "Laptop Pro",
        slug: "laptop-pro",
        description: "Laptop professionale per lavoro e gaming",
        price: 1299.99,
        stock: 20,
        categoryId: categories[0].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    // Abbigliamento
    prisma.products.create({
      data: {
        name: "T-Shirt Premium",
        slug: "t-shirt-premium",
        description: "T-Shirt in cotone 100%",
        price: 29.99,
        stock: 100,
        categoryId: categories[1].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    prisma.products.create({
      data: {
        name: "Jeans Classic",
        slug: "jeans-classic",
        description: "Jeans classico blu",
        price: 79.99,
        stock: 75,
        categoryId: categories[1].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    // Casa
    prisma.products.create({
      data: {
        name: "Lampada Design",
        slug: "lampada-design",
        description: "Lampada moderna da tavolo",
        price: 89.99,
        stock: 30,
        categoryId: categories[2].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    prisma.products.create({
      data: {
        name: "Set Cucina",
        slug: "set-cucina",
        description: "Set completo di pentole e padelle",
        price: 199.99,
        stock: 25,
        categoryId: categories[2].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    // Sport
    prisma.products.create({
      data: {
        name: "Tapis Roulant",
        slug: "tapis-roulant",
        description: "Tapis roulant professionale",
        price: 799.99,
        stock: 10,
        categoryId: categories[3].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    prisma.products.create({
      data: {
        name: "Set Pesi",
        slug: "set-pesi",
        description: "Set completo di pesi per allenamento",
        price: 149.99,
        stock: 40,
        categoryId: categories[3].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    // Libri
    prisma.products.create({
      data: {
        name: "Best Seller 2024",
        slug: "best-seller-2024",
        description: "Il libro più venduto del 2024",
        price: 19.99,
        stock: 150,
        categoryId: categories[4].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
    prisma.products.create({
      data: {
        name: "Corso di Programmazione",
        slug: "corso-programmazione",
        description: "Guida completa alla programmazione moderna",
        price: 49.99,
        stock: 60,
        categoryId: categories[4].id,
        workspaceId: workspace.id,
        status: "ACTIVE",
        isActive: true,
      },
    }),
  ])

  // Create test user
  const testPassword = await bcrypt.hash("password123", 10)
  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: testPassword,
      firstName: "Test",
      lastName: "User",
      status: "ACTIVE",
    },
  })
  console.log("Created test user:", testUser)

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${admin.email}`)
  console.log(`- Workspace demo creato: ${workspace.name}`)
  console.log(`- Categorie create: ${categories.length}`)
  console.log(`- Prodotti creati: ${products.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
