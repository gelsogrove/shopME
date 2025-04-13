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

  // Create products for L'Altra Italia
  const products = [
    // Pasta Category
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      description: "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
      price: 4.99,
      stock: 120,
      image: "https://example.com/spaghetti.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "gragnano-igp-pasta-spaghetti",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Pasta"
    },
    {
      name: "Homemade Tagliatelle",
      description: "Freshly made egg tagliatelle, perfect for rich meat sauces and ragù.",
      price: 6.99,
      stock: 45,
      image: "https://example.com/tagliatelle.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "homemade-tagliatelle",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Pasta"
    },
    // Cheese Category
    {
      name: "Parmigiano Reggiano DOP 24 months",
      description: "Authentic Parmigiano Reggiano DOP aged 24 months. Intense flavor with a granular texture.",
      price: 29.99,
      stock: 25,
      image: "https://example.com/parmigiano.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "parmigiano-reggiano-dop-24-months",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Cheese"
    },
    {
      name: "Mozzarella di Bufala Campana DOP",
      description: "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
      price: 9.99,
      stock: 40,
      image: "https://example.com/mozzarella.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "mozzarella-di-bufala-campana-dop",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Cheese"
    },
    // Oil Category (Condiments)
    {
      name: "Tuscan IGP Extra Virgin Olive Oil",
      description: "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
      price: 19.99,
      stock: 48,
      image: "https://example.com/olive-oil.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "tuscan-igp-extra-virgin-olive-oil",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Condiments"
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description: "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      image: "https://example.com/balsamic-vinegar.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "aceto-balsamico-di-modena-igp",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Condiments"
    },
    // Cured Meats (adding to Gourmet category)
    {
      name: "Prosciutto di Parma DOP 24 months",
      description: "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
      price: 24.99,
      stock: 15,
      image: "https://example.com/prosciutto.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "prosciutto-di-parma-dop-24-months",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Gourmet"
    },
    // Vegetables
    {
      name: "San Marzano DOP Tomatoes",
      description: "Authentic San Marzano tomatoes grown in the volcanic soil of Mount Vesuvius. Sweet flavor with low acidity.",
      price: 6.99,
      stock: 85,
      image: "https://example.com/tomatoes.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "san-marzano-dop-tomatoes",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Vegetables"
    },
    // Wine (adding to Beverages)
    {
      name: "Barolo DOCG Wine",
      description: "Premium Barolo DOCG wine from Piedmont, made from Nebbiolo grapes. Full-bodied with notes of roses, tar and herbs.",
      price: 49.99,
      stock: 24,
      image: "https://example.com/barolo.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "barolo-docg-wine",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Beverages"
    },
    // Nuts (adding to Snacks)
    {
      name: "Pistacchi di Bronte DOP",
      description: "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
      price: 18.99,
      stock: 35,
      image: "https://example.com/pistachios.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pistacchi-di-bronte-dop",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Snacks"
    },
    // Spirits (adding to Beverages)
    {
      name: "Limoncello di Sorrento IGP",
      description: "Traditional lemon liqueur made with Sorrento lemons. Bright, sweet and intensely citrusy.",
      price: 22.99,
      stock: 42,
      image: "https://example.com/limoncello.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "limoncello-di-sorrento-igp",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Beverages"
    },
    // Desserts
    {
      name: "Sicilian Cannoli Kit",
      description: "Make authentic Sicilian cannoli at home with this kit including shells, ricotta cream, and toppings.",
      price: 16.99,
      stock: 28,
      image: "https://example.com/cannoli-kit.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "sicilian-cannoli-kit",
      workspaceId: createdWorkspaces[0].id,
      categoryName: "Desserts"
    }
  ];

  // Create agents for L'Altra Italia
  const agents = [
    {
      name: "Sales Agent",
      description: "Sales agent for handling product inquiries and orders",
      isActive: true,
      isRouter: false,
      department: "Sales",
      workspaceId: createdWorkspaces[0].id,
      promptName: "Default Customer Support"
    },
    {
      name: "Router",
      description: "Main router for directing conversations to appropriate departments",
      isActive: true,
      isRouter: true,
      workspaceId: createdWorkspaces[0].id,
      promptName: "Default Customer Support"
    },
    {
      name: "Support Agent",
      description: "Customer support agent for handling issues and questions",
      isActive: true,
      isRouter: false,
      department: "Support",
      workspaceId: createdWorkspaces[0].id,
      promptName: "Default Customer Support"
    }
  ];

  // Create or update agents
  for (const agent of agents) {
    // Fetch the related prompt by name
    const prompt = await prisma.prompts.findFirst({
      where: {
        name: agent.promptName,
        workspaceId: agent.workspaceId
      }
    });

    if (!prompt) {
      console.log(`Prompt ${agent.promptName} not found for workspace ${agent.workspaceId}`);
      continue;
    }

    const { promptName, ...agentData } = agent;
    
    // Add promptId to the agent data
    const agentWithPrompt = {
      ...agentData,
      promptId: prompt.id
    };

    const existingAgent = await prisma.prompts.findFirst({
      where: {
        name: agent.name,
        workspaceId: agent.workspaceId
      }
    });

    if (!existingAgent) {
      await prisma.prompts.create({
        data: agentWithPrompt
      });
      console.log(`Agent created: ${agent.name}`);
    } else {
      // Update existing agent
      await prisma.prompts.update({
        where: { id: existingAgent.id },
        data: agentWithPrompt
      });
      console.log(`Agent updated: ${agent.name}`);
    }
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

  // Create or update products with their categories
  for (const product of products) {
    // Find the category by name for this workspace
    const category = await prisma.categories.findFirst({
      where: {
        name: product.categoryName,
        workspaceId: product.workspaceId
      }
    });

    if (!category) {
      console.log(`Category ${product.categoryName} not found for workspace ${product.workspaceId}`);
      continue;
    }

    const { categoryName, ...productData } = product;
    
    // Add category ID to the product data and ensure status is a valid enum value
    const productWithCategory = {
      ...productData,
      categoryId: category.id
    };

    const existingProduct = await prisma.products.findFirst({
      where: {
        slug: product.slug,
        workspaceId: product.workspaceId
      }
    });

    if (!existingProduct) {
      await prisma.products.create({
        data: productWithCategory
      });
      console.log(`Product created: ${product.name}`);
    } else {
      // Update existing product
      await prisma.products.update({
        where: { id: existingProduct.id },
        data: productWithCategory
      });
      console.log(`Product updated: ${product.name}`);
    }
  }

  console.log(`Seed completato con successo!`);
  console.log(`- Admin user creato: ${adminEmail}`);
  console.log(`- Workspace creato: ${createdWorkspaces[0].name}`);
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`);
  console.log(`- Prodotti creati/aggiornati: ${products.length}`);
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
