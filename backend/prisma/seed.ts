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

  // Crea il workspace L'Altra Italia
  const workspace = await prisma.workspace.create({
    data: {
      name: "L'Altra Italia",
      slug: "altra-italia",
      whatsappPhoneNumber: "+39 123 456 7890",
      alias: "L'Altra Italia Shop",
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
  ])

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${admin.email}`)
  console.log(`- Workspace creato: ${workspace.name}`)
  console.log(`- Categorie create: ${categories.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
