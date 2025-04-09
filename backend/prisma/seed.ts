import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient()

let adminEmail = "admin@shopme.com"; // Define a variable to store admin email
let adminId;

async function main() {
  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@shopme.com" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        status: "ACTIVE",
      },
    });
    adminId = admin.id; // Store admin ID
    console.log(`Admin user creato: ${admin.email}`);
  } else {
    adminId = existingAdmin.id; // Use existing admin ID
    console.log("Admin user già esistente.");
  }

  // Check if the workspace already exists
  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: "altra-italia" },
  });

  let workspace;
  if (!existingWorkspace) {
    // Crea il workspace L'Altra Italia
    workspace = await prisma.workspace.create({
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
            userId: adminId, // Use admin ID
            role: "ADMIN",
          },
        },
      },
    });
    console.log(`Workspace creato: ${workspace.name}`);
  } else {
    workspace = existingWorkspace;
    console.log("Workspace già esistente.");
  }

  // Crea le lingue disponibili solo se non esistono già
  const languageCodes = ["it", "en", "es", "fr", "de"]
  const existingLanguages = await prisma.languages.findMany({
    where: {
      code: { in: languageCodes },
      workspaceId: workspace.id
    }
  })

  const existingLanguageCodes = existingLanguages.map(lang => lang.code)
  const languagesToCreate = languageCodes.filter(code => !existingLanguageCodes.includes(code))

  const languages = [...existingLanguages]

  if (languagesToCreate.length > 0) {
    const newLanguages = await Promise.all(
      languagesToCreate.map(code => 
        prisma.languages.create({
          data: {
            code,
            name: getLanguageName(code),
            workspace: { connect: { id: workspace.id } },
          },
        })
      )
    )
    languages.push(...newLanguages)
    console.log(`Nuove lingue create: ${languagesToCreate.join(", ")}`)
  } else {
    console.log("Tutte le lingue esistono già")
  }

  // Helper function to get language names
  function getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      it: "Italiano",
      en: "English",
      es: "Español",
      fr: "Français",
      de: "Deutsch"
    }
    return names[code] || code
  }

  // Connetti le lingue al workspace
  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      languages: {
        connect: languages.map((lang: { id: string }) => ({ id: lang.id })),
      },
    },
  })

  // Check if categories already exist
  const existingCategories = await Promise.all([
    prisma.categories.findUnique({ where: { slug: "elettronica" } }),
    prisma.categories.findUnique({ where: { slug: "abbigliamento" } }),
  ]);

  const categories = [];
  
  // Create categories if they don't exist
  if (!existingCategories[0]) {
    const elettronica = await prisma.categories.create({
      data: {
        name: "Elettronica",
        slug: "elettronica",
        description: "Prodotti elettronici e accessori",
        workspaceId: workspace.id,
        isActive: true,
      },
    });
    categories.push(elettronica);
    console.log("Categoria Elettronica creata");
  } else {
    categories.push(existingCategories[0]);
    console.log("Categoria Elettronica già esistente");
  }

  if (!existingCategories[1]) {
    const abbigliamento = await prisma.categories.create({
      data: {
        name: "Abbigliamento",
        slug: "abbigliamento",
        description: "Vestiti e accessori moda",
        workspaceId: workspace.id,
        isActive: true,
      },
    });
    categories.push(abbigliamento);
    console.log("Categoria Abbigliamento creata");
  } else {
    categories.push(existingCategories[1]);
    console.log("Categoria Abbigliamento già esistente");
  }

  console.log(`Seed completato con successo!`);
  console.log(`- Admin user creato: ${adminEmail}`);
  console.log(`- Workspace creato: ${workspace.name}`);
  console.log(`- Categorie create/esistenti: ${categories.length}`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
