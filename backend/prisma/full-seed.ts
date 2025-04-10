import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient()

let adminEmail = "admin@shopme.com"; // Define a variable to store admin email
let adminId;

async function main() {
  console.log("Starting full seed process...");
  
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
    console.log(`Admin user created: ${admin.email}`);
  } else {
    adminId = existingAdmin.id; // Use existing admin ID
    console.log("Admin user already exists.");
  }

  // Find the workspace with the specific ID instead of first active workspace
  console.log("Finding workspace with ID cm9912ez10000i16wgr13pvaf...");
  let workspace;
  
  const targetWorkspaceId = "cm9912ez10000i16wgr13pvaf";
  
  workspace = await prisma.workspace.findUnique({
    where: { id: targetWorkspaceId }
  });
  
  if (workspace) {
    console.log(`Using workspace: ${workspace.name} (ID: ${workspace.id})`);
  } else {
    // If workspace with specific ID doesn't exist, create it
    workspace = await prisma.workspace.create({
      data: {
        id: targetWorkspaceId,
        name: "L'Altra Italia(ESP)",
        slug: "altra-italia-esp",
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "it",
        currency: "EUR"
      },
    });
    console.log(`Created new workspace: ${workspace.name} (ID: ${workspace.id})`);
  }

  // Create available languages if they don't exist yet
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
    console.log(`New languages created: ${languagesToCreate.join(", ")}`)
  } else {
    console.log("All languages already exist")
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

  // Connect languages to workspace
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
    { name: "Beverages", slug: `beverages-${workspace.id.substring(0, 8)}`, description: "Italian beverages including coffee, soft drinks, and non-alcoholic options" },
    { name: "Pasta", slug: `pasta-${workspace.id.substring(0, 8)}`, description: "Fresh and dried pasta varieties from different regions of Italy" },
    { name: "Cheese", slug: `cheese-${workspace.id.substring(0, 8)}`, description: "Authentic Italian cheeses, from fresh to aged varieties" },
    { name: "Vegetables", slug: `vegetables-${workspace.id.substring(0, 8)}`, description: "Fresh and preserved vegetables of the highest quality" },
    { name: "Condiments", slug: `condiments-${workspace.id.substring(0, 8)}`, description: "Oils, vinegars, and specialty Italian condiments" },
    { name: "Preserves", slug: `preserves-${workspace.id.substring(0, 8)}`, description: "Jams, marmalades, and preserved fruits made with traditional recipes" },
    { name: "Snacks", slug: `snacks-${workspace.id.substring(0, 8)}`, description: "Italian savory and sweet snacks perfect for any occasion" },
    { name: "Gourmet", slug: `gourmet-${workspace.id.substring(0, 8)}`, description: "Premium specialty products for the discerning palate" },
    { name: "Fresh Products", slug: `fresh-products-${workspace.id.substring(0, 8)}`, description: "Freshly made Italian foods delivered to your table" },
    { name: "Desserts", slug: `desserts-${workspace.id.substring(0, 8)}`, description: "Traditional Italian sweets and desserts" }
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
      isActive: true,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      workspaceId: workspace.id
    },
    {
      name: 'Product Specialist',
      content: 'You are a product specialist for the Italian food shop "L\'Altra Italia". You can answer detailed questions about our products, including ingredients, origin, traditional uses, and comparisons between different products. Your tone should be informative and authoritative. Always emphasize the quality and authenticity of our Italian offerings.',
      isActive: false,
      temperature: 0.5,
      top_p: 0.8,
      top_k: 30,
      workspaceId: workspace.id
    },
    {
      name: 'Marketing Copy Writer',
      content: 'You are a marketing copywriter for the Italian food shop "L\'Altra Italia". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be persuasive, exciting, and highlight the key benefits of our products. Use vivid language that appeals to emotions and desires, emphasizing Italian tradition, quality, and authenticity.',
      isActive: false,
      temperature: 0.9,
      top_p: 0.95,
      top_k: 50,
      workspaceId: workspace.id
    }
  ];

  // Create Italian products
  const italianProducts = [
    {
      name: "Parmigiano Reggiano DOP 24 months",
      description: "Authentic Parmigiano Reggiano DOP aged for 24 months. Rich, nutty flavor with a crystalline texture.",
      price: 29.99,
      stock: 25,
      slug: `parmigiano-reggiano-dop-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `cheese-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      description: "Traditional bronze-extruded Gragnano IGP pasta from Naples. Perfect rough texture to hold sauce.",
      price: 4.99,
      stock: 120,
      slug: `gragnano-igp-spaghetti-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `pasta-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Tuscan IGP Extra Virgin Olive Oil",
      description: "Premium cold-pressed extra virgin olive oil from Tuscany IGP. Fruity with a peppery finish.",
      price: 19.99,
      stock: 48,
      slug: `tuscan-igp-olive-oil-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `condiments-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Prosciutto di Parma DOP 24 months",
      description: "Aged for 24 months, this Prosciutto di Parma DOP is sweet, delicate and melts in your mouth.",
      price: 24.99,
      stock: 15,
      slug: `prosciutto-di-parma-dop-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `fresh-products-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description: "Traditional balsamic vinegar from Modena with IGP certification. Perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      slug: `aceto-balsamico-modena-igp-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `condiments-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Mozzarella di Bufala Campana DOP",
      description: "Fresh buffalo milk mozzarella from Campania region with DOP certification. Soft, milky flavor.",
      price: 9.99,
      stock: 40,
      slug: `mozzarella-di-bufala-dop-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `cheese-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "San Marzano DOP Tomatoes",
      description: "Authentic San Marzano tomatoes with DOP certification. Sweet, low-acid tomatoes ideal for sauce.",
      price: 6.99,
      stock: 85,
      slug: `san-marzano-dop-tomatoes-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `vegetables-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Barolo DOCG Wine",
      description: "Premium Barolo DOCG red wine from Piedmont. Full-bodied with notes of cherries, plums, and spices.",
      price: 49.99,
      stock: 24,
      slug: `barolo-docg-wine-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `beverages-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Pistacchi di Bronte DOP",
      description: "Vibrant green pistachios from Bronte, Sicily with DOP certification. Intense flavor and aroma.",
      price: 18.99,
      stock: 35,
      slug: `pistacchi-di-bronte-dop-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `snacks-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Limoncello di Sorrento IGP",
      description: "Traditional lemon liqueur made with Sorrento IGP lemons. Sweet, tangy and refreshing.",
      price: 22.99,
      stock: 42,
      slug: `limoncello-di-sorrento-igp-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `beverages-${workspace.id.substring(0, 8)}`)?.id
    }
  ];

  // Add additional products for the new categories
  const additionalProducts = [
    {
      name: "Cannoli Siciliani Kit",
      description: "Make authentic Sicilian cannoli at home with this kit including shells and filling.",
      price: 24.99,
      stock: 30,
      slug: `cannoli-siciliani-kit-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `desserts-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "White Truffle Risotto",
      description: "Premium risotto with white truffle. A true gourmet experience from Northern Italy.",
      price: 19.99,
      stock: 15,
      slug: `white-truffle-risotto-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `gourmet-${workspace.id.substring(0, 8)}`)?.id
    },
    {
      name: "Artisanal Breadsticks",
      description: "Handmade Italian breadsticks perfect for appetizers or with wine.",
      price: 5.99,
      stock: 50,
      slug: `artisanal-breadsticks-${workspace.id.substring(0, 8)}`,
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === `snacks-${workspace.id.substring(0, 8)}`)?.id
    }
  ];

  // Combine all products
  const allProducts = [...italianProducts, ...additionalProducts];

  // Check for existing products and create new ones
  console.log("Creating Italian products...");
  for (const product of allProducts) {
    const existingProduct = await prisma.products.findFirst({
      where: { 
        slug: product.slug,
        workspaceId: workspace.id
      }
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

  // Create services
  console.log("Creating services...");
  
  // Define services
  const services = [
    {
      name: "Insurance",
      description: "Product insurance service for your valuable items. Covers damage during shipping and handling.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Shipping",
      description: "Premium shipping service with tracking and guaranteed delivery within 3-5 business days.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Gift Package",
      description: "Luxury gift wrapping service with personalized message and premium packaging materials.",
      price: 30.0,
      currency: "EUR",
      isActive: true,
      workspaceId: workspace.id
    }
  ];
  
  // Create or update services
  for (const service of services) {
    const existingService = await prisma.services.findFirst({
      where: {
        name: service.name,
        workspaceId: workspace.id
      }
    });

    if (existingService) {
      // Update existing service
      await prisma.services.update({
        where: { id: existingService.id },
        data: service
      });
      console.log(`Service updated: ${service.name}`);
    } else {
      // Create new service
      await prisma.services.create({
        data: service
      });
      console.log(`Service created: ${service.name}`);
    }
  }

  // Create prompts
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

  console.log(`Seed completed successfully!`);
  console.log(`- Admin user: ${adminEmail}`);
  console.log(`- Workspace: ${workspace.name} (ID: ${workspace.id})`);
  console.log(`- Categories created/existing: ${categories.length}`);
  console.log(`- Products created/existing: ${allProducts.length}`);
  console.log(`- Services created/existing: ${services.length}`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 