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
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "it",
        currency: "EUR"
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
  console.log("Checking for existing categories...");
  
  // Create food categories as requested
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

  const categories = [];
  console.log("Creating food categories...");
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
          workspaceId: workspace.id
        }
      });
      categories.push(newCategory);
      console.log(`Category created: ${category.name}`);
    } else {
      categories.push(existingCategory);
      console.log(`Category already exists: ${category.name}`);
    }
  }

  // Create default prompts
  const defaultPrompts = [
    {
      name: 'Default Customer Support',
      content: 'You are a helpful customer service assistant for our online shop "L\'Altra Italia". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don\'t know the answer, say so and offer to connect them with a human agent.',
      isRouter: true,
      department: null,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Product Specialist',
      content: 'You are a product specialist for the Italian food shop "L\'Altra Italia". You can answer detailed questions about our products, including ingredients, origin, traditional uses, and comparisons between different products. Your tone should be informative and authoritative. Always emphasize the quality and authenticity of our Italian offerings.',
      isRouter: false,
      department: 'PRODUCTS',
      temperature: 0.5,
      top_p: 0.8,
      top_k: 30,
      workspaceId: workspace.id
    },
    {
      name: 'Marketing Copy Writer',
      content: 'You are a marketing copywriter for the Italian food shop "L\'Altra Italia". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be persuasive, exciting, and highlight the key benefits of our products. Use vivid language that appeals to emotions and desires, emphasizing Italian tradition, quality, and authenticity.',
      isRouter: false,
      department: 'MARKETING',
      temperature: 0.9,
      top_p: 0.95,
      top_k: 50,
      workspaceId: workspace.id
    },
    {
      name: 'Router Agent',
      content: 'You are a router agent for our online shop "L\'Altra Italia". Your role is to analyze customer requests and route them to the most appropriate specialized agent. You should identify the main intent of the customer and direct them to: ORDERS for order-related queries, PRODUCTS for product information, TRANSPORT for shipping and delivery, INVOICES for billing and payment issues, GENERIC for general information, or FOOD CONSULTANT for specialized food advice.',
      isRouter: true,
      department: null,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Orders Agent',
      content: 'You are a specialized agent for handling ORDER-related queries for "L\'Altra Italia". You can help customers check order status, modify or cancel orders, and resolve issues with their purchases. You have detailed knowledge of the ordering process and can assist with any questions about orders.',
      isRouter: false,
      department: 'ORDERS',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Products Agent',
      content: 'You are a specialized agent for PRODUCTS information at "L\'Altra Italia". You have detailed knowledge about all our Italian products, including ingredients, origin, traditional uses, and comparisons between different products. You can help customers find the perfect Italian products for their needs.',
      isRouter: false,
      department: 'PRODUCTS',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Transport Agent',
      content: 'You are a specialized agent for TRANSPORT and shipping at "L\'Altra Italia". You can answer questions about delivery times, shipping costs, tracking packages, international shipping options, and handling shipping issues or delays.',
      isRouter: false,
      department: 'TRANSPORT',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Invoices Agent',
      content: 'You are a specialized agent for INVOICES and billing at "L\'Altra Italia". You can help customers with invoice requests, payment issues, refunds, and any financial questions related to their purchases.',
      isRouter: false,
      department: 'INVOICES',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Generic Support Agent',
      content: 'You are a GENERIC customer service agent for "L\'Altra Italia". You can answer general questions about the shop, provide information about opening hours, contact details, company policies, and handle any requests that don\'t fit into the specialized categories.',
      isRouter: false,
      department: 'GENERIC',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Food Consultant Agent',
      content: 'You are a specialized FOOD CONSULTANT for "L\'Altra Italia". You have expert knowledge on Italian cuisine, cooking methods, food pairing, and can provide personalized recommendations based on customers\' tastes, dietary needs, or special occasions. You can help customers discover authentic Italian flavors and cooking traditions.',
      isRouter: false,
      department: 'FOOD CONSULTANT',
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    }
  ];

  // Check for existing prompts
  console.log("Creating default prompts...");
  
  // Create Italian products
  const italianProducts = [
    {
      name: "Parmigiano Reggiano DOP 24 months",
      description: "Authentic Parmigiano Reggiano DOP aged for 24 months. Rich, nutty flavor with a crystalline texture.",
      price: 29.99,
      stock: 25,
      slug: "parmigiano-reggiano-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "cheese")?.id
    },
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      description: "Traditional bronze-extruded Gragnano IGP pasta from Naples. Perfect rough texture to hold sauce.",
      price: 4.99,
      stock: 120,
      slug: "gragnano-igp-spaghetti",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "pasta")?.id
    },
    {
      name: "Tuscan IGP Extra Virgin Olive Oil",
      description: "Premium cold-pressed extra virgin olive oil from Tuscany IGP. Fruity with a peppery finish.",
      price: 19.99,
      stock: 48,
      slug: "tuscan-igp-olive-oil",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "condiments")?.id
    },
    {
      name: "Prosciutto di Parma DOP 24 months",
      description: "Aged for 24 months, this Prosciutto di Parma DOP is sweet, delicate and melts in your mouth.",
      price: 24.99,
      stock: 15,
      slug: "prosciutto-di-parma-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "fresh-products")?.id
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description: "Traditional balsamic vinegar from Modena with IGP certification. Perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      slug: "aceto-balsamico-modena-igp",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "condiments")?.id
    },
    {
      name: "Mozzarella di Bufala Campana DOP",
      description: "Fresh buffalo milk mozzarella from Campania region with DOP certification. Soft, milky flavor.",
      price: 9.99,
      stock: 40,
      slug: "mozzarella-di-bufala-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "cheese")?.id
    },
    {
      name: "San Marzano DOP Tomatoes",
      description: "Authentic San Marzano tomatoes with DOP certification. Sweet, low-acid tomatoes ideal for sauce.",
      price: 6.99,
      stock: 85,
      slug: "san-marzano-dop-tomatoes",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "vegetables")?.id
    },
    {
      name: "Barolo DOCG Wine",
      description: "Premium Barolo DOCG red wine from Piedmont. Full-bodied with notes of cherries, plums, and spices.",
      price: 49.99,
      stock: 24,
      slug: "barolo-docg-wine",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "beverages")?.id
    },
    {
      name: "Pistacchi di Bronte DOP",
      description: "Vibrant green pistachios from Bronte, Sicily with DOP certification. Intense flavor and aroma.",
      price: 18.99,
      stock: 35,
      slug: "pistacchi-di-bronte-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "snacks")?.id
    },
    {
      name: "Limoncello di Sorrento IGP",
      description: "Traditional lemon liqueur made with Sorrento IGP lemons. Sweet, tangy and refreshing.",
      price: 22.99,
      stock: 42,
      slug: "limoncello-di-sorrento-igp",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "beverages")?.id
    }
  ];

  // Add additional products for the new categories
  const additionalProducts = [
    {
      name: "Cannoli Siciliani Kit",
      description: "Make authentic Sicilian cannoli at home with this kit including shells and filling.",
      price: 24.99,
      stock: 30,
      slug: "cannoli-siciliani-kit",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "desserts")?.id
    },
    {
      name: "White Truffle Risotto",
      description: "Premium risotto with white truffle. A true gourmet experience from Northern Italy.",
      price: 19.99,
      stock: 15,
      slug: "white-truffle-risotto",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "gourmet")?.id
    },
    {
      name: "Artisanal Breadsticks",
      description: "Handmade Italian breadsticks perfect for appetizers or with wine.",
      price: 5.99,
      stock: 50,
      slug: "artisanal-breadsticks",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "snacks")?.id
    }
  ];

  // Combine all products
  const allProducts = [...italianProducts, ...additionalProducts];

  // Check for existing products and create new ones
  console.log("Creating Italian products...");
  for (const product of allProducts) {
    const existingProduct = await prisma.products.findUnique({
      where: { slug: product.slug }
    });

    if (!existingProduct) {
      await prisma.products.create({
        data: product
      });
      console.log(`Product created: ${product.name}`);
    } else {
      console.log(`Product already exists: ${product.name}`);
    }
  }

  for (const prompt of defaultPrompts) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: prompt.name,
        workspaceId: workspace.id
      }
    });

    if (!existingPrompt) {
      await prisma.prompts.create({
        data: prompt
      });
      console.log(`Prompt created: ${prompt.name}`);
    } else {
      console.log(`Prompt already exists: ${prompt.name}`);
    }
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
