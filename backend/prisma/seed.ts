import { PrismaClient, ProductStatus } from "@prisma/client"
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

  // Check if the custom workspace exists
  const customWorkspaceId = "cm9hjgq9v00014qk8fsdy4ujv";
  const existingCustomWorkspace = await prisma.workspace.findUnique({
    where: { id: customWorkspaceId },
  });

  if (existingCustomWorkspace) {
    console.log(`Trovato workspace custom con ID: ${customWorkspaceId}`);
    // Add to the createdWorkspaces array so it gets products in the main loop
    createdWorkspaces.push(existingCustomWorkspace);
  } else {
    console.log(`Il workspace con ID ${customWorkspaceId} non esiste nel database`);
    // Opzionalmente, potresti crearlo qui
  }

  // Check if the workspaces already exist
  const workspaces = [
    {
      name: "L'Altra Italia",
      slug: "altra-italia",
      whatsappPhoneNumber: "+34654728753",
      isActive: true,
      language: "it",
      currency: "EUR",
    },
    {
      name: "L'Altra Italia(ESP)",
      slug: "altra-italia-esp",
      whatsappPhoneNumber: "+34654728753",
      isActive: true,
      language: "es",
      currency: "EUR",
    },
  ]

  for (const workspaceData of workspaces) {
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: workspaceData.slug },
    })

    if (!existingWorkspace) {
      const workspace = await prisma.workspace.create({
        data: workspaceData,
      })
      console.log(`Workspace creato: ${workspace.name}`)
      createdWorkspaces.push(workspace)
    } else {
      console.log(`Workspace già esistente: ${existingWorkspace.name}`)
      createdWorkspaces.push(existingWorkspace)
    }
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

  for (const workspace of createdWorkspaces) {
    console.log(`Creating categories for workspace: ${workspace.name}`)
    for (const category of foodCategories) {
      const existingCategory = await prisma.categories.findFirst({
        where: {
          slug: category.slug,
          workspaceId: workspace.id,
        },
      })

      if (!existingCategory) {
        await prisma.categories.create({
          data: {
            ...category,
            isActive: true,
            workspace: {
              connect: {
                id: workspace.id,
              },
            },
          },
        })
        console.log(
          `Category created: ${category.name} for workspace ${workspace.name}`
        )
      } else {
        console.log(
          `Category already exists: ${category.name} for workspace ${workspace.name}`
        )
      }
    }
  }

  // Crea le lingue disponibili solo se non esistono già
  const languageCodes = ["it", "en", "es", "fr", "de"]
  const existingLanguages = await prisma.languages.findMany({
    where: {
      code: { in: languageCodes },
      workspaceId: createdWorkspaces[0].id,
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
      name: "Default Customer Support",
      content:
        "You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent.",
      isActive: true,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: createdWorkspaces[0].id,
    },
    {
      name: "Product Specialist",
      content:
        'You are a product specialist for the Italian food shop "L\'Altra Italia". You can answer detailed questions about our products, including ingredients, origin, traditional uses, and comparisons between different products. Your tone should be informative and authoritative. Always emphasize the quality and authenticity of our Italian offerings.',
      isActive: true,
      temperature: 0.5,
      top_p: 0.8,
      top_k: 30,
      workspaceId: createdWorkspaces[0].id,
    },
    {
      name: "Marketing Copy Writer",
      content:
        'You are a marketing copywriter for the Italian food shop "L\'Altra Italia". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be persuasive, exciting, and highlight the key benefits of our products. Use vivid language that appeals to emotions and desires, emphasizing Italian tradition, quality, and authenticity.',
      isActive: true,
      temperature: 0.9,
      top_p: 0.95,
      top_k: 50,
      workspaceId: createdWorkspaces[0].id,
    },
  ]

  // Ensure prompts are created for all workspaces before creating agents
  for (const workspace of createdWorkspaces) {
    for (const prompt of defaultPrompts) {
      const existingPrompt = await prisma.prompts.findFirst({
        where: {
          name: prompt.name,
          workspaceId: workspace.id,
        },
      })

      if (!existingPrompt) {
        await prisma.prompts.create({
          data: {
            ...prompt,
            workspaceId: workspace.id,
          },
        })
        console.log(
          `Prompt created: ${prompt.name} for workspace ${workspace.name}`
        )
      } else {
        console.log(
          `Prompt already exists: ${prompt.name} for workspace ${workspace.name}`
        )
      }
    }
  }

  // Proceed to create agents after ensuring prompts exist
  for (const workspace of createdWorkspaces) {
    for (const agent of agents) {
      const prompt = await prisma.prompts.findFirst({
        where: {
          name: agent.promptName,
          workspaceId: workspace.id,
        },
      })

      if (!prompt) {
        console.log(
          `Prompt ${agent.promptName} not found for workspace ${workspace.name}. Skipping agent creation.`
        )
        continue
      }

      const agentWithPrompt = {
        name: agent.name,
        content: prompt.content,
        isActive: agent.isActive,
        isRouter: agent.isRouter,
        department: agent.department,
        workspaceId: workspace.id,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
      }

      const existingAgent = await prisma.prompts.findFirst({
        where: {
          name: agent.name,
          workspaceId: workspace.id,
        },
      })

      if (!existingAgent) {
        await prisma.prompts.create({
          data: agentWithPrompt,
        })
        console.log(
          `Agent created: ${agent.name} for workspace ${workspace.name}`
        )
      } else {
        await prisma.prompts.update({
          where: { id: existingAgent.id },
          data: agentWithPrompt,
        })
        console.log(
          `Agent updated: ${agent.name} for workspace ${workspace.name}`
        )
      }
    }
  }

  // Create products for all workspaces
  const products = [
    // Pasta Category
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      description:
        "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
      price: 4.99,
      stock: 120,
      image: "https://example.com/spaghetti.jpg",
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
      image: "https://example.com/tagliatelle.jpg",
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
      image: "https://example.com/parmigiano.jpg",
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
      image: "https://example.com/mozzarella.jpg",
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
      image: "https://example.com/olive-oil.jpg",
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
      image: "https://example.com/balsamic-vinegar.jpg",
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
      image: "https://example.com/prosciutto.jpg",
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
      image: "https://example.com/tomatoes.jpg",
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
      image: "https://example.com/barolo.jpg",
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
      image: "https://example.com/pistachios.jpg",
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
      image: "https://example.com/limoncello.jpg",
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
      image: "https://example.com/cannoli-kit.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "sicilian-cannoli-kit",
      categoryName: "Desserts",
    },
  ]

  // Create services for all workspaces
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

  for (const workspace of createdWorkspaces) {
    // Create or update services
    for (const service of services) {
      const existingService = await prisma.services.findFirst({
        where: {
          name: service.name,
          workspaceId: workspace.id,
        },
      })

      if (!existingService) {
        await prisma.services.create({
          data: {
            ...service,
            workspaceId: workspace.id,
          },
        })
        console.log(
          `Service created: ${service.name} for workspace ${workspace.name}`
        )
      } else {
        // Update existing service
        await prisma.services.update({
          where: { id: existingService.id },
          data: {
            ...service,
            workspaceId: workspace.id,
          },
        })
        console.log(
          `Service updated: ${service.name} for workspace ${workspace.name}`
        )
      }
    }

    // Create or update products with their categories
    for (const product of products) {
      // Find the category by name for this workspace
      const category = await prisma.categories.findFirst({
        where: {
          name: product.categoryName,
          workspaceId: workspace.id,
        },
      })

      if (!category) {
        console.log(
          `Category ${product.categoryName} not found for workspace ${workspace.id}`
        )
        continue
      }

      // Add category ID to the product data and ensure status is a valid enum value
      const productWithCategory = {
        categoryId: category.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        isActive: true,
        status: ProductStatus.ACTIVE,
        slug: product.slug,
        workspaceId: workspace.id,
      }

      const existingProduct = await prisma.products.findFirst({
        where: {
          slug: product.slug,
          workspaceId: workspace.id,
        },
      })

      if (!existingProduct) {
        try {
          await prisma.products.create({
            data: productWithCategory,
          })
          console.log(
            `Product created: ${product.name} for workspace ${workspace.name}`
          )
        } catch (error: any) {
          if (error.code === "P2002" && error.meta?.target?.includes("slug")) {
            console.error(
              `Duplicate slug detected for product: ${product.name} in workspace ${workspace.name}. Skipping creation.`
            )
          } else {
            throw error
          }
        }
      } else {
        // Update existing product
        await prisma.products.update({
          where: { id: existingProduct.id },
          data: productWithCategory,
        })
        console.log(
          `Product updated: ${product.name} for workspace ${workspace.name}`
        )
      }
    }
  }

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${adminEmail}`)
  console.log(
    `- Workspaces creati: ${createdWorkspaces.map((ws) => ws.name).join(", ")}`
  )
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
