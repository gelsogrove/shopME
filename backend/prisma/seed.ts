import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient()

let adminEmail = "admin@shopme.com"; // Define a variable to store admin email

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
    console.log(`Admin user creato: ${admin.email}`);
  } else {
    console.log("Admin user già esistente.");
  }

  // Check if the workspaces already exist
  const workspaces = [
    {
      name: "L'Altra Italia",
      slug: "altra-italia",
      whatsappPhoneNumber: "+34654728753",
      isActive: true,
      language: "it",
      currency: "EUR"
    },
    {
      name: "L'Altra Italia(ESP)",
      slug: "altra-italia-esp",
      whatsappPhoneNumber: "+34654728753",
      isActive: true,
      language: "es",
      currency: "EUR"
    }
  ];

  let createdWorkspaces = [];
  
  for (const workspaceData of workspaces) {
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: workspaceData.slug },
    });

    if (!existingWorkspace) {
      const workspace = await prisma.workspace.create({
        data: workspaceData,
      });
      console.log(`Workspace creato: ${workspace.name}`);
      createdWorkspaces.push(workspace);
    } else {
      console.log(`Workspace già esistente: ${existingWorkspace.name}`);
      createdWorkspaces.push(existingWorkspace);
    }
  }

  // Create food categories for each workspace
  const foodCategories = [
    { name: "Beverages", slug: "beverages", description: "Italian beverages including coffee, soft drinks, and non-alcoholic options" },
    { name: "Pasta", slug: "pasta", description: "Fresh and dried pasta varieties from different regions of Italy" },
    { name: "Cheese", slug: "cheese", description: "Authentic Italian cheeses, from fresh to aged varieties" },
    { name: "Vegetables", slug: "vegetables", description: "Fresh and preserved vegetables of the highest quality" },
    { name: "Condiments", slug: "condiments", description: "Oils, vinegars, and specialty Italian condiments" },
    { name: "Preserves", slug: "preserves", description: "Jams, marmalades, and preserved fruits made with traditional recipes" },
    { name: "Snacks", slug: "snacks", description: "Italian savory and sweet snacks perfect for any occasion" },
    { name: "Gourmet", slug: "gourmet", description: "Premium specialty products for the discerning palate" },
    { name: "Fresh Products", slug: "fresh-products", description: "Freshly made Italian foods delivered to your table" },
    { name: "Desserts", slug: "desserts", description: "Traditional Italian sweets and desserts" }
  ];

  for (const workspace of createdWorkspaces) {
    console.log(`Creating categories for workspace: ${workspace.name}`);
    for (const category of foodCategories) {
      const existingCategory = await prisma.categories.findFirst({
        where: { 
          slug: category.slug,
          workspaceId: workspace.id
        }
      });

      if (!existingCategory) {
        const newCategory = await prisma.categories.create({
          data: {
            ...category,
            isActive: true,
            workspace: {
              connect: {
                id: workspace.id
              }
            }
          }
        });
        console.log(`Category created: ${category.name} for workspace ${workspace.name}`);
      } else {
        console.log(`Category already exists: ${category.name} for workspace ${workspace.name}`);
      }
    }
  }

  // Crea le lingue disponibili solo se non esistono già
  const languageCodes = ["it", "en", "es", "fr", "de"]
  const existingLanguages = await prisma.languages.findMany({
    where: {
      code: { in: languageCodes },
      workspaceId: createdWorkspaces[0].id
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
            workspace: { connect: { id: createdWorkspaces[0].id } },
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
    }
    return names[code] || code
  }

  // Connetti le lingue al workspace
  await prisma.workspace.update({
    where: { id: createdWorkspaces[0].id },
    data: {
      languages: {
        connect: languages.map((lang: { id: string }) => ({ id: lang.id })),
      },
    },
  })

  // Create default prompts
  const defaultPrompts = [
    {
      name: 'Default Customer Support',
      content: 'You are a helpful customer service assistant for our online shop "L\'Altra Italia". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don\'t know the answer, say so and offer to connect them with a human agent.',
      isActive: true,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: createdWorkspaces[0].id
    },
    {
      name: 'Product Specialist',
      content: 'You are a product specialist for the Italian food shop "L\'Altra Italia". You can answer detailed questions about our products, including ingredients, origin, traditional uses, and comparisons between different products. Your tone should be informative and authoritative. Always emphasize the quality and authenticity of our Italian offerings.',
      isActive: true,
      temperature: 0.5,
      top_p: 0.8,
      top_k: 30,
      workspaceId: createdWorkspaces[0].id
    },
    {
      name: 'Marketing Copy Writer',
      content: 'You are a marketing copywriter for the Italian food shop "L\'Altra Italia". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be persuasive, exciting, and highlight the key benefits of our products. Use vivid language that appeals to emotions and desires, emphasizing Italian tradition, quality, and authenticity.',
      isActive: true,
      temperature: 0.9,
      top_p: 0.95,
      top_k: 50,
      workspaceId: createdWorkspaces[0].id
    }
  ];

  // Create prompts
  for (const prompt of defaultPrompts) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: prompt.name,
        workspaceId: createdWorkspaces[0].id
      }
    });

    if (!existingPrompt) {
      await prisma.prompts.create({
        data: prompt
      });
      console.log(`Created prompt: ${prompt.name}`);
    } else {
      console.log(`Prompt already exists: ${prompt.name}`);
    }
  }

  // Create agents for L'Altra Italia
  const agents = [
    // ... existing agents code ...
  ];

  // Create or update agents
  for (const agent of agents) {
    // ... existing code ...
  }

  // Create services for L'Altra Italia
  const services = [
    {
      name: "Insurance",
      description: "Product insurance service for your valuable items. Covers damage during shipping and handling.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: createdWorkspaces[0].id
    },
    {
      name: "Shipping",
      description: "Premium shipping service with tracking and guaranteed delivery within 3-5 business days.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: createdWorkspaces[0].id
    },
    {
      name: "Gift Package",
      description: "Luxury gift wrapping service with personalized message and premium packaging materials.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: createdWorkspaces[0].id
    }
  ];
  
  // Create or update services
  for (const service of services) {
    const existingService = await prisma.services.findFirst({
      where: {
        name: service.name,
        workspaceId: service.workspaceId
      }
    });

    if (!existingService) {
      await prisma.services.create({
        data: service
      });
      console.log(`Service created: ${service.name}`);
    } else {
      // Update existing service
      await prisma.services.update({
        where: { id: existingService.id },
        data: service
      });
      console.log(`Service updated: ${service.name}`);
    }
  }

  console.log(`Seed completato con successo!`);
  console.log(`- Admin user creato: ${adminEmail}`);
  console.log(`- Workspace creato: ${createdWorkspaces[0].name}`);
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`);
  console.log(`- Agents creati/aggiornati: ${agents.length}`);
  console.log(`- Services creati/aggiornati: ${services.length}`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
