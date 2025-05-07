import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient()

let adminEmail = "admin@shopme.com" // Define a variable to store admin email

// Define the agents array at the top level of the script
const agents = [
  {
    name: "ROUTER",
    description: "Main router for directing conversations to appropriate departments",
    isActive: true,
    isRouter: true,
    department: "ROUTER",
    promptName: "Router Prompt",
  },
  {
    name: "GENERIC",
    description: "Generic customer service assistant",
    isActive: true,
    isRouter: false,
    department: "Markering",
    promptName: "Generic Prompt",
  },
  {
    name: "PRODUCTS AND CARTS",
    description: "Product specialist for handling product inquiries and cart management",
    isActive: true,
    isRouter: false,
    department: "Logistic",
    promptName: "Product Prompt",
  },
  {
    name: "ORDERS AND INVOICES",
    description: "Invoicing and orders specialist",
    isActive: true,
    isRouter: false,
    department: "Accounts",
    promptName: "Orders Prompt",
  },
  {
    name: "TRANSPORT",
    description: "Transportation and logistics specialist",
    isActive: true,
    isRouter: false,
    department: "Logistic",
    promptName: "Transport Prompt",
  },
  {
    name: "SERVICES",
    description: "Additional services specialist",
    isActive: true,
    isRouter: false,
    department: "Logistic",
    promptName: "Services Prompt",
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
    
    // PULIZIA COMPLETA: Elimina tutti i dati del workspace principale
    console.log("Pulizia COMPLETA: eliminazione di tutti i dati del workspace...");
    
    // 1. Prima eliminiamo gli elementi con dipendenze
    // Elimina tutti gli ordini e gli items
    await prisma.orderItems.deleteMany({
      where: {
        order: {
          workspaceId: mainWorkspaceId
        }
      }
    });
    await prisma.paymentDetails.deleteMany({
      where: {
        order: {
          workspaceId: mainWorkspaceId
        }
      }
    });
    await prisma.orders.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    
    // Elimina tutti i carrelli e items
    await prisma.cartItems.deleteMany({
      where: {
        cart: {
          workspaceId: mainWorkspaceId
        }
      }
    });
    await prisma.carts.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    
    // Elimina tutte le chat e messaggi
    await prisma.message.deleteMany({
      where: {
        chatSession: {
          workspaceId: mainWorkspaceId
        }
      }
    });
    await prisma.chatSession.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    
    // 2. Poi eliminiamo le entità principali
    // Elimina tutti i prodotti
    await prisma.products.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    console.log("Eliminati tutti i prodotti dal workspace principale");
    
    // Elimina tutti i clienti
    await prisma.customers.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    console.log("Eliminati tutti i clienti dal workspace principale");
    
    // Elimina tutte le categorie
    await prisma.categories.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    console.log("Eliminate tutte le categorie dal workspace principale");
    
    // Elimina tutti i servizi
    await prisma.services.deleteMany({
      where: {
        workspaceId: mainWorkspaceId
      }
    });
    console.log("Eliminati tutti i servizi dal workspace principale");
    
    // Elimina tutti i prompt e agenti
    const deletedPrompts = await prisma.prompts.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    });
    console.log(`Eliminati ${deletedPrompts.count} prompt dal workspace principale`);
    
    // Aggiorniamo il workspace con i dati richiesti, ma manteniamo lo slug originale
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: mainWorkspaceId },
      data: {
        name: "L'Altra Italia(ESP)",
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "es",
        currency: "EUR",
        url: "http://localhost:3000",
        wipMessage: "L'Altra Italia está en mantenimiento. Por favor, intente más tarde.",
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
        url: "http://localhost:3000",
        wipMessage: "L'Altra Italia está en mantenimiento. Por favor, intente más tarde.",
        welcomeMessages: {
          it: "Benvenuto a L'Altra Italia! 👋 Sono il tuo assistente virtuale e sono qui per aiutarti con qualsiasi informazione sui nostri prodotti e servizi. Come posso assisterti oggi? 😊",
          en: "Welcome to L'Altra Italia! 👋 I'm your virtual assistant and I'm here to help you with any information about our products and services. How can I assist you today? 😊",
          es: "¡Bienvenido a L'Altra Italia! 👋 Soy tu asistente virtual y estoy aquí para ayudarte con cualquier información sobre nuestros productos y servicios. ¿Cómo puedo ayudarte hoy? 😊"
        }
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

  // Create combined food categories (from both files)
  const foodCategories = [
    // Categorie dal seed.ts originale
    {
      name: "Beverages",
      slug: "beverages",
      description: "Italian beverages including coffee, soft drinks, and non-alcoholic options",
    },
    {
      name: "Pasta",
      slug: "pasta",
      description: "Fresh and dried pasta varieties from different regions of Italy",
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
      description: "Jams, marmalades, and preserved fruits made with traditional recipes",
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
    // Categorie aggiunte dal seed.js.old
    {
      name: "Pizza e Pasta",
      slug: "pizza-e-pasta",
      description: "Pizze artigianali e pasta fresca della tradizione italiana",
    },
    {
      name: "Antipasti",
      slug: "antipasti",
      description: "Antipasti tradizionali italiani",
    },
    {
      name: "Piatti Pronti",
      slug: "piatti-pronti",
      description: "Piatti pronti da riscaldare e servire",
    },
    {
      name: "Salumi",
      slug: "salumi",
      description: "Salumi e affettati tipici italiani",
    },
    {
      name: "Pesce",
      slug: "pesce",
      description: "Specialità di pesce della tradizione italiana",
    },
    {
      name: "Salse",
      slug: "salse",
      description: "Salse e condimenti italiani",
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
  
  // Helper function to get language names
  function getLanguageName(code: string): string {
    const names: { [key: string]: string } = {
      it: "Italiano",
      en: "English",
      es: "Español",
      fr: "Français",
      de: "Deutsch",
    }
    return names[code] || code
  }

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

  // Connetti le lingue al workspace
  await prisma.workspace.update({
    where: { id: mainWorkspaceId },
    data: {
      languages: {
        connect: languages.map((lang: { id: string }) => ({ id: lang.id })),
      },
    },
  })

  // Create prompts for all agents
  console.log("Creating prompts for all agents...")
  for (const agent of agents) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: agent.promptName,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingPrompt) {
      let promptContent = '';
      let promptFilePath = '';
      
      // Use specific prompt files based on agent name
      switch (agent.name) {
        case "GENERIC":
          promptFilePath = path.join(__dirname, 'prompts/gdpr.md');
          break;
        case "PRODUCTS AND CARTS":
          promptFilePath = path.join(__dirname, 'prompts/product-and.carts.md');
          break;
        case "ORDERS AND INVOICES":
          promptFilePath = path.join(__dirname, 'prompts/orders-and-invoice.md');
          break;
        case "TRANSPORT":
          promptFilePath = path.join(__dirname, 'prompts/transport.md');
          break;
        case "SERVICES":
          promptFilePath = path.join(__dirname, 'prompts/services.md');
          break;
        default:
          promptFilePath = path.join(__dirname, 'prompts/gdpr.md');
      }
      
      try {
        promptContent = fs.readFileSync(promptFilePath, 'utf8');
        console.log(`Using specific content from ${path.basename(promptFilePath)} for ${agent.name} agent`);
      } catch (error) {
        console.error(`Error reading ${path.basename(promptFilePath)} file: ${error}`);
        // Fallback to GDPR.md if specific file doesn't exist or can't be read
        try {
          promptContent = fs.readFileSync(path.join(__dirname, 'prompts/gdpr.md'), 'utf8');
          console.log(`Using fallback GDPR.md content for ${agent.name} agent`);
        } catch (fallbackError) {
          console.error(`Error reading fallback GDPR.md file: ${fallbackError}`);
          promptContent = 'Default prompt content. Please update with proper instructions.';
        }
      }
      
      await prisma.prompts.create({
        data: {
          name: agent.promptName,
          content: promptContent,
          isActive: agent.isActive,
          isRouter: agent.isRouter,
          department: agent.department,
          temperature: 0.3,
          top_p: 0.8,
          top_k: 30,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(
        `Prompt created: ${agent.promptName} for agent ${agent.name} for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      console.log(
        `Prompt already exists: ${agent.promptName} for agent ${agent.name} for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Create combined products list (from both files)
  const products = [
    // Prodotti dal seed.ts originale
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
      image: "https://www.eliasseleccio.com/foto/902/bufala.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "mozzarella-di-bufala-campana-dop",
      categoryName: "Cheese",
    },
    {
      name: "Tuscan IGP Extra Virgin Olive Oil",
      description:
        "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
      price: 19.99,
      stock: 48,
      image: "https://www.menu.it//media/prodotti/olio-extravergine-di-oliva-119597/conversions/EK5-main.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "tuscan-igp-extra-virgin-olive-oil",
      categoryName: "Beverages",
    },
    {
      name: "Aceto Balsamico di Modena IGP",
      description:
        "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
      price: 14.99,
      stock: 30,
      image: "https://www.gustorotondo.it/wp-content/uploads/2018/08/aceto-balsamico-di-modena.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "aceto-balsamico-di-modena-igp",
      categoryName: "Condiments",
    },
    {
      name: "Prosciutto di Parma DOP 24 months",
      description:
        "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
      price: 24.99,
      stock: 15,
      image: "https://grancaffelaquila.com/cdn/shop/products/PROSCIUTTODIPARMA_648x.jpg?v=1595543925",
      isActive: true,
      status: "ACTIVE",
      slug: "prosciutto-di-parma-dop-24-months",
      categoryName: "Gourmet",
    },
   
   
    {
      name: "Pistacchi di Bronte DOP",
      description:
        "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
      price: 18.99,
      stock: 35,
      image: "https://www.qualivita.it/wp-content/uploads/2020/04/Galleria_Pistacchio-Verde-di-Bronte_13.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pistacchi-di-bronte-dop",
      categoryName: "Antipasti",
    },
  
    
    
    // Prodotti aggiunti dal seed.js.old
    {
      name: "Pizza Napoletana Artigianale",
      description: "Autentica pizza napoletana con impasto a lunga lievitazione (24h), pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 485°C per 60-90 secondi secondo la tradizione. Certificata Specialità Tradizionale Garantita (STG).",
      price: 12.90,
      stock: 25,
      image: "https://www.lapassionefalochef.it/wp-content/uploads/2024/05/pizza-in-padella.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pizza-napoletana-artigianale",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Tagliatelle al Ragù Bolognese",
      description: "Autentica pasta all'uovo tagliata a mano (8mm di larghezza) secondo la ricetta depositata alla Camera di Commercio di Bologna. Accompagnata dal tradizionale ragù bolognese preparato con carne di manzo e maiale, soffritto, pomodoro e vino, cotto lentamente per almeno 4 ore.",
      price: 14.50,
      stock: 20,
      image: "https://b3067249.smushcdn.com/3067249/wp-content/uploads/2022/03/ragu-authenric-taglietelle.jpg?lossy=0&strip=1&webp=1",
      isActive: true,
      status: "ACTIVE",
      slug: "tagliatelle-al-ragu-bolognese",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Trofie al Pesto Genovese",
      description: "Trofie fresche artigianali servite con autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, formaggio Parmigiano Reggiano e Pecorino, aglio e olio extravergine d'oliva della Riviera Ligure.",
      price: 13.90,
      stock: 18,
      image: "https://www.ilgiornaledelcibo.it/wp-content/uploads/2008/05/trofie-al-pesto-li-per-li.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "trofie-al-pesto-genovese",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Tiramisù Tradizionale",
      description: "Autentico dolce italiano preparato secondo la ricetta tradizionale veneta. Strati di savoiardi inzuppati in caffè espresso, alternati a crema al mascarpone e cacao amaro in polvere. Ogni porzione è preparata a mano e conservata a temperatura controllata.",
      price: 8.90,
      stock: 30,
      image: "https://primochef.it/wp-content/uploads/2019/06/SH_tiramisu.jpg.webp",
      isActive: true,
      status: "ACTIVE",
      slug: "tiramisu-tradizionale",
      categoryName: "Desserts",
    },
    {
      name: "Lasagna al Forno Tradizionale",
      description: "Autentica lasagna italiana con sfoglie di pasta all'uovo fatte a mano, stratificate con ragù di carne selezionata, besciamella cremosa e Parmigiano Reggiano DOP. Cotta lentamente al forno per ottenere la perfetta consistenza e il caratteristico bordo croccante.",
      price: 15.90,
      stock: 15,
      image: "https://www.donnamoderna.com/content/uploads/2002/08/Lasagne-alla-bolognese-ricetta-tradizionale-830x625.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "lasagna-al-forno-tradizionale",
      categoryName: "Piatti Pronti",
    },
    {
      name: "Linguine allo Scoglio",
      description: "Pasta linguine di grano duro servita con un ricco sugo di mare che include cozze, vongole, gamberetti e calamari freschi. Preparata con pomodorini freschi, aglio, prezzemolo e un tocco di peperoncino. Un classico piatto della cucina costiera italiana.",
      price: 16.90,
      stock: 12,
      image: "https://www.giallozafferano.it/images/231-23195/Spaghetti-allo-scoglio_450x300.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "linguine-allo-scoglio",
      categoryName: "Pesce",
    },
    {
      name: "Cannolo Siciliano Artigianale",
      description: "Autentico cannolo siciliano con croccante scorza di cialda fritta a mano, ripiena di ricotta di pecora fresca setacciata e dolcificata con zucchero. Arricchito con gocce di cioccolato fondente e guarnito con pistacchi di Bronte DOP e scorze di arancia candita.",
      price: 7.50,
      stock: 35,
      image: "https://barpompi.it/wp-content/uploads/2021/05/cannolo-grande.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "cannolo-siciliano-artigianale",
      categoryName: "Desserts",
    },
    {
      name: "Porchetta di Ariccia IGP",
      description: "Autentica porchetta di Ariccia IGP, specialità laziale preparata con maiale intero disossato, arrotolato e aromatizzato con una miscela di erbe aromatiche (rosmarino, finocchietto selvatico, aglio e pepe nero). Cotta lentamente in forno a legna per 8 ore, presenta una crosta croccante e una carne interna tenera e succosa.",
      price: 18.90,
      stock: 10,
      image: "https://www.spesa-on-line.com/wp-content/uploads/2020/03/porchetta-di-ariccia-igp.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "porchetta-di-ariccia-igp",
      categoryName: "Salumi",
    },
    {
      name: "Mozzarella di Bufala",
      description: "Autentica Mozzarella di Bufala Campana DOP, prodotta esclusivamente con latte di bufala secondo la tradizione secolare della Campania. Caratterizzata da una superficie liscia e una consistenza elastica, presenta un colore bianco perlaceo e un sapore dolce e delicato con note di latte fresco. Confezionata nel suo siero di conservazione per mantenerne intatte le caratteristiche organolettiche.",
      price: 12.50,
      stock: 30,
      image: "https://cdn.prod.website-files.com/623059a72a9a6a29b378c3f0/62bad55960405ac8eb5ee589_mozzarella-campana-dop.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "mozzarella-di-bufala",
      categoryName: "Cheese",
    }, 
    {
      name: "Parmigiano Reggiano",
      description: "Autentico Parmigiano Reggiano DOP, un formaggio a pasta dura prodotto con latte vaccino crudo parzialmente scremato. Stagionato per almeno 12 mesi, si distingue per il suo sapore ricco, complesso e persistente con note di frutta secca e brodo. La sua consistenza è granulosa e friabile, con una crosta spessa di colore giallo paglierino. Considerato il 'Re dei formaggi', è ideale sia da tavola che da grattugia.",
      price: 24.90,
      stock: 35,
      image: "https://media-assets.lacucinaitaliana.it/photos/61fa636c1c2d9d41fae8d0ed/16:9/w_2240,c_limit/iStock_000011027617_Medium.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "parmigiano-reggiano",
      categoryName: "Cheese",
    },
    {
      name: "Pomodori Pelati San Marzano",
      description: "Autentici pomodori pelati San Marzano DOP, coltivati nell'area vesuviana della Campania secondo tradizione. Raccolti a piena maturazione e lavorati entro 24 ore, conservano tutto il sapore, la dolcezza e il basso livello di acidità tipici della varietà. Confezionati in succo di pomodoro naturale senza conservanti aggiunti, sono l'ingrediente ideale per salse, sughi e pizze della tradizione italiana.",
      price: 3.90,
      stock: 60,
      image: "https://megadolciaria.it/wp-content/uploads/2020/08/PELATI.jpeg",
      isActive: true,
      status: "ACTIVE", 
      slug: "pomodori-pelati-san-marzano",
      categoryName: "Vegetables",
    },
    {
      name: "Pesto alla Genovese DOP",
      description: "Autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, aglio, sale marino, Parmigiano Reggiano DOP invecchiato 24 mesi, Pecorino Sardo e olio extravergine d'oliva della Riviera Ligure. Lavorato a crudo nel mortaio di marmo per preservare tutti gli aromi.",
      price: 8.90,
      stock: 40,
      image: "https://discovernorthernitaly.com/wp-content/uploads/2024/08/Liguria-3.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Salse",
    },
    {
      name: "Pizza Margherita",
      description: "Un cornicione leggero e soffice, pomodori dolci, mozzarella e qualche foglia di basilico profumato. Questo è tutto ciò di cui hai bisogno per una classica pizza margherita, il punto di partenza perfetto per il tuo viaggio nella preparazione della pizza fatta in casa, nonché una ricetta collaudata per quando vuoi...",
      price: 8.90,
      stock: 40,
      image: "https://cdn.shopify.com/s/files/1/0274/9503/9079/files/20220211142754-margherita-9920_5a73220e-4a1a-4d33-b38f-26e98e3cd986.jpg?v=1723650067?w=1024",
      isActive: true,
      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Salse",
    },
    {
      name: "Limoncello di Capri",
      description: "Limoncello di Capri, prodotto secondo la ricetta tradizionale italiana, è un liquore dolce e leggero, caratterizzato da un sapore intenso e fruttato. È preparato con limoni freschi di Capri, zucchero e acqua, e viene fermentato per ottenere un'alchocolizzazione naturale.",
      price: 8.90,
      stock: 40,
      image: "https://www.bodeboca.com/sites/default/files/product-gallery/2022-06/galeria-limoncellodicapri-01.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Beverages",
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

  // Read default GDPR policy from file
  const gdprFilePath = path.join(__dirname, 'prompts', 'gdpr.md');
  try {
    const defaultGdprText = fs.readFileSync(gdprFilePath, 'utf8');

  if (!existingWhatsappSettings) {
    await prisma.whatsappSettings.create({
      data: {
        phoneNumber: "+34654728753",
        apiKey: "dummy-api-key",
        workspaceId: mainWorkspaceId,
          gdpr: defaultGdprText,
      },
    });
    console.log("Impostazioni WhatsApp create per il workspace principale");
  } else {
    await prisma.whatsappSettings.update({
      where: { workspaceId: mainWorkspaceId },
      data: {
        phoneNumber: "+34654728753",
        apiKey: "dummy-api-key",
          gdpr: existingWhatsappSettings.gdpr || defaultGdprText,
      },
    });
    console.log("Impostazioni WhatsApp aggiornate per il workspace principale");
    }
  } catch (error) {
    console.error("Non è stato possibile leggere il file gdpr.md:", error);
    // Continua senza aggiungere il GDPR
    if (!existingWhatsappSettings) {
      await prisma.whatsappSettings.create({
        data: {
          phoneNumber: "+34654728753",
          apiKey: "dummy-api-key",
          workspaceId: mainWorkspaceId,
        },
      });
      console.log("Impostazioni WhatsApp create per il workspace principale (senza GDPR)");
    } else {
      await prisma.whatsappSettings.update({
        where: { workspaceId: mainWorkspaceId },
        data: {
          phoneNumber: "+34654728753",
          apiKey: "dummy-api-key",
        },
      });
      console.log("Impostazioni WhatsApp aggiornate per il workspace principale (GDPR invariato)");
    }
  }

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${adminEmail}`)
  console.log(`- Workspace creato/aggiornato: ${createdWorkspaces[0].name}`)
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`)
  console.log(`- Prodotti creati/aggiornati: ${products.length}`)
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
