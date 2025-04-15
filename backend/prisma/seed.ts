import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

let adminEmail = "admin@shopme.com" // Define a variable to store admin email

// Define the agents array at the top level of the script
const agents = [
  {
    name: "Sales Agent",
    description: "Sales agent for handling product inquiries and orders",
    isActive: true,
    isRouter: false,
    department: "Sales",
    promptName: "Default Customer Support",
  },
  {
    name: "Router",
    description:
      "Main router for directing conversations to appropriate departments",
    isActive: true,
    isRouter: true,
    promptName: "Default Customer Support",
  },
  {
    name: "Support Agent",
    description: "Customer support agent for handling issues and questions",
    isActive: true,
    isRouter: false,
    department: "Support",
    promptName: "Default Customer Support",
  },
]

// Inizializziamo createdWorkspaces qui, prima di main()
let createdWorkspaces: any[] = [];
// Definiamo un ID fisso per il nostro workspace unico
const mainWorkspaceId = "cm9hjgq9v00014qk8fsdy4ujv";

async function main() {
  // Check if the admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@shopme.com" },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        status: "ACTIVE",
      },
    })
    console.log(`Admin user creato: ${admin.email}`)
  } else {
    console.log("Admin user già esistente.")
  }

  // Check if the main workspace exists
  const existingMainWorkspace = await prisma.workspace.findUnique({
    where: { id: mainWorkspaceId },
  });

  if (existingMainWorkspace) {
    console.log(`Trovato workspace principale con ID: ${mainWorkspaceId}`);
    // Aggiorniamo il workspace con i dati richiesti, ma manteniamo lo slug originale
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: mainWorkspaceId },
      data: {
        name: "L'Altra Italia(ESP)",
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "es",
        currency: "EUR",
      },
    });
    console.log(`Workspace aggiornato: ${updatedWorkspace.name} con ID ${updatedWorkspace.id}`);
    createdWorkspaces.push(updatedWorkspace);
  } else {
    console.log(`Il workspace con ID ${mainWorkspaceId} non esiste nel database, lo creiamo`);
    // Create the workspace if it doesn't exist
    const mainWorkspace = await prisma.workspace.create({
      data: {
        id: mainWorkspaceId,
        name: "L'Altra Italia(ESP)",
        slug: "altra-italia-esp",
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "es",
        currency: "EUR",
      },
    });
    console.log(`Workspace creato: ${mainWorkspace.name} con ID ${mainWorkspace.id}`);
    createdWorkspaces.push(mainWorkspace);
  }

  // Cleanup any other workspaces (optionally delete them)
  const otherWorkspaces = await prisma.workspace.findMany({
    where: {
      id: {
        not: mainWorkspaceId
      }
    }
  });
  
  if (otherWorkspaces.length > 0) {
    console.log(`Trovati ${otherWorkspaces.length} altri workspace (non verranno utilizzati)`);
    // Non li cancelliamo per sicurezza, ma non li includiamo nelle operazioni successive
  }

  // Create food categories for each workspace
  const foodCategories = [
    {
      name: "Beverages",
      slug: "beverages",
      description:
        "Italian beverages including coffee, soft drinks, and non-alcoholic options",
    },
    {
      name: "Pasta",
      slug: "pasta",
      description:
        "Fresh and dried pasta varieties from different regions of Italy",
    },
    {
      name: "Cheese",
      slug: "cheese",
      description: "Authentic Italian cheeses, from fresh to aged varieties",
    },
    {
      name: "Vegetables",
      slug: "vegetables",
      description: "Fresh and preserved vegetables of the highest quality",
    },
    {
      name: "Condiments",
      slug: "condiments",
      description: "Oils, vinegars, and specialty Italian condiments",
    },
    {
      name: "Preserves",
      slug: "preserves",
      description:
        "Jams, marmalades, and preserved fruits made with traditional recipes",
    },
    {
      name: "Snacks",
      slug: "snacks",
      description: "Italian savory and sweet snacks perfect for any occasion",
    },
    {
      name: "Gourmet",
      slug: "gourmet",
      description: "Premium specialty products for the discerning palate",
    },
    {
      name: "Fresh Products",
      slug: "fresh-products",
      description: "Freshly made Italian foods delivered to your table",
    },
    {
      name: "Desserts",
      slug: "desserts",
      description: "Traditional Italian sweets and desserts",
    },
  ]

  // Create categories for the main workspace
  console.log(`Creating categories for workspace: ${createdWorkspaces[0].name}`)
  for (const category of foodCategories) {
    const existingCategory = await prisma.categories.findFirst({
      where: {
        slug: category.slug,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingCategory) {
      await prisma.categories.create({
        data: {
          ...category,
          isActive: true,
          workspace: {
            connect: {
              id: mainWorkspaceId,
            },
          },
        },
      })
      console.log(
        `Category created: ${category.name} for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      console.log(
        `Category already exists: ${category.name} for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Crea le lingue disponibili solo se non esistono già
  const languageCodes = ["it", "en", "es", "fr", "de"]
  const existingLanguages = await prisma.languages.findMany({
    where: {
      code: { in: languageCodes },
      workspaceId: mainWorkspaceId,
    },
  })

  const existingLanguageCodes = existingLanguages.map((lang) => lang.code)
  const languagesToCreate = languageCodes.filter(
    (code) => !existingLanguageCodes.includes(code)
  )

  const languages = [...existingLanguages]

  if (languagesToCreate.length > 0) {
    const newLanguages = await Promise.all(
      languagesToCreate.map((code) =>
        prisma.languages.create({
          data: {
            code,
            name: getLanguageName(code),
            workspace: { connect: { id: mainWorkspaceId } },
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
    where: { id: mainWorkspaceId },
    data: {
      languages: {
        connect: languages.map((lang: { id: string }) => ({ id: lang.id })),
      },
    },
  })

  // Create default prompts
  const defaultPrompts = [
    {
      name: "Default Customer Support",
      content:
        "You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent.",
      isActive: true,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: mainWorkspaceId,
    },
    {
      name: "Product Specialist",
      content:
        'You are a product specialist for the Italian food shop "L\'Altra Italia". You can answer detailed questions about our products, including ingredients, origin, traditional uses, and comparisons between different products. Your tone should be informative and authoritative. Always emphasize the quality and authenticity of our Italian offerings.',
      isActive: true,
      temperature: 0.5,
      top_p: 0.8,
      top_k: 30,
      workspaceId: mainWorkspaceId,
    },
    {
      name: "Marketing Copy Writer",
      content:
        'You are a marketing copywriter for the Italian food shop "L\'Altra Italia". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be persuasive, exciting, and highlight the key benefits of our products. Use vivid language that appeals to emotions and desires, emphasizing Italian tradition, quality, and authenticity.',
      isActive: true,
      temperature: 0.9,
      top_p: 0.95,
      top_k: 50,
      workspaceId: mainWorkspaceId,
    },
  ]

  // Ensure prompts are created for the main workspace
  for (const prompt of defaultPrompts) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: prompt.name,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingPrompt) {
      await prisma.prompts.create({
        data: {
          ...prompt,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(
        `Prompt created: ${prompt.name} for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      console.log(
        `Prompt already exists: ${prompt.name} for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Proceed to create agents for the main workspace
  for (const agent of agents) {
    const prompt = await prisma.prompts.findFirst({
      where: {
        name: agent.promptName,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!prompt) {
      console.log(
        `Prompt ${agent.promptName} not found for workspace ${createdWorkspaces[0].name}. Skipping agent creation.`
      )
      continue
    }

    const agentWithPrompt = {
      name: agent.name,
      content: prompt.content,
      isActive: agent.isActive,
      isRouter: agent.isRouter,
      department: agent.department,
      workspaceId: mainWorkspaceId,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
    }

    const existingAgent = await prisma.prompts.findFirst({
      where: {
        name: agent.name,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingAgent) {
      await prisma.prompts.create({
        data: agentWithPrompt,
      })
      console.log(
        `Agent created: ${agent.name} for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      await prisma.prompts.update({
        where: { id: existingAgent.id },
        data: agentWithPrompt,
      })
      console.log(
        `Agent updated: ${agent.name} for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Create products for the main workspace
  const products = [
    // Pasta Category
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      description:
        "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
      price: 4.99,
      stock: 120,
      image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "gragnano-igp-pasta-spaghetti",
      categoryName: "Pasta",
    },
    {
      name: "Homemade Tagliatelle",
      description:
        "Freshly made egg tagliatelle, perfect for rich meat sauces and ragù.",
      price: 6.99,
      stock: 45,
      image: "https://images.unsplash.com/photo-1598866594230-a7c12756260f?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "homemade-tagliatelle",
      categoryName: "Pasta",
    },
    // Cheese Category
    {
      name: "Parmigiano Reggiano DOP 24 months",
      description:
        "Authentic Parmigiano Reggiano DOP aged 24 months. Intense flavor with a granular texture.",
      price: 29.99,
      stock: 25,
      image: "https://www.emiliaitalianfood.com/pimages/PARMIGIANO-REGGIANO-DOP-MIN-24-MESI1-0-kg-ca-extra-big-9.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "parmigiano-reggiano-dop-24-months",
      categoryName: "Cheese",
    },
    {
      name: "Mozzarella di Bufala Campana DOP",
      description:
        "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
      price: 9.99,
      stock: 40,
      image: "https://images.unsplash.com/photo-1629497347864-552e01b48e81?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "mozzarella-di-bufala-campana-dop",
      categoryName: "Cheese",
    },
    // Oil Category (Condiments)
    {
      name: "Tuscan IGP Extra Virgin Olive Oil",
      description:
        "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
      price: 19.99,
      stock: 48,
      image: "https://images.unsplash.com/photo-1565999103945-56255e8002be?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "tuscan-igp-extra-virgin-olive-oil",
      categoryName: "Condiments",
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description:
        "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      image: "https://images.unsplash.com/photo-1632383416396-21178e94a2d0?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "aceto-balsamico-di-modena-igp",
      categoryName: "Condiments",
    },
    // Cured Meats (adding to Gourmet category)
    {
      name: "Prosciutto di Parma DOP 24 months",
      description:
        "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
      price: 24.99,
      stock: 15,
      image: "https://images.unsplash.com/photo-1647754671851-69acc25fe0f4?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "prosciutto-di-parma-dop-24-months",
      categoryName: "Gourmet",
    },
    // Vegetables
    {
      name: "San Marzano DOP Tomatoes",
      description:
        "Authentic San Marzano tomatoes grown in the volcanic soil of Mount Vesuvius. Sweet flavor with low acidity.",
      price: 6.99,
      stock: 85,
      image: "https://images.unsplash.com/photo-1594148882283-3019ea553e73?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "san-marzano-dop-tomatoes",
      categoryName: "Vegetables",
    },
    // Wine (adding to Beverages)
    {
      name: "Barolo DOCG Wine",
      description:
        "Premium Barolo DOCG wine from Piedmont, made from Nebbiolo grapes. Full-bodied with notes of roses, tar and herbs.",
      price: 49.99,
      stock: 24,
      image: "https://images.unsplash.com/photo-1568213214202-aee0a28567f1?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "barolo-docg-wine",
      categoryName: "Beverages",
    },
    // Nuts (adding to Snacks)
    {
      name: "Pistacchi di Bronte DOP",
      description:
        "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
      price: 18.99,
      stock: 35,
      image: "https://images.unsplash.com/photo-1569362568247-3a43d9ce5978?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "pistacchi-di-bronte-dop",
      categoryName: "Snacks",
    },
    // Spirits (adding to Beverages)
    {
      name: "Limoncello di Sorrento IGP",
      description:
        "Traditional lemon liqueur made with Sorrento lemons. Bright, sweet and intensely citrusy.",
      price: 22.99,
      stock: 42,
      image: "https://images.unsplash.com/photo-1592967854753-8be064e65f66?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "limoncello-di-sorrento-igp",
      categoryName: "Beverages",
    },
    // Desserts
    {
      name: "Sicilian Cannoli Kit",
      description:
        "Make authentic Sicilian cannoli at home with this kit including shells, ricotta cream, and toppings.",
      price: 16.99,
      stock: 28,
      image: "https://images.unsplash.com/photo-1613743990305-736d763f5dce?q=80&w=800&auto=format&fit=crop",
      isActive: true,
      status: "ACTIVE",
      slug: "sicilian-cannoli-kit",
      categoryName: "Desserts",
    },
  ]

  // Create services for the main workspace
  const services = [
    {
      name: "Insurance",
      description:
        "Product insurance service for your valuable items. Covers damage during shipping and handling.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
    },
    {
      name: "Shipping",
      description:
        "Premium shipping service with tracking and guaranteed delivery within 3-5 business days.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
    },
    {
      name: "Gift Package",
      description:
        "Luxury gift wrapping service with personalized message and premium packaging materials.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
    },
  ]

  // Create or update services for the main workspace
  for (const service of services) {
    const existingService = await prisma.services.findFirst({
      where: {
        name: service.name,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingService) {
      await prisma.services.create({
        data: {
          ...service,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(
        `Service created: ${service.name} for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      // Update existing service
      await prisma.services.update({
        where: { id: existingService.id },
        data: {
          ...service,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(
        `Service updated: ${service.name} for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Create or update products with their categories
  for (const product of products) {
    // Find the category by name for this workspace
    const category = await prisma.categories.findFirst({
      where: {
        name: product.categoryName,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!category) {
      console.log(
        `Category ${product.categoryName} not found for workspace ${createdWorkspaces[0].name}`
      )
      continue
    }

    // Create a product with proper type for Prisma
    try {
      const existingProduct = await prisma.products.findFirst({
        where: {
          name: product.name,
          workspaceId: mainWorkspaceId,
        },
      })

      if (!existingProduct) {
        await prisma.products.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image,
            isActive: true,
            status: "ACTIVE" as any, // Casting to any per evitare errori di tipo
            slug: `${product.slug}-${Date.now()}`, // Generiamo slug unici
            workspaceId: mainWorkspaceId,
            categoryId: category.id,
          },
        })
        console.log(
          `Product created: ${product.name} for workspace ${createdWorkspaces[0].name}`
        )
      } else {
        // Update existing product
        await prisma.products.update({
          where: { id: existingProduct.id },
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            image: product.image,
            isActive: true,
            categoryId: category.id,
          },
        })
        console.log(
          `Product updated: ${product.name} for workspace ${createdWorkspaces[0].name}`
        )
      }
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
        console.error(
          `Duplicate slug detected for product: ${product.name}. Skipping creation.`
        )
      } else {
        console.error(`Error creating/updating product ${product.name}:`, error)
      }
    }
  }

  // Create whatsapp settings for the workspace if not exists
  const existingWhatsappSettings = await prisma.whatsappSettings.findUnique({
    where: { workspaceId: mainWorkspaceId },
  });

  if (!existingWhatsappSettings) {
    await prisma.whatsappSettings.create({
      data: {
        phoneNumber: "+34654728753",
        apiKey: "dummy-api-key",
        workspaceId: mainWorkspaceId,
      },
    });
    console.log("Impostazioni WhatsApp create per il workspace principale");
  } else {
    await prisma.whatsappSettings.update({
      where: { workspaceId: mainWorkspaceId },
      data: {
        phoneNumber: "+34654728753",
        apiKey: "dummy-api-key",
      },
    });
    console.log("Impostazioni WhatsApp aggiornate per il workspace principale");
  }

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${adminEmail}`)
  console.log(`- Workspace creato/aggiornato: ${createdWorkspaces[0].name}`)
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`)
  console.log(`- Prodotti creati/aggiornati: ${products.length}`)
  console.log(`- Agents creati/aggiornati: ${agents.length}`)
  console.log(`- Services creati/aggiornati: ${services.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
