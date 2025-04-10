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
  console.log("Checking for existing categories...");
  
  // Create Italian food categories
  const foodCategories = [
    { name: "Pasta", slug: "pasta", description: "Pasta fresca e secca di alta qualità" },
    { name: "Preserves", slug: "preserves", description: "Conserve, sottoli e marmellate artigianali" },
    { name: "Flour", slug: "flour", description: "Farine di grano e altri cereali" },
    { name: "Wines", slug: "wines", description: "Vini italiani di diverse regioni" },
    { name: "Oil", slug: "oil", description: "Oli d'oliva extravergine e aromatizzati" },
    { name: "Cheese", slug: "cheese", description: "Formaggi italiani freschi e stagionati" },
    { name: "Cured Meats", slug: "cured-meats", description: "Salumi e affettati della tradizione italiana" }
  ];

  const categories = [];
  console.log("Creating food categories...");
  for (const category of foodCategories) {
    const existingCategory = await prisma.categories.findUnique({
      where: { slug: category.slug }
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
      categoryId: categories.find(c => c.slug === "oil")?.id
    },
    {
      name: "Prosciutto di Parma DOP 24 months",
      description: "Aged for 24 months, this Prosciutto di Parma DOP is sweet, delicate and melts in your mouth.",
      price: 24.99,
      stock: 15,
      slug: "prosciutto-di-parma-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "cured-meats")?.id
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description: "Traditional balsamic vinegar from Modena with IGP certification. Perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      slug: "aceto-balsamico-modena-igp",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: null
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
      categoryId: null
    },
    {
      name: "Barolo DOCG Wine",
      description: "Premium Barolo DOCG red wine from Piedmont. Full-bodied with notes of cherries, plums, and spices.",
      price: 49.99,
      stock: 24,
      slug: "barolo-docg-wine",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: categories.find(c => c.slug === "wines")?.id
    },
    {
      name: "Pistacchi di Bronte DOP",
      description: "Vibrant green pistachios from Bronte, Sicily with DOP certification. Intense flavor and aroma.",
      price: 18.99,
      stock: 35,
      slug: "pistacchi-di-bronte-dop",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: null
    },
    {
      name: "Limoncello di Sorrento IGP",
      description: "Traditional lemon liqueur made with Sorrento IGP lemons. Sweet, tangy and refreshing.",
      price: 22.99,
      stock: 42,
      slug: "limoncello-di-sorrento-igp",
      isActive: true,
      workspaceId: workspace.id,
      categoryId: null
    }
  ];

  // Create missing categories for products
  const additionalCategories = [
    { name: "Condiments", slug: "condiments", description: "Condimenti, aceti e spezie" },
    { name: "Vegetables", slug: "vegetables", description: "Verdure fresche e conservate" },
    { name: "Wine", slug: "wine", description: "Vini italiani di diverse regioni" },
    { name: "Nuts", slug: "nuts", description: "Frutta secca e noci" },
    { name: "Spirits", slug: "spirits", description: "Liquori e distillati italiani" }
  ];

  console.log("Creating additional categories...");
  for (const category of additionalCategories) {
    const existingCategory = await prisma.categories.findUnique({
      where: { slug: category.slug }
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
      console.log(`Additional category created: ${category.name}`);
    } else {
      categories.push(existingCategory);
      console.log(`Additional category already exists: ${category.name}`);
    }
  }

  // Assign categories to products that didn't have them
  italianProducts[4].categoryId = categories.find(c => c.slug === "condiments")?.id; // Aceto Balsamico
  italianProducts[6].categoryId = categories.find(c => c.slug === "vegetables")?.id; // San Marzano Tomatoes
  italianProducts[8].categoryId = categories.find(c => c.slug === "nuts")?.id; // Pistacchi
  italianProducts[9].categoryId = categories.find(c => c.slug === "spirits")?.id; // Limoncello

  // Check for existing products and create new ones
  console.log("Creating Italian products...");
  for (const product of italianProducts) {
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
