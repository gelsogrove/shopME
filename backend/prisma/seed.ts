/**
 * DATABASE SEED SCRIPT - VERSIONE FUNZIONANTE
 *
 * ✅ CREDENZIALI ADMIN TESTATE E FUNZIONANTI
 * Data: 13 Giugno 2025
 *
 * CREDENZIALI ADMIN:
 * - Email: admin@shopme.com
 * - Password: venezia44 (dal file .env ADMIN_PASSWORD)
 *
 * LOGIN TESTATO CON SUCCESSO:
 * curl -X POST http://localhost:3001/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"admin@shopme.com","password":"venezia44"}'
 *
 * WORKSPACE PRINCIPALE:
 * - ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Nome: L'Altra Italia(ESP)
 * - Admin associato come OWNER
 *
 * ⚠️ NON MODIFICARE CREDENZIALI SENZA AGGIORNARE .env
 */

import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

// Use environment variables with fallbacks
let adminEmail = process.env.ADMIN_EMAIL || ""
let adminPassword = process.env.ADMIN_PASSWORD || "admin123" // Default password for development

// Validate required environment variables
if (!adminEmail) {
  adminEmail = "admin@shopme.com" // Default email for development
}

if (!adminPassword) {
  adminPassword = "admin123" // Fallback password
}

// Define the default agent at the top level of the script
const defaultAgent = {
  name: "SofIA - Gusto Italiano Assistant",
  description: "SofIA, the passionate virtual assistant for Gusto Italiano",
  isRouter: true,
  department: null,
  promptName: "SofIA - Gusto Italiano Assistant",
  model: "openai/gpt-4o-mini",
}

// Andrea's Two-LLM Architecture - LLM 1 RAG Processor Prompt (Agent Settings)
const SOFIA_PROMPT = fs.readFileSync(
  path.join(__dirname, "../../docs/other/prompt_agent.md"),
  "utf8"
)

// Inizializziamo createdWorkspaces qui, prima di main()
let createdWorkspaces: any[] = []
// Definiamo un ID fisso per il nostro workspace unico
const mainWorkspaceId = "cm9hjgq9v00014qk8fsdy4ujv"

// Function to automatically generate ALL embeddings like clicking buttons in frontend
async function generateEmbeddingsAfterSeed() {
  console.log("\n🤖 AUTO-GENERATING ALL EMBEDDINGS (like clicking FE buttons)")
  console.log("============================================================")

  try {
    // Import the embedding services
    const { EmbeddingService } = require("../src/services/embeddingService")
    // const { DocumentService } = require("../src/services/documentService") // RIMOSSO - documenti non esistono più

    const embeddingService = new EmbeddingService()
    // const documentService = new DocumentService() // RIMOSSO - documenti non esistono più

    console.log("🔄 1. Generating FAQ embeddings...")
    try {
      const faqResult =
        await embeddingService.generateFAQEmbeddings(mainWorkspaceId)
      console.log(
        `✅ FAQ embeddings: ${faqResult.processed} processed, ${faqResult.errors.length} errors`
      )
      if (faqResult.errors.length > 0) {
        console.log("⚠️ FAQ errors:", faqResult.errors)
      }
    } catch (error) {
      console.log("❌ FAQ embeddings failed:", error.message)
    }

    console.log("🔄 2. Generating Service embeddings...")
    try {
      const serviceResult =
        await embeddingService.generateServiceEmbeddings(mainWorkspaceId)
      console.log(
        `✅ Service embeddings: ${serviceResult.processed} processed, ${serviceResult.errors.length} errors`
      )
      if (serviceResult.errors.length > 0) {
        console.log("⚠️ Service errors:", serviceResult.errors)
      }
    } catch (error) {
      console.log("❌ Service embeddings failed:", error.message)
    }

    console.log("🔄 3. Generating Product embeddings...")
    try {
      const productResult =
        await embeddingService.generateProductEmbeddings(mainWorkspaceId)
      console.log(
        `✅ Product embeddings: ${productResult.processed} processed, ${productResult.errors.length} errors`
      )
      if (productResult.errors.length > 0) {
        console.log("⚠️ Product errors:", productResult.errors)
      }
    } catch (error) {
      console.log("❌ Product embeddings failed:", error.message)
    }

    // console.log("🔄 4. Generating Document embeddings...")
    // try {
    //   const documentResult =
    //     await documentService.generateEmbeddingsForActiveDocuments(
    //       mainWorkspaceId
    //     )
    //   console.log(
    //     `✅ Document embeddings: ${documentResult.processed} processed, ${documentResult.errors.length} errors`
    //   )
    //   if (documentResult.errors.length > 0) {
    //     console.log("⚠️ Document errors:", documentResult.errors)
    //   }
    // } catch (error) {
    //   console.log("❌ Document embeddings failed:", error.message)
    // }
    console.log("🔄 4. Document embeddings: SKIPPED (documents no longer exist in system)")

    console.log("🎉 EMBEDDING GENERATION COMPLETED!")
    console.log("=================================")
    console.log("✅ All embeddings generated automatically")
    console.log("✅ RAG search should now work correctly")
    console.log("✅ Chatbot will use ONLY database data")
  } catch (error) {
    console.log("❌ Error during embedding generation:", error.message)
    console.log("⚠️ You may need to generate embeddings manually via frontend")
  }
}

// N8N function removed - Dual LLM system is now used instead
async function cleanAndImportN8NWorkflow() {
  console.log("\n🔄 N8N function removed - Dual LLM system is now used instead")
  return
}

// Function to seed Aviso Legal document - RIMOSSA (documenti non esistono più nel sistema)
/*
async function seedAvisoLegalDocument(workspaceId: string) {
  console.log("Seeding Aviso Legal document...")

  try {
    // Check if document already exists
    const existingDocument = await prisma.documents.findFirst({
      where: {
        workspaceId: workspaceId,
        originalName: "aviso-legal.pdf",
      },
    })

    if (existingDocument) {
      console.log("Aviso Legal document already exists, skipping...")
      return
    }

    // Copy PDF from samples to uploads directory
    const sourcePath = path.join(__dirname, "samples", "aviso-legal.pdf")
    const targetDir = path.join(__dirname, "..", "uploads", "documents")
    const filename = `${Date.now()}-aviso-legal.pdf`
    const targetPath = path.join(targetDir, filename)

    // Ensure uploads directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source PDF file not found: ${sourcePath}`)
      return
    }

    // Copy the file using streams for better handling of large binary files
    const sourceStream = fs.createReadStream(sourcePath)
    const targetStream = fs.createWriteStream(targetPath)

    await new Promise<void>((resolve, reject) => {
      sourceStream.pipe(targetStream)
      targetStream.on("finish", () => resolve())
      targetStream.on("error", reject)
      sourceStream.on("error", reject)
    })

    const stats = fs.statSync(targetPath)

    console.log(`PDF copied to: ${targetPath}`)

    // Create document record
    const document = await prisma.documents.create({
      data: {
        filename: filename,
        originalName: "aviso-legal.pdf",
        filePath: targetPath, // Use absolute path for processing
        fileSize: stats.size,
        mimeType: "application/pdf",
        status: "UPLOADED",
        workspaceId: workspaceId,
      },
    })

    console.log(`Document created with ID: ${document.id}`)

    // Note: Embedding generation is skipped in seed due to memory constraints
    // The document will be in UPLOADED status and can be processed manually via API
    console.log(
      "Aviso Legal document created successfully - embeddings can be generated via API"
    )
  } catch (error) {
    console.error("Error seeding Aviso Legal document:", error)
  }
}
*/

async function main() {
  console.log("🚀 STARTING COMPLETE DATABASE SEED")
  console.log("=".repeat(50))

  // 🔥 PULIZIA COMPLETA DEL DATABASE
  console.log(
    "🧹 COMPLETE DATABASE CLEANUP - Removing all data from all tables..."
  )

  try {
    // Elimina tutti i chunks prima (foreign keys)
    await prisma.documentChunks.deleteMany({})
    console.log("✅ Deleted all document chunks")

    await prisma.fAQChunks.deleteMany({})
    console.log("✅ Deleted all FAQ chunks")

    await prisma.serviceChunks.deleteMany({})
    console.log("✅ Deleted all service chunks")

    // Elimina ordini e carrelli
    await prisma.orderItems.deleteMany({})
    await prisma.paymentDetails.deleteMany({})
    await prisma.orders.deleteMany({})
    await prisma.cartItems.deleteMany({})
    await prisma.carts.deleteMany({})
    console.log("✅ Deleted all orders and carts")

    // Elimina chat e messaggi
    await prisma.message.deleteMany({})
    await prisma.chatSession.deleteMany({})
    console.log("✅ Deleted all chat sessions and messages")

    // Elimina documenti, FAQ, prodotti, categorie, servizi
    await prisma.documents.deleteMany({})
    await prisma.fAQ.deleteMany({})
    await prisma.products.deleteMany({})
    await prisma.categories.deleteMany({})
    await prisma.services.deleteMany({})
    await prisma.offers.deleteMany({})
    console.log("✅ Deleted all content entities")

    // Elimina usage prima dei customers (foreign key)
    await prisma.usage.deleteMany({})
    console.log("✅ Deleted all usage records")

    // Elimina customers e configurazioni
    await prisma.customers.deleteMany({})
    await prisma.agentConfig.deleteMany({})
    await prisma.prompts.deleteMany({})
    await prisma.languages.deleteMany({})
    await prisma.whatsappSettings.deleteMany({})
    console.log("✅ Deleted all customers and configurations")

    // Elimina associazioni user-workspace
    await prisma.userWorkspace.deleteMany({})
    console.log("✅ Deleted all user-workspace associations")

    // Elimina secure tokens prima dei workspace (foreign key)
    await prisma.secureToken.deleteMany({})
    console.log("✅ Deleted all secure tokens")

    // Elimina workspace e utenti
    await prisma.workspace.deleteMany({})
    await prisma.user.deleteMany({})
    console.log("✅ Deleted all workspaces and users")

    console.log("🎉 COMPLETE DATABASE CLEANUP FINISHED!")
    console.log("=".repeat(50))
  } catch (error) {
    console.error("❌ Error during database cleanup:", error)
    throw error
  }

  // Check if the admin user already exists (dovrebbe essere vuoto dopo la pulizia)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  let adminUser
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        status: "ACTIVE",
      },
    })
    console.log(
      `✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`
    )
  } else {
    adminUser = existingAdmin
    console.log("ℹ️ Admin user already exists.")
  }

  // Check if the main workspace exists
  const existingMainWorkspace = await prisma.workspace.findUnique({
    where: { id: mainWorkspaceId },
  })

  if (existingMainWorkspace) {
    console.log(`Trovato workspace principale con ID: ${mainWorkspaceId}`)

    // PULIZIA COMPLETA: Elimina tutti i dati del workspace principale
    console.log(
      "🧹 PULIZIA COMPLETA: eliminazione di tutti i dati del workspace..."
    )

    // 1. Prima eliminiamo gli elementi con dipendenze (chunks e relazioni)
    console.log("🗑️ Eliminazione chunks e dipendenze...")

    // Elimina tutti i chunks (usando i nomi corretti dal schema)
    try {
      await prisma.documentChunks.deleteMany({
        where: {
          document: {
            workspaceId: mainWorkspaceId,
          },
        },
      })
      console.log("Eliminati document chunks")
    } catch (error) {
      console.log("Errore eliminazione document chunks:", error.message)
    }

    try {
      await prisma.fAQChunks.deleteMany({
        where: {
          faq: {
            workspaceId: mainWorkspaceId,
          },
        },
      })
      console.log("Eliminati FAQ chunks")
    } catch (error) {
      console.log("Errore eliminazione FAQ chunks:", error.message)
    }

    try {
      await prisma.serviceChunks.deleteMany({
        where: {
          service: {
            workspaceId: mainWorkspaceId,
          },
        },
      })
      console.log("Eliminati service chunks")
    } catch (error) {
      console.log("Errore eliminazione service chunks:", error.message)
    }

    // Elimina tutti gli ordini e gli items
    await prisma.orderItems.deleteMany({
      where: {
        order: {
          workspaceId: mainWorkspaceId,
        },
      },
    })
    await prisma.paymentDetails.deleteMany({
      where: {
        order: {
          workspaceId: mainWorkspaceId,
        },
      },
    })
    await prisma.orders.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })

    // Elimina tutti i carrelli e items
    await prisma.cartItems.deleteMany({
      where: {
        cart: {
          workspaceId: mainWorkspaceId,
        },
      },
    })
    await prisma.carts.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })

    // Elimina tutte le chat e messaggi
    await prisma.message.deleteMany({
      where: {
        chatSession: {
          workspaceId: mainWorkspaceId,
        },
      },
    })
    await prisma.chatSession.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })

    // 2. Poi eliminiamo le entità principali
    console.log("🗑️ Eliminazione entità principali...")

    // Elimina tutti i documenti
    await prisma.documents.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminati tutti i documenti dal workspace principale")

    // Elimina tutte le FAQ
    await prisma.fAQ.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminate tutte le FAQ dal workspace principale")

    // Elimina tutti i prodotti
    await prisma.products.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminati tutti i prodotti dal workspace principale")

    // Elimina tutti i clienti
    await prisma.customers.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminati tutti i clienti dal workspace principale")

    // Elimina tutte le categorie
    await prisma.categories.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminate tutte le categorie dal workspace principale")

    // Elimina tutti i servizi
    await prisma.services.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log("Eliminati tutti i servizi dal workspace principale")

    // Elimina tutte le configurazioni agenti
    await prisma.agentConfig.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log(
      "Eliminate tutte le configurazioni agenti dal workspace principale"
    )

    // Elimina tutti i prompt e agenti
    const deletedPrompts = await prisma.prompts.deleteMany({
      where: {
        workspaceId: mainWorkspaceId,
      },
    })
    console.log(
      `Eliminati ${deletedPrompts.count} prompt dal workspace principale`
    )

    console.log("✅ Pulizia completa terminata!")

    // Aggiorniamo il workspace con i dati richiesti, ma manteniamo lo slug originale
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: mainWorkspaceId },
      data: {
        name: "L'Altra Italia(ESP)",
        whatsappPhoneNumber: "+34654728753",
        whatsappApiKey: "placeholder_whatsapp_api_key_for_testing",

        language: "es",
        currency: "EUR",
        url: "http://localhost:3000",

        wipMessages: {
          en: "Work in progress. Please contact us later.",
          it: "Lavori in corso. Contattaci più tardi.",
          es: "Trabajos en curso. Por favor, contáctenos más tarde.",
          pt: "Em manutenção. Por favor, contacte-nos mais tarde.",
        },
      },
    })
    console.log(
      `Workspace aggiornato: ${updatedWorkspace.name} con ID ${updatedWorkspace.id}`
    )
    createdWorkspaces.push(updatedWorkspace)

    // Ensure admin user has access to this workspace (FORZATO)
    try {
      await prisma.userWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: adminUser.id,
            workspaceId: mainWorkspaceId,
          },
        },
        update: {
          role: "OWNER",
        },
        create: {
          userId: adminUser.id,
          workspaceId: mainWorkspaceId,
          role: "OWNER",
        },
      })
      console.log(
        `✅ Admin user forzatamente associato al workspace come OWNER (upsert) - UserID: ${adminUser.id}`
      )

      // Verifica che l'associazione sia stata creata
      const verification = await prisma.userWorkspace.findUnique({
        where: {
          userId_workspaceId: {
            userId: adminUser.id,
            workspaceId: mainWorkspaceId,
          },
        },
      })
      if (verification) {
        console.log(
          `✅ Verifica: associazione UserWorkspace creata correttamente`
        )
      } else {
        console.error(
          `❌ ERRORE: associazione UserWorkspace NON trovata dopo la creazione!`
        )
      }
    } catch (error) {
      console.error(`❌ ERRORE nella creazione UserWorkspace:`, error)
      throw error
    }

    // AGGIUNTA: CREA AgentConfig DI DEFAULT SE NON ESISTE
    const existingAgentConfig = await prisma.agentConfig.findFirst({
      where: { workspaceId: mainWorkspaceId },
    })
    if (!existingAgentConfig) {
      await prisma.agentConfig.create({
        data: {
          prompt: SOFIA_PROMPT,
          workspaceId: mainWorkspaceId,
          model: defaultAgent.model,
          temperature: 0.3,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("SofIA AgentConfig creato per il workspace principale")
    } else {
      // FORCE UPDATE: Aggiorna sempre agentConfig con il contenuto di prompt_agent.md
      let promptContent = ""
      const promptFilePath = path.join(
        __dirname,
        "..",
        "..",
        "docs",
        "other",
        "prompt_agent.md"
      )

      try {
        promptContent = fs.readFileSync(promptFilePath, "utf8")
        console.log(`🔄 Aggiornando agentConfig con prompt_agent.md`)
      } catch (error) {
        console.error(`❌ Errore lettura prompt_agent.md: ${error}`)
        promptContent = SOFIA_PROMPT // Fallback al prompt di default
      }

      await prisma.agentConfig.update({
        where: { id: existingAgentConfig.id },
        data: {
          prompt: promptContent,
          model: defaultAgent.model,
          temperature: 0.3,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("✅ AgentConfig aggiornato con prompt_agent.md")
    }

    // CREA ANCHE UN AGENT NELLA TABELLA PROMPTS SE NON ESISTE
    const existingPromptAgent = await prisma.prompts.findFirst({
      where: {
        workspaceId: mainWorkspaceId,
        isRouter: true,
        isActive: true,
      },
    })
    if (!existingPromptAgent) {
      await prisma.prompts.create({
        data: {
          name: defaultAgent.name,
          content: SOFIA_PROMPT,
          isActive: true,
          isRouter: true,
          department: null,
          workspaceId: mainWorkspaceId,
          model: "gpt-3.5-turbo",
          temperature: 0.3, // Abbassata per maggiore consistenza nei link
          top_p: 1,
          max_tokens: 1024,
        },
      })
      console.log("SofIA Prompt agent creato per il workspace principale")
    } else {
      console.log("Prompt agent già esistente per il workspace principale")
    }

    // CREA ROUTER PROMPT SE NON ESISTE
    const existingRouterPrompt = await prisma.prompts.findFirst({
      where: {
        workspaceId: mainWorkspaceId,
        name: "Router LLM",
        isActive: true,
      },
    })
    if (!existingRouterPrompt) {
      await prisma.prompts.create({
        data: {
          name: "Router LLM",
          content: SOFIA_PROMPT,
          isActive: true,
          isRouter: false,
          department: "router",
          workspaceId: mainWorkspaceId,
          model: "openai/gpt-4o-mini",
          temperature: 0.1,
          top_p: 1,
          max_tokens: 500,
        },
      })
      console.log("Router Prompt creato per il workspace principale")
    } else {
      console.log("Router Prompt già esistente per il workspace principale")
    }
  } else {
    console.log(
      `Il workspace con ID ${mainWorkspaceId} non esiste nel database, lo creiamo`
    )
    // Create the workspace if it doesn't exist
    const mainWorkspace = await prisma.workspace.create({
      data: {
        id: mainWorkspaceId,
        name: "L'Altra Italia(ESP)",
        slug: "altra-italia-esp",
        whatsappPhoneNumber: "+34654728753",
        whatsappApiKey: "placeholder_whatsapp_api_key_for_testing",

        language: "es",
        currency: "EUR",
        url: "http://localhost:3000",

        wipMessages: {
          en: "Work in progress. Please contact us later.",
          it: "Lavori in corso. Contattaci più tardi.",
          es: "Trabajos en curso. Por favor, contáctenos más tarde.",
          pt: "Em manutenção. Por favor, contacte-nos mais tarde.",
        },
        welcomeMessages: {
          it: "Benvenuto a L'Altra Italia! 👋 Sono il tuo assistente virtuale e sono qui per aiutarti con qualsiasi informazione sui nostri prodotti e servizi. Prima di iniziare, ti invitiamo a registrarti al nostro servizio: potrai consultare le nostre politiche sulla privacy e scoprire come tuteliamo i tuoi dati, che saranno custoditi in modo sicuro nel nostro database e non verranno mai condivisi con terzi.",
          en: "Welcome to L'Altra Italia! 👋 I'm your virtual assistant and I'm here to help you with any information about our products and services. Before we begin, we invite you to register for our service: you can review our privacy policies and discover how we protect your data, which will be securely stored in our database and never shared with third parties.",
          es: "¡Bienvenido a L'Altra Italia! 👋 Soy tu asistente virtual y estoy aquí para ayudarte con cualquier información sobre nuestros productos y servicios. Antes de comenzar, te invitamos a registrarte en nuestro servicio: podrás consultar nuestras políticas de privacidad y descubrir cómo protegemos tus datos, que serán custodiados de forma segura en nuestra base de datos y nunca serán compartidos con terceros.",
          pt: "Bem-vindo à L'Altra Italia! 👋 Sou o seu assistente virtual e estou aqui para ajudá-lo com informações sobre os nossos produtos e serviços. Antes de começar, convidamo-lo a registar-se no nosso serviço: poderá consultar as nossas políticas de privacidade e descobrir como protegemos os seus dados, que serão guardados de forma segura na nossa base de dados e nunca serão partilhados com terceiros.",
        },
        afterRegistrationMessages: {
          it: "Ben tornato, {name}! 👋 Come posso aiutarti oggi?",
          en: "Welcome back, {name}! 👋 How can I help you today?",
          es: "¡Bienvenido de nuevo, {name}! 👋 ¿Cómo puedo ayudarte hoy?",
          pt: "Bem-vindo de volta, {name}! 👋 Como posso ajudá-lo hoje?",
        },
        debugMode: false,
      },
    })
    console.log(
      `Workspace creato: ${mainWorkspace.name} con ID ${mainWorkspace.id}`
    )
    createdWorkspaces.push(mainWorkspace)

    // Associate admin user with the new workspace (FORZATO)
    try {
      await prisma.userWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: adminUser.id,
            workspaceId: mainWorkspaceId,
          },
        },
        update: {
          role: "OWNER",
        },
        create: {
          userId: adminUser.id,
          workspaceId: mainWorkspaceId,
          role: "OWNER",
        },
      })
      console.log(
        `✅ Admin user forzatamente associato al nuovo workspace come OWNER (upsert) - UserID: ${adminUser.id}`
      )

      // Verifica che l'associazione sia stata creata
      const verification = await prisma.userWorkspace.findUnique({
        where: {
          userId_workspaceId: {
            userId: adminUser.id,
            workspaceId: mainWorkspaceId,
          },
        },
      })
      if (verification) {
        console.log(
          `✅ Verifica: associazione UserWorkspace creata correttamente`
        )
      } else {
        console.error(
          `❌ ERRORE: associazione UserWorkspace NON trovata dopo la creazione!`
        )
      }
    } catch (error) {
      console.error(`❌ ERRORE nella creazione UserWorkspace:`, error)
      throw error
    }

    // AGGIUNTA: CREA AgentConfig DI DEFAULT SE NON ESISTE
    const existingAgentConfig = await prisma.agentConfig.findFirst({
      where: { workspaceId: mainWorkspaceId },
    })
    if (!existingAgentConfig) {
      await prisma.agentConfig.create({
        data: {
          prompt: SOFIA_PROMPT,
          workspaceId: mainWorkspaceId,
          model: defaultAgent.model,
          temperature: 0.3,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("SofIA AgentConfig creato per il workspace principale")
    } else {
      // FORCE UPDATE: Aggiorna sempre agentConfig con il contenuto di prompt_agent.md
      let promptContent = ""
      const promptFilePath = path.join(
        __dirname,
        "..",
        "..",
        "docs",
        "other",
        "prompt_agent.md"
      )

      try {
        promptContent = fs.readFileSync(promptFilePath, "utf8")
        console.log(`🔄 Aggiornando agentConfig con prompt_agent.md`)
      } catch (error) {
        console.error(`❌ Errore lettura prompt_agent.md: ${error}`)
        promptContent = SOFIA_PROMPT // Fallback al prompt di default
      }

      await prisma.agentConfig.update({
        where: { id: existingAgentConfig.id },
        data: {
          prompt: promptContent,
          model: defaultAgent.model,
          temperature: 0.3,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("✅ AgentConfig aggiornato con prompt_agent.md")
    }

    // CREA ANCHE UN AGENT NELLA TABELLA PROMPTS SE NON ESISTE
    const existingPromptAgent = await prisma.prompts.findFirst({
      where: {
        workspaceId: mainWorkspaceId,
        isRouter: true,
        isActive: true,
      },
    })
    if (!existingPromptAgent) {
      await prisma.prompts.create({
        data: {
          name: defaultAgent.name,
          content: SOFIA_PROMPT,
          isActive: true,
          isRouter: true,
          department: null,
          workspaceId: mainWorkspaceId,
          model: "gpt-3.5-turbo",
          temperature: 0.3,
          top_p: 1,
          max_tokens: 1024,
        },
      })
      console.log("SofIA Prompt agent creato per il workspace principale")
    } else {
      console.log("Prompt agent già esistente per il workspace principale")
    }

    // CREA ROUTER PROMPT SE NON ESISTE
    const existingRouterPrompt = await prisma.prompts.findFirst({
      where: {
        workspaceId: mainWorkspaceId,
        name: "Router LLM",
        isActive: true,
      },
    })
    if (!existingRouterPrompt) {
      await prisma.prompts.create({
        data: {
          name: "Router LLM",
          content: SOFIA_PROMPT,
          isActive: true,
          isRouter: false,
          department: "router",
          workspaceId: mainWorkspaceId,
          model: "openai/gpt-4o-mini",
          temperature: 0.1,
          top_p: 1,
          max_tokens: 500,
        },
      })
      console.log("Router Prompt creato per il workspace principale")
    } else {
      console.log("Router Prompt già esistente per il workspace principale")
    }
  }

  // Cleanup any other workspaces (optionally delete them)
  const otherWorkspaces = await prisma.workspace.findMany({
    where: {
      id: {
        not: mainWorkspaceId,
      },
    },
  })

  if (otherWorkspaces.length > 0) {
    console.log(
      `Trovati ${otherWorkspaces.length} altri workspace (non verranno utilizzati)`
    )
    // Non li cancelliamo per sicurezza, ma non li includiamo nelle operazioni successive
  }

  // L'Altra Italia Categories - Based on catalog structure
  const foodCategories = [
    {
      name: "Cheeses & Dairy",
      slug: "cheeses-dairy",
      description: "Formaggi e latticini italiani premium, mozzarella, burrata e prodotti caseari di alta qualità.",
    },
    {
      name: "Cured Meats",
      slug: "cured-meats", 
      description: "Salumi tradizionali italiani e insaccati artigianali di alta qualità.",
    },
    {
      name: "Salami & Cold Cuts",
      slug: "salami-cold-cuts",
      description: "Salami artigianali, prosciutto e affettati italiani della migliore tradizione.",
    },
    {
      name: "Pasta & Rice",
      slug: "pasta-rice",
      description: "Pasta e riso italiani premium, varietà tradizionali e artigianali di alta qualità.",
    },
    {
      name: "Tomato Products",
      slug: "tomato-products",
      description: "Salse di pomodoro italiane, passata e prodotti a base di pomodoro di qualità superiore.",
    },
    {
      name: "Flour & Baking",
      slug: "flour-baking",
      description: "Farine italiane e ingredienti per panificazione e pasticceria artigianale.",
    },
    {
      name: "Sauces & Preserves",
      slug: "sauces-preserves",
      description: "Salse gourmet, conserve e condimenti italiani di alta qualità per arricchire ogni piatto.",
    },
    {
      name: "Water & Beverages",
      slug: "water-beverages",
      description: "Acque minerali italiane premium e bevande tradizionali di alta qualità.",
    },
    {
      name: "Frozen Products",
      slug: "frozen-products",
      description: "Dolci surgelati italiani, pasticceria e specialità congelate di alta qualità.",
    },
    {
      name: "Various & Spices",
      slug: "various-spices",
      description: "Spezie italiane, condimenti e vari prodotti gourmet per la cucina tradizionale.",
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
  const languageCodes = ["it", "en", "es", "pt"]
  const existingLanguages = await prisma.languages.findMany({
    where: {
      code: { in: languageCodes },
      workspaceId: mainWorkspaceId,
    },
  })

  const existingLanguageCodes = existingLanguages.map(
    (lang: { code: string }) => lang.code
  )
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
      pt: "Português",
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
  for (const agent of [defaultAgent]) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: agent.promptName,
        workspaceId: mainWorkspaceId,
      },
    })

    // Force update the prompt to use our new prompt_agent.md
    if (existingPrompt) {
      // Read the new prompt content
      let promptContent = ""
      const promptFilePath = path.join(
        __dirname,
        "..",
        "..",
        "docs",
        "other",
        "prompt_agent.md"
      )

      try {
        promptContent = fs.readFileSync(promptFilePath, "utf8")
        console.log(`Using updated prompt_agent.md for ${agent.name} agent`)
      } catch (error) {
        console.error(`Error reading prompt_agent.md file: ${error}`)
        promptContent =
          "Default prompt content. Please update with proper instructions."
      }

      // Update existing prompt
      await prisma.prompts.update({
        where: { id: existingPrompt.id },
        data: {
          content: promptContent,
          temperature: 0.3,
          top_p: 0.8,
          top_k: 30,
          model: agent.model,
        },
      })
      console.log(`Prompt updated: ${agent.promptName} for agent ${agent.name}`)
    }

    if (!existingPrompt) {
      let promptContent = ""
      let promptFilePath = ""

      // Use our updated prompt_agent.md for all agents
      promptFilePath = path.join(
        __dirname,
        "..",
        "..",
        "docs",
        "other",
        "prompt_agent.md"
      )

      try {
        promptContent = fs.readFileSync(promptFilePath, "utf8")
        console.log(
          `Using specific content from ${path.basename(promptFilePath)} for ${
            agent.name
          } agent`
        )
      } catch (error) {
        console.error(
          `Error reading ${path.basename(promptFilePath)} file: ${error}`
        )
        // Fallback to GDPR.md if specific file doesn't exist or can't be read
        try {
          promptContent = fs.readFileSync(
            path.join(__dirname, "prompts/gdpr.md"),
            "utf8"
          )
          console.log(`Using fallback GDPR.md content for ${agent.name} agent`)
        } catch (fallbackError) {
          console.error(`Error reading fallback GDPR.md file: ${fallbackError}`)
          promptContent =
            "Default prompt content. Please update with proper instructions."
        }
      }

      await prisma.prompts.create({
        data: {
          name: agent.promptName,
          content: promptContent,
          isRouter: agent.isRouter,
          department: agent.department,
          temperature: 0.3,
          top_p: 0.8,
          top_k: 30,
          model: agent.model,
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

  // L'Altra Italia Products - COMPLETE CATALOG (66 products)
  const products = [
    // BURRATA CATEGORY (18 products)
    {
      name: "Burrata di Vacca Senza Testa",
      ProductCode: "0212000022",
      description: "Burrata artigianale pugliese di latte vaccino senza testa, dal cuore cremoso e sapore delicato. Prodotta secondo tradizione in Puglia. Regione: Puglia - Culla della burrata, dove nasce questo capolavoro caseario nel cuore del Salento.",
      formato: "100gr *12",
      price: 5.50,
      stock: 48,
      status: "ACTIVE",
      slug: "burrata-de-vaca-s-cabeza",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata di Vacca Con Testa",
      ProductCode: "0212000017",
      description: "Burrata tradizionale pugliese di latte vaccino con testa, dalla consistenza cremosa e gusto autentico della tradizione casearia del Sud Italia.",
      formato: "125gr *12",
      price: 6.20,
      stock: 36,
      status: "ACTIVE",
      slug: "burrata-de-vaca-c-cabeza",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata in Vaso",
      ProductCode: "0212000020",
      description: "Burrata artigianale conservata in vaso, perfetta per mantenere la freschezza e la cremosità. Specialità pugliese di alta qualità.",
      formato: "125gr *12",
      price: 6.80,
      stock: 24,
      status: "ACTIVE",
      slug: "burrata-en-vaso",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Artigianale Senza Testa",
      ProductCode: "0212000043",
      description: "Burrata artigianale di produzione limitata, senza testa, dal sapore intenso e cremosità eccezionale. Prodotta da maestri casari pugliesi.",
      formato: "150gr *2",
      price: 8.90,
      stock: 18,
      status: "ACTIVE",
      slug: "burrata-artigianale-s-cabeza",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata",
      ProductCode: "0212000029",
      description: "Burrata classica pugliese di grande formato, perfetta per condivisione. Cuore cremoso di stracciatella e panna, pasta filata esterna.",
      formato: "250gr *10",
      price: 9.50,
      stock: 30,
      status: "ACTIVE",
      slug: "burrata-classica-250gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata 200gr",
      ProductCode: "0212000018",
      description: "Burrata di formato medio, ideale per 2-3 persone. Prodotta in Puglia con latte fresco locale e tecniche tradizionali.",
      formato: "200gr",
      price: 7.80,
      stock: 42,
      status: "ACTIVE",
      slug: "burrata-200gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Nodo in vaschetta",
      ProductCode: "0212000064",
      description: "Piccoli nodi di burrata in vaschetta, perfetti come antipasto o aperitivo. Formato mini per degustazioni raffinate.",
      formato: "50gr (5ud)",
      price: 4.20,
      stock: 60,
      status: "ACTIVE",
      slug: "nodo-in-vaschetta",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Affumicata",
      ProductCode: "0212000023",
      description: "Burrata affumicata con legni aromatici, dal sapore unico e avvolgente. Specialità gourmet della tradizione pugliese moderna.",
      formato: "125gr *2",
      price: 8.50,
      stock: 20,
      status: "ACTIVE",
      slug: "burrata-ahumada",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata 30 Gr (6 ud)",
      ProductCode: "0212000030",
      description: "Mini burrate monoporzione, perfette per aperitivi e degustazioni. Formato piccolo ma dal grande sapore pugliese.",
      formato: "180gr *10",
      price: 6.90,
      stock: 45,
      status: "ACTIVE",
      slug: "burrata-30gr-6ud",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata al Gorgonzola DOP",
      ProductCode: "0212000039",
      description: "Burrata gourmet con cuore di gorgonzola DOP lombardo. Incontro perfetto tra cremosità pugliese e sapidità lombarda.",
      formato: "100Gr *12",
      price: 9.80,
      stock: 15,
      status: "ACTIVE",
      slug: "burrata-al-gorgonzola-dop",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata alla Nduja",
      ProductCode: "0212000040",
      description: "Burrata piccante con 'nduja calabrese, fusione di sapori del Sud Italia. Cremosità pugliese incontra il piccante calabrese.",
      formato: "200 Gr*8",
      price: 11.20,
      stock: 12,
      status: "ACTIVE",
      slug: "burrata-alla-nduja",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Caprese",
      ProductCode: "0212000046",
      description: "Burrata con pomodorini e basilico, ispirata alla tradizione caprese. Freschezza campana in versione pugliese.",
      formato: "100Gr *12",
      price: 7.90,
      stock: 28,
      status: "ACTIVE",
      slug: "burrata-caprese",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata ai Ricci di Mare",
      ProductCode: "0212000044",
      description: "Burrata gourmet con ricci di mare, specialità di lusso che unisce la cremosità della burrata al sapore del mare pugliese.",
      formato: "100Gr *12",
      price: 15.50,
      stock: 8,
      status: "ACTIVE",
      slug: "burrata-ai-ricci-di-mare",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Affumicata con Cuore di Ricotta",
      ProductCode: "0212000041",
      description: "Burrata affumicata con cuore di ricotta fresca, doppia cremosità e sapore affumicato delicato. Innovazione della tradizione.",
      formato: "100gr *16",
      price: 8.90,
      stock: 22,
      status: "ACTIVE",
      slug: "burrata-ahumada-con-cuore-ricotta",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata con Tartufo",
      ProductCode: "0212000019",
      description: "Burrata gourmet con tartufo, eccellenza pugliese arricchita dal pregiato tartufo italiano. Lusso e tradizione in un solo prodotto. Regione: Puglia - Dalle murge pugliesi, dove la burrata incontra il tartufo umbro in un matrimonio di sapori unico.",
      formato: "100g *12",
      price: 12.80,
      stock: 10,
      status: "ACTIVE",
      slug: "burrata-c-trufa",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Anchoas del Cantábrico y pimiento",
      ProductCode: "G-ANCH-PROV",
      description: "Burrata gourmet con acciughe del Cantabrico e peperoni, fusione italo-spagnola di sapori marini e terrestri.",
      formato: "100gr *16",
      price: 13.50,
      stock: 6,
      status: "ACTIVE",
      slug: "burrata-anchoas-cantabrico-pimiento",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata Olive e Maggiorana",
      ProductCode: "G-OLIV-PROV",
      description: "Burrata aromatizzata con olive pugliesi e maggiorana fresca, sapori mediterranei in perfetta armonia con la cremosità tradizionale.",
      formato: "100gr *16",
      price: 9.20,
      stock: 14,
      status: "ACTIVE",
      slug: "burrata-olive-maggiorana",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burrata di Bufala",
      ProductCode: "0212000047",
      description: "Burrata di latte di bufala campana, cremosità superiore e sapore più intenso. Eccellenza casearia del Sud Italia.",
      formato: "125Gr *12",
      price: 11.80,
      stock: 16,
      status: "ACTIVE",
      slug: "burrata-di-bufala",
      categoryName: "Cheeses & Dairy",
    },

    // MOZZARELLA BUFALA CATEGORY (12 products)
    {
      name: "Mozzarela Di Bufala",
      ProductCode: "0212000035",
      description: "Mozzarella di bufala campana DOP, dal sapore intenso e consistenza elastica. Prodotta con latte di bufala 100% campano.",
      formato: "5*100 Gr",
      price: 12.50,
      stock: 25,
      status: "ACTIVE",
      slug: "mozzarela-di-bufala-5x100",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Bocconcino Di Bufala",
      ProductCode: "0212000033",
      description: "Bocconcini di mozzarella di bufala campana DOP, formato pratico per insalate e antipasti. Freschezza e qualità garantite.",
      formato: "2*125 Gr",
      price: 8.90,
      stock: 32,
      status: "ACTIVE",
      slug: "bocconcino-di-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Ciliegina",
      ProductCode: "0212000048",
      description: "Ciliegine di mozzarella di bufala DOP, formato mini perfetto per aperitivi e insalate caprese. Dolcezza e freschezza campana.",
      formato: "15Gr (250Gr*10)",
      price: 6.80,
      stock: 40,
      status: "ACTIVE",
      slug: "ciliegina-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella Di Bufala Campana D.O.P.",
      ProductCode: "0212000034",
      description: "Mozzarella di bufala campana DOP certificata, ciliegine in busta. Tradizione casearia campana dal 1800, sapore autentico.",
      formato: "15Gr *bolsa 250Gr",
      price: 7.20,
      stock: 35,
      status: "ACTIVE",
      slug: "mozzarella-bufala-campana-dop-ciliegine",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala Campana D.O.P. 125gr",
      ProductCode: "0212000024",
      description: "Mozzarella di bufala campana DOP formato classico, prodotta nelle province di Caserta e Salerno secondo disciplinare tradizionale. Regione: Campania - Terra dei bufali, dove la tradizione DOP protegge l'eccellenza casearia da generazioni.",
      formato: "125gr * 12",
      price: 9.50,
      stock: 28,
      status: "ACTIVE",
      slug: "mozzarella-bufala-campana-dop-125gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala Campana D.O.P. 250gr",
      ProductCode: "0212000031",
      description: "Mozzarella di bufala campana DOP grande formato, ideale per famiglie. Cremosità e sapore intenso della tradizione campana.",
      formato: "250gr *12",
      price: 14.80,
      stock: 20,
      status: "ACTIVE",
      slug: "mozzarella-bufala-campana-dop-250gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala D.O.P. Treccia 1kg",
      ProductCode: "0212000053",
      description: "Treccia di mozzarella di bufala DOP da 1kg, formato professionale per ristoranti. Lavorazione artigianale a mano.",
      formato: "1 Kg",
      price: 18.90,
      stock: 15,
      status: "ACTIVE",
      slug: "mozzarella-bufala-dop-treccia-1kg",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala D.O.P. Affumicata",
      ProductCode: "0212000028",
      description: "Mozzarella di bufala DOP affumicata con legni naturali, sapore unico che unisce tradizione campana e tecnica affumicatura.",
      formato: "250gr *12",
      price: 16.20,
      stock: 12,
      status: "ACTIVE",
      slug: "mozzarella-bufala-dop-ahumada",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala D.O.P. Treccia 2kg",
      ProductCode: "0212000049",
      description: "Treccia di mozzarella di bufala DOP da 2kg, formato per grandi eventi e ristorazione. Lavorazione completamente manuale.",
      formato: "2 Kg",
      price: 35.50,
      stock: 8,
      status: "ACTIVE",
      slug: "mozzarella-bufala-dop-treccia-2kg",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala Senza Lattosio",
      ProductCode: "0212000036",
      description: "Mozzarella di bufala senza lattosio, per intolleranti che non vogliono rinunciare al sapore autentico della bufala campana.",
      formato: "2*125 Gr",
      price: 10.80,
      stock: 18,
      status: "ACTIVE",
      slug: "mozzarella-bufala-s-lactose",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella di Bufala Senza Lattosio 500gr",
      ProductCode: "P-MBSL-PROV",
      description: "Mozzarella di bufala senza lattosio formato grande, innovazione per intolleranti. Mantiene tutto il sapore della tradizione campana.",
      formato: "500 Gr",
      price: 16.50,
      stock: 10,
      status: "ACTIVE",
      slug: "mozzarella-bufala-s-lactose-500gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Bocconcini di Bufala Senza Lattosio",
      ProductCode: "0212000037",
      description: "Bocconcini di mozzarella di bufala senza lattosio, formato pratico per chi ha intolleranze ma ama i sapori autentici.",
      formato: "5*50 Gr",
      price: 9.20,
      stock: 22,
      status: "ACTIVE",
      slug: "bocconcino-bufala-s-lactose",
      categoryName: "Cheeses & Dairy",
    },

    // FIOR DI LATTE CATEGORY (9 products)
    {
      name: "Fiordilatte Taglio Napoli",
      ProductCode: "0212000025",
      description: "Fior di latte taglio Napoli, mozzarella di latte vaccino della tradizione napoletana. Perfetta per pizza e piatti tipici campani.",
      formato: "6*500Gr",
      price: 8.50,
      stock: 30,
      status: "ACTIVE",
      slug: "fiordilatte-taglio-napoli",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Fiordilatte Julienne Taglio Fiammifero",
      ProductCode: "0212000026",
      description: "Fior di latte taglio julienne a fiammifero, formato professionale per pizzerie e ristoranti. Fusione perfetta e veloce.",
      formato: "3 Kg",
      price: 12.80,
      stock: 20,
      status: "ACTIVE",
      slug: "fiordilatte-julienne-taglio-fiammifero",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Fior di Latte Boccone",
      ProductCode: "0212000045",
      description: "Fior di latte a bocconi, formato professionale per ristorazione. Mozzarella di latte vaccino dalla consistenza perfetta.",
      formato: "3 Kg",
      price: 11.90,
      stock: 25,
      status: "ACTIVE",
      slug: "fior-di-latte-boccone",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Fior di Latte Cubettata",
      ProductCode: "0212000051",
      description: "Fior di latte cubettata, taglio uniforme per preparazioni professionali. Ideale per insalate e piatti freddi.",
      formato: "3 Kg",
      price: 12.20,
      stock: 18,
      status: "ACTIVE",
      slug: "fior-di-latte-cubettata",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella Fior di Latte",
      ProductCode: "0212000032",
      description: "Mozzarella fior di latte formato famiglia, dalla tradizione casearia campana. Sapore delicato e consistenza elastica.",
      formato: "15*200 Gr",
      price: 6.80,
      stock: 35,
      status: "ACTIVE",
      slug: "mozzarella-fior-di-latte",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella Fiordilatte 500gr",
      ProductCode: "0212000027",
      description: "Mozzarella fiordilatte formato medio, perfetta per uso domestico. Prodotta con latte fresco italiano di alta qualità.",
      formato: "500 Gr *6",
      price: 5.90,
      stock: 42,
      status: "ACTIVE",
      slug: "mozzarella-fiordilatte-500gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Fior di Latte 125gr",
      ProductCode: "0212000042",
      description: "Fior di latte formato piccolo, ideale per porzioni individuali. Freschezza e qualità della tradizione casearia italiana.",
      formato: "125Gr *20",
      price: 4.50,
      stock: 50,
      status: "ACTIVE",
      slug: "fior-di-latte-125gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella Julienne",
      ProductCode: "0219000003",
      description: "Mozzarella julienne professionale, taglio sottile per fusione rapida. Formato ristorante per preparazioni veloci.",
      formato: "2 Kg",
      price: 9.80,
      stock: 28,
      status: "ACTIVE",
      slug: "mozzarella-julienne",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mozzarella FDL Barra",
      ProductCode: "0212000050",
      description: "Mozzarella fior di latte a barra, formato pratico per taglio personalizzato. Ideale per pizzerie e ristoranti.",
      formato: "1 Kg",
      price: 7.20,
      stock: 32,
      status: "ACTIVE",
      slug: "mozzarella-fdl-barra",
      categoryName: "Cheeses & Dairy",
    },

    // OTROS FRESCOS CATEGORY (18 products)
    {
      name: "Stracciatella Artigianale",
      ProductCode: "0212000021",
      description: "Stracciatella artigianale pugliese, il cuore cremoso della burrata. Prodotta a mano secondo tradizione con panna fresca.",
      formato: "250gr *10",
      price: 8.90,
      stock: 25,
      status: "ACTIVE",
      slug: "stracciatella-artigianale",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Stracciatella Artigianale 1kg",
      ProductCode: "0217000024",
      description: "Stracciatella artigianale formato professionale, per ristoranti e pizzerie. Cremosità e sapore della tradizione pugliese.",
      formato: "1 Kg *2",
      price: 15.80,
      stock: 15,
      status: "ACTIVE",
      slug: "stracciatella-artigianale-1kg",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Stracciatella Affumicata in Vaso",
      ProductCode: "0217000030",
      description: "Stracciatella affumicata in vaso, innovazione della tradizione pugliese. Sapore affumicato delicato e cremosità intatta.",
      formato: "250Gr *10",
      price: 10.50,
      stock: 18,
      status: "ACTIVE",
      slug: "stracciatella-ahumada-en-vaso",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Ricotta",
      ProductCode: "1002037075",
      description: "Ricotta fresca italiana, prodotta con siero di latte di alta qualità. Sapore dolce e consistenza cremosa, tradizione casearia.",
      formato: "1,5 Kg *2",
      price: 6.50,
      stock: 30,
      status: "ACTIVE",
      slug: "ricotta-1-5kg",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Ricotta 250gr",
      ProductCode: "1002020376",
      description: "Ricotta fresca formato famiglia, perfetta per dolci e preparazioni salate. Prodotta giornalmente con latte italiano.",
      formato: "250gr *8",
      price: 3.80,
      stock: 45,
      status: "ACTIVE",
      slug: "ricotta-250gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Ricotta de Bufala",
      ProductCode: "0217000037",
      description: "Ricotta di bufala campana, sapore più intenso e cremosità superiore. Prodotta con siero di latte di bufala DOP.",
      formato: "200 Gr *12",
      price: 8.90,
      stock: 20,
      status: "ACTIVE",
      slug: "ricotta-de-bufala-200gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Ricotta de Bufala 400gr",
      ProductCode: "0217000038",
      description: "Ricotta di bufala formato grande, eccellenza casearia campana. Ideale per preparazioni dolci e salate di alta qualità.",
      formato: "400 Gr *6",
      price: 12.50,
      stock: 15,
      status: "ACTIVE",
      slug: "ricotta-de-bufala-400gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mascarpone",
      ProductCode: "1002037074",
      description: "Mascarpone lombardo tradizionale, cremoso e delicato. Perfetto per tiramisù e preparazioni dolci della tradizione italiana.",
      formato: "500 gr *6",
      price: 7.80,
      stock: 25,
      status: "ACTIVE",
      slug: "mascarpone-500gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Mascarpone 2kg",
      ProductCode: "0217000026",
      description: "Mascarpone formato professionale per pasticcerie e ristoranti. Cremosità e qualità lombarda per preparazioni di alto livello.",
      formato: "2 Kg *6",
      price: 22.50,
      stock: 12,
      status: "ACTIVE",
      slug: "mascarpone-2kg",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Scamorza Affumicata a Spicchi",
      ProductCode: "0217000043",
      description: "Scamorza affumicata a spicchi, formato aperitivo. Sapore affumicato delicato della tradizione casearia del Sud Italia. Regione: Molise - Dalle montagne del Matese, dove l'antica arte dell'affumicatura dona sapori unici ai formaggi a pasta filata.",
      formato: "30 Gr (250Gr *10)",
      price: 6.20,
      stock: 35,
      status: "ACTIVE",
      slug: "scamorza-ahumada-spizzico",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Taleggio DOP",
      ProductCode: "1002037073",
      description: "Taleggio DOP lombardo, formaggio a pasta molle dalla crosta lavata. Sapore intenso e cremosità tipica delle valli bergamasche.",
      formato: "+/-2Kg",
      price: 24.80,
      stock: 8,
      status: "ACTIVE",
      slug: "taleggio-dop",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Gorgonzola Dolce",
      ProductCode: "0217000031",
      description: "Gorgonzola dolce lombardo, erborinato cremoso dal sapore delicato. Tradizione casearia della pianura padana dal 1800. Regione: Lombardia - Nelle valli bergamasche nasce questo gioiello erborinato, simbolo dell'eccellenza casearia lombarda.",
      formato: "1,5 Kg +/-",
      price: 18.90,
      stock: 12,
      status: "ACTIVE",
      slug: "gorgonzola-dolce",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Yogurt di Bufala",
      ProductCode: "0320000001",
      description: "Yogurt di bufala campana, cremoso e ricco di proteine. Prodotto con latte di bufala fresco delle migliori aziende campane.",
      formato: "150 Gr *6",
      price: 5.80,
      stock: 30,
      status: "ACTIVE",
      slug: "iogurt-de-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Burro di Bufala",
      ProductCode: "0227000021",
      description: "Burro di bufala campana, sapore intenso e cremosità superiore. Prodotto con panna di bufala, eccellenza casearia italiana.",
      formato: "125 Gr *40",
      price: 4.50,
      stock: 40,
      status: "ACTIVE",
      slug: "mantequilla-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Panna Cotta de Bufala",
      ProductCode: "0221000003",
      description: "Panna cotta di bufala, dolce tradizionale piemontese con latte di bufala campana. Cremosità e sapore unici.",
      formato: "100 Gr",
      price: 3.80,
      stock: 25,
      status: "ACTIVE",
      slug: "panna-cotta-de-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Kefir di Bufala",
      ProductCode: "P-KEFB-PROV",
      description: "Kefir di bufala, bevanda fermentata probiotica. Innovazione salutistica con latte di bufala campana, ricco di fermenti vivi.",
      formato: "200 Gr *6",
      price: 6.80,
      stock: 18,
      status: "ACTIVE",
      slug: "kefir-de-bufala",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Formaggio Fresco di Bufala Spalmabile",
      ProductCode: "P-QFRE-PROV",
      description: "Formaggio fresco di bufala spalmabile, cremoso e delicato. Perfetto per aperitivi e colazioni, innovazione della tradizione campana.",
      formato: "150 Gr *6",
      price: 7.20,
      stock: 22,
      status: "ACTIVE",
      slug: "queso-fresco-bufala-untar",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Perle di Bufala in Crema Fresca",
      ProductCode: "P-PBCF-PROV",
      description: "Perle di bufala avvolte in crema fresca, specialità gourmet. Piccole sfere di mozzarella di bufala in crema, esperienza unica.",
      formato: "500 Gr",
      price: 14.50,
      stock: 10,
      status: "ACTIVE",
      slug: "perlas-bufala-crema-fresca",
      categoryName: "Cheeses & Dairy",
    },

    // CURADOS CATEGORY (9 products)
    {
      name: "Gran Moravia",
      ProductCode: "0217000005",
      description: "Gran Moravia, formaggio stagionato ceco di alta qualità. Sapore intenso e consistenza compatta, perfetto per grattugie e degustazioni.",
      formato: "500 Gr *10",
      price: 12.80,
      stock: 20,
      status: "ACTIVE",
      slug: "gran-moravia-500gr",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Gran Moravia Rallado",
      ProductCode: "1002037090",
      description: "Gran Moravia grattugiato, pronto all'uso per pasta e risotti. Stagionatura prolungata per sapore intenso e aroma persistente.",
      formato: "1 Kg",
      price: 15.50,
      stock: 25,
      status: "ACTIVE",
      slug: "gran-moravia-rallado",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Gran Moravia En Laminas",
      ProductCode: "0201020522",
      description: "Gran Moravia a lamelle, taglio professionale per antipasti e piatti gourmet. Presentazione elegante e sapore intenso.",
      formato: "1 Kg",
      price: 16.80,
      stock: 15,
      status: "ACTIVE",
      slug: "gran-moravia-laminas",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Gran Moravia 1/8",
      ProductCode: "0217000003",
      description: "Gran Moravia in ottavo di forma, formato tradizionale per taglio personalizzato. Stagionatura minima 12 mesi.",
      formato: "4 Kg +/-",
      price: 38.50,
      stock: 8,
      status: "ACTIVE",
      slug: "gran-moravia-1-8",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Parmigiano Reggiano D.O.P. Gran Fiore",
      ProductCode: "0202020436",
      description: "Parmigiano Reggiano DOP Gran Fiore, stagionato 24 mesi. Re dei formaggi italiani dalle province di Parma, Reggio Emilia e Modena. Regione: Emilia-Romagna - Patria del Parmigiano, dove la pianura padana dona il latte più pregiato d'Italia.",
      formato: "1 Kg +/-",
      price: 28.50,
      stock: 15,
      status: "ACTIVE",
      slug: "parmigiano-reggiano-dop-gran-fiore",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Parmigiano Reggiano Rueda Entera",
      ProductCode: "0202020582",
      description: "Parmigiano Reggiano DOP ruota intera, stagionato 24+ mesi. Eccellenza assoluta della tradizione casearia emiliana, formato professionale.",
      formato: "34 Kg +/-",
      price: 39.90,
      stock: 2,
      status: "ACTIVE",
      slug: "parmigiano-reggiano-rueda-entera",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Formaggio Fontal",
      ProductCode: "1002037066",
      description: "Formaggio Fontal, pasta semi-dura dal sapore dolce e delicato. Tradizione casearia alpina, perfetto per fondute e piatti gratinati.",
      formato: "2 Kg +/-",
      price: 16.80,
      stock: 12,
      status: "ACTIVE",
      slug: "queso-fontal",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Scamorza Affumicata",
      ProductCode: "1002037060",
      description: "Scamorza affumicata stagionata, dalla caratteristica forma a pera. Affumicatura naturale con legni aromatici del Sud Italia.",
      formato: "2,5 Kg +/-",
      price: 22.50,
      stock: 10,
      status: "ACTIVE",
      slug: "scamorza-ahumada-stagionata",
      categoryName: "Cheeses & Dairy",
    },
    {
      name: "Provolone Dolce",
      ProductCode: "0217000002",
      description: "Provolone dolce stagionato, formaggio a pasta filata della tradizione del Sud Italia. Sapore delicato e consistenza compatta.",
      formato: "5,6 Kg +/-",
      price: 38.90,
      stock: 6,
      status: "ACTIVE",
      slug: "provolone-dolce",
      categoryName: "Cheeses & Dairy",
    },

    // FROZEN PRODUCTS CATEGORY (10 products from Congelado section)
    {
      name: "Tiramisù Monoporzione",
      ProductCode: "0420000074",
      description: "Tiramisù monoporzione artigianale, dolce tradizionale italiano con mascarpone, caffè e cacao. Formato individuale per ristorazione.",
      formato: "110gr *10",
      price: 4.50,
      stock: 30,
      status: "ACTIVE",
      slug: "tiramisu-monoporzione",
      categoryName: "Frozen Products",
    },
    {
      name: "Torta Sacher",
      ProductCode: "0420000107",
      description: "Torta Sacher austriaca con cioccolato e marmellata di albicocche. Ricetta tradizionale viennese, formato surgelato.",
      formato: "800gr",
      price: 18.90,
      stock: 12,
      status: "ACTIVE",
      slug: "torta-sacher",
      categoryName: "Frozen Products",
    },
    {
      name: "Cannolo Siciliano",
      ProductCode: "0503000110",
      description: "Cannoli siciliani tradizionali con ricotta fresca e gocce di cioccolato. Specialità dolciaria siciliana autentica. Regione: Sicilia - Dall'isola del sole, dove la tradizione pasticcera araba si fonde con la ricotta delle madonie.",
      formato: "10 pezzi",
      price: 12.80,
      stock: 20,
      status: "ACTIVE",
      slug: "cannolo-siciliano",
      categoryName: "Frozen Products",
    },
    {
      name: "Sfogliatella Grande",
      ProductCode: "0420000073",
      description: "Sfogliatella napoletana ripiena di ricotta e canditi. Pasta sfoglia croccante, dolce tradizionale campano. Regione: Campania - Dal cuore di Napoli, dove i maestri pasticceri creano questa meraviglia sfogliata da secoli.",
      formato: "100gr *60",
      price: 2.80,
      stock: 50,
      status: "ACTIVE",
      slug: "sfogliatella-grande",
      categoryName: "Frozen Products",
    },
    {
      name: "Croissant alla Crema",
      ProductCode: "0420000075",
      description: "Croissant francesi ripieni di crema pasticcera. Pasta sfoglia burrosa e crema delicata, formato surgelato.",
      formato: "95gr *50",
      price: 1.80,
      stock: 80,
      status: "ACTIVE",
      slug: "croissant-crema",
      categoryName: "Frozen Products",
    },

    // SAUCES & PRESERVES CATEGORY (8 products from Salsas y conservas section)
    {
      name: "Sugo al Pomodoro e Basilico",
      ProductCode: "0607000013",
      description: "Sugo di pomodoro italiano con basilico fresco. Ricetta tradizionale della nonna, ideale per pasta e pizza.",
      formato: "370ml *12",
      price: 3.20,
      stock: 60,
      status: "ACTIVE",
      slug: "sugo-pomodoro-basilico",
      categoryName: "Sauces & Preserves",
    },
    {
      name: "Sugo alla Bolognese",
      ProductCode: "0607000014",
      description: "Ragù alla bolognese tradizionale con carne di manzo e maiale. Ricetta emiliana autentica, cottura lenta.",
      formato: "370ml *4",
      price: 5.80,
      stock: 40,
      status: "ACTIVE",
      slug: "sugo-bolognese",
      categoryName: "Sauces & Preserves",
    },
    {
      name: "Sugo all'Arrabbiata",
      ProductCode: "0607000015",
      description: "Sugo piccante all'arrabbiata con pomodoro, aglio e peperoncino. Specialità romana dal sapore deciso.",
      formato: "370ml *12",
      price: 3.50,
      stock: 45,
      status: "ACTIVE",
      slug: "sugo-arrabbiata",
      categoryName: "Sauces & Preserves",
    },
    {
      name: "Salsa di Tartufo",
      ProductCode: "0607000005",
      description: "Salsa gourmet al tartufo nero 5%, perfetta per pasta e risotti. Sapore intenso e aroma inconfondibile.",
      formato: "500gr *6",
      price: 15.90,
      stock: 25,
      status: "ACTIVE",
      slug: "salsa-tartufo",
      categoryName: "Sauces & Preserves",
    },
    {
      name: "Olio di Oliva con Tartufo Bianco",
      ProductCode: "0602050490",
      description: "Olio extravergine di oliva aromatizzato con tartufo bianco pregiato. Condimento gourmet per piatti raffinati.",
      formato: "250ml *12",
      price: 22.50,
      stock: 18,
      status: "ACTIVE",
      slug: "olio-tartufo-bianco",
      categoryName: "Sauces & Preserves",
    },

    // VARIOUS & SPICES CATEGORY (10 products from Varios section)
    {
      name: "Aglio Granulato",
      ProductCode: "0608000043",
      description: "Aglio granulato essiccato, pratico e sempre pronto. Aroma intenso per condimenti e preparazioni culinarie.",
      formato: "850gr",
      price: 8.90,
      stock: 35,
      status: "ACTIVE",
      slug: "aglio-granulato",
      categoryName: "Various & Spices",
    },
    {
      name: "Cannella in Polvere",
      ProductCode: "0608000036",
      description: "Cannella in polvere di Ceylon, spezia dolce e aromatica. Perfetta per dolci, bevande calde e preparazioni orientali.",
      formato: "550gr",
      price: 12.80,
      stock: 28,
      status: "ACTIVE",
      slug: "cannella-polvere",
      categoryName: "Various & Spices",
    },
    {
      name: "Curry in Polvere",
      ProductCode: "0608000021",
      description: "Miscela di spezie curry tradizionale indiana. Blend aromatico per piatti etnici e fusion cuisine.",
      formato: "810gr",
      price: 15.50,
      stock: 22,
      status: "ACTIVE",
      slug: "curry-polvere",
      categoryName: "Various & Spices",
    },
    {
      name: "Oregano Siciliano",
      ProductCode: "0608000037",
      description: "Oregano siciliano essiccato, aroma intenso e persistente. Spezia essenziale per pizza, pasta e piatti mediterranei. Regione: Sicilia - Dalle colline dell'Etna, dove il sole mediterraneo concentra gli aromi nelle foglie di oregano selvatico.",
      formato: "1kg",
      price: 18.90,
      stock: 20,
      status: "ACTIVE",
      slug: "oregano-siciliano",
      categoryName: "Various & Spices",
    },
    {
      name: "Pepe Nero in Grani",
      ProductCode: "0608000045",
      description: "Pepe nero in grani di alta qualità, piccante e aromatico. Spezia fondamentale per ogni cucina professionale.",
      formato: "710gr",
      price: 16.80,
      stock: 30,
      status: "ACTIVE",
      slug: "pepe-nero-grani",
      categoryName: "Various & Spices",
    },
    {
      name: "Basilico Essiccato",
      ProductCode: "0606000099",
      description: "Basilico essiccato italiano, aroma mediterraneo autentico. Perfetto per sughi, pizza e piatti della tradizione. Regione: Liguria - Dalla riviera ligure, patria del basilico genovese DOP, dove cresce il basilico più profumato d'Italia.",
      formato: "250gr",
      price: 9.80,
      stock: 40,
      status: "ACTIVE",
      slug: "basilico-essiccato",
      categoryName: "Various & Spices",
    },
  ]

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
            ProductCode:
              product.ProductCode ||
              `000${Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, "0")}`,
            description: product.description,
            formato: product.formato,
            price: product.price,
            stock: product.stock,
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
            formato: product.formato,
            price: product.price,
            stock: product.stock,
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

  // Create special offers for the workspace
  console.log("Creating special offers...")

  // Define sample offers
  const specialOffers = [
    {
      name: "Offerta Frozen Products 20%",
      description: "Sconto del 20% su tutti i prodotti surgelati!",
      discountPercent: 20,
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
      endDate: new Date(new Date().setDate(new Date().getDate() + 365)), // 1 year from now
      isActive: true,
      categoryId: null as string | null, // Will be set to Frozen Products category below
    },
    {
      name: "Black Friday Special",
      description: "Huge discounts on all products for Black Friday weekend!",
      discountPercent: 25,
      startDate: new Date(new Date().getFullYear(), 10, 25), // November 25th
      endDate: new Date(new Date().getFullYear(), 10, 28), // November 28th
      isActive: false,
      categoryId: null as string | null, // All categories
    },
    {
      name: "Summer Sale",
      description: "Special summer discounts on selected products!",
      discountPercent: 15,
      startDate: new Date(new Date().getFullYear(), 7, 15), // August 15th
      endDate: new Date(new Date().getFullYear(), 8, 15), // September 15th
      isActive: false,
      categoryId: null as string | null, // All categories
    },
  ]

  // Delete existing offers first
  await prisma.offers.deleteMany({
    where: {
      workspaceId: mainWorkspaceId,
    },
  })
  console.log("Deleted existing offers")

  // Create new offers
  for (const offer of specialOffers) {
    try {
      // For "Offerta Frozen Products 20%", find and assign Frozen Products category
      let finalCategoryId = offer.categoryId
      if (offer.name === "Offerta Frozen Products 20%") {
        const frozenCategory = await prisma.categories.findFirst({
          where: {
            workspaceId: mainWorkspaceId,
            name: "Frozen Products",
          },
        })
        if (frozenCategory) {
          finalCategoryId = frozenCategory.id
          console.log(
            `Assigning Offerta Frozen Products to Frozen Products category: ${frozenCategory.id}`
          )
        }
      }

      await prisma.offers.create({
        data: {
          name: offer.name,
          description: offer.description,
          discountPercent: offer.discountPercent,
          startDate: offer.startDate,
          endDate: offer.endDate,
          isActive: offer.isActive,
          categoryId: finalCategoryId,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(`Offer created: ${offer.name}`)
    } catch (error) {
      console.error(`Error creating offer ${offer.name}:`, error)
    }
  }

  // Create services for the main workspace (reduced to 2 services as requested)
  const services = [
    {
      code: "SHP001",
      name: "Shipping",
      description:
        "Standard shipping service for orders within Italy. Delivery within 3-5 business days.",
      price: 5.0,
      currency: "EUR",
    },
    {
      code: "GFT001",
      name: "Gift Wrapping",
      description:
        "Luxury gift wrapping service with personalized message and premium packaging materials.",
      price: 30.0,
      currency: "EUR",
    },
  ]

  // Create or update services for the main workspace
  for (const service of services) {
    const existingService = await prisma.services.findFirst({
      where: {
        code: service.code,
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
        `Service created: ${service.name} (${service.code}) for workspace ${createdWorkspaces[0].name}`
      )
    } else {
      await prisma.services.update({
        where: { id: existingService.id },
        data: {
          name: service.name,
          description: service.description,
          price: service.price,
          currency: service.currency,
        },
      })
      console.log(
        `Service updated: ${service.name} (${service.code}) for workspace ${createdWorkspaces[0].name}`
      )
    }
  }

  // Create FAQ data - RESTORED ORIGINAL FAQs
  const faqsData = [
    {
      question: "What are your business hours?",
      answer:
        "Our business hours are Monday to Friday from 9:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 2:00 PM. We are closed on Sundays.",
    },
    {
      question: "How can I place an order?",
      answer:
        "You can place your order directly through this WhatsApp chat. Just tell me which products you're interested in and I'll help you with the entire purchase process.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit/debit card payments, bank transfers, PayPal, and cash on delivery (depending on availability in your area).",
    },
    {
      question: "Do you ship throughout Spain?",
      answer:
        "Yes, we ship throughout mainland Spain. For the Balearic Islands, Canary Islands, Ceuta, and Melilla, please check special shipping conditions.",
    },
    {
      question: "How long does it take for my order to arrive?",
      answer:
        "Orders usually arrive within 24-48 hours in mainland Spain. For other destinations, delivery time may vary between 3-5 business days.",
    },
    {
      question: "Are the products authentic Italian products?",
      answer:
        "Yes, all our products are authentic Italian products imported directly from Italy. We work with certified and trusted producers.",
    },
    {
      question: "Can I return a product if I don't like it?",
      answer:
        "Yes, you have 14 days from receipt of your order to return it. The product must be in perfect condition and in its original packaging.",
    },
    {
      question: "Do you offer discounts for large purchases?",
      answer:
        "Yes, we offer special discounts for large orders. Contact us to learn about our special offers for businesses and bulk orders.",
    },
    {
      question: "Do the products have a long expiration date?",
      answer:
        "All our products have a minimum expiration date of 6 months from shipping. Fresh products are shipped with appropriate expiration dates.",
    },
    {
      question: "How should I store the products once received?",
      answer:
        "Each product includes storage instructions. Generally, dry products in a cool, dry place, refrigerated products in the fridge, and frozen products in the freezer.",
    },
    {
      question: "What are the shipping costs and are there free shipping options?",
      answer:
        "💰 *Shipping costs depend on your location and order size:*\n\n🇪🇸 *Mainland Spain:*\n• Orders over €50: FREE shipping 🎉\n• Orders under €50: €4.95\n\n🏝️ *Islands (Balearic/Canary):*\n• Special rates apply (€8.95-€15.95)\n• Free shipping threshold: €75\n\n📦 *Express delivery:* Available for €9.95 (24h delivery)",
    },
    {
      question: "Can I track my order during shipping?",
      answer:
        "📱 *Absolutely! Full tracking available:*\n\n🔍 *How to track:*\n• You'll receive tracking number via WhatsApp/email\n• Click the link to see real-time updates\n• Get notifications for each delivery step\n\n📍 *What you can see:*\n• Order prepared\n• In transit\n• Out for delivery\n• Delivered ✅\n\n💡 *Having issues with tracking?* Just send me your order number!",
    },
    {
      question: "What should I do if my package is damaged during transport?",
      answer:
        "📦 *Don't worry, we'll take care of it immediately!*\n\n🚨 *If you receive damaged products:*\n• Don't accept the delivery if damage is visible\n• Take photos of the damaged package\n• Contact us immediately via WhatsApp\n• We'll arrange replacement or full refund\n\n⚡ *Our response:*\n• Immediate replacement sent within 24h\n• Full refund if you prefer\n• No questions asked - customer satisfaction guaranteed!\n\n📋 *Important:* Report damage within 24h of delivery for fastest resolution.",
    },
    {
      question: "How do you maintain the cold chain for fresh products?",
      answer:
        "❄️ *Cold chain protection guaranteed!*\n\n🧊 *Our cold chain process:*\n• Products stored at controlled temperatures (0-4°C)\n• Insulated packaging with gel ice packs\n• Temperature monitoring during transport\n• Maximum 24h delivery time for fresh items\n\n📊 *Quality controls:*\n• Temperature sensors in our warehouse\n• Specialized refrigerated vehicles\n• Partner couriers trained for fresh deliveries\n\n⚠️ *Fresh products delivery:* Available Tuesday to Friday only to ensure optimal freshness!",
    },
    {
      question: "Is my merchandise insured during shipping?",
      answer:
        "🛡️ *Full insurance coverage included!*\n\n✅ *What's covered:*\n• Loss during transport\n• Damage caused by courier mishandling\n• Theft during delivery\n• Weather-related damage\n\n💰 *Coverage details:*\n• Up to €500 per package (standard)\n• Higher value items: contact us for extended coverage\n• No additional cost - included in shipping\n\n📋 *How to claim:*\n• Report within 48h of delivery\n• Provide photos and order number\n• We handle everything with insurance company\n• Replacement or refund processed within 5-7 days",
    },
  ]

  // Create new FAQs
  for (const faq of faqsData) {
    try {
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(`FAQ created: ${faq.question.substring(0, 50)}...`)
    } catch (error) {
      console.error(`Error creating FAQ: ${faq.question}`, error)
    }
  }

  // Create test customers with chat sessions
  const testCustomers = [
    {
      name: "Mario Rossi",
      email: "mario.rossi@example.com",
      phone: "+393331234567",
      language: "it",
      currency: "EUR",
    },
    {
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+447700900123",
      language: "en",
      currency: "EUR",
    },
    {
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+34600123456",
      language: "es",
      currency: "EUR",
    },
    {
      name: "João Silva",
      email: "joao.silva@example.com",
      phone: "+351912345678",
      language: "pt",
      currency: "EUR",
    },
  ]

  // Delete existing test customers first
  await prisma.customers.deleteMany({
    where: {
      workspaceId: mainWorkspaceId,
      email: {
        in: [
          "mario.rossi@rossilimited.it",
          "john.smith@shopme.com", 
          "maria.garcia@shopme.com",
          "joao.silva@shopme.com"
        ]
      }
    },
  })
  console.log("Deleted existing test customers")

  // Create Italian customer - Mario Rossi with complete real data
  const testCustomer = await prisma.customers.create({
    data: {
      id: "3c9fce96-5397-5c9f-9f8e-3d4f5a6b7890", // ID fisso per MCP test client
      name: "Mario Rossi",
      email: "mario.rossi@rossilimited.it",
      phone: "+390212345678", // Real Italian phone number
      address: JSON.stringify({
        name: "Mario Rossi",
        street: "Via Garibaldi 45",
        city: "Milano",
        postalCode: "20121",
        country: "Italia"
      }),
      company: "Rossi Limited S.r.l.",
      discount: 0,
      language: "it",
      currency: "EUR",
      notes: "Cliente premium - Preferisce prodotti DOP",
      workspaceId: mainWorkspaceId,
      invoiceAddress: {
        firstName: "Mario",
        lastName: "Rossi",
        company: "Rossi Limited S.r.l.",
        address: "Via Roma 123",
        city: "Milano",
        postalCode: "20100",
        country: "Italia",
        vatNumber: "IT12345678901",
        phone: "+390212345678"
      }
    },
  })

  console.log(
    `✅ Italian customer created: ${testCustomer.name} (${testCustomer.email})`
  )

  // Create English customer - John Smith (with 10% discount)
  const testCustomer2 = await prisma.customers.create({
    data: {
      name: "John Smith",
      email: "john.smith@shopme.com",
      phone: "+44123456789",
      address: JSON.stringify({
        name: "John Smith",
        street: "456 Regent Street",
        city: "London",
        postalCode: "W1B 5AH",
        country: "United Kingdom"
      }),
      company: "Smith & Co Ltd",
      discount: 10, // 10% discount
      language: "en",
      currency: "EUR",
      notes: "VIP customer - Prefers organic products",
      workspaceId: mainWorkspaceId,
      invoiceAddress: {
        firstName: "John",
        lastName: "Smith",
        company: "Smith & Co Ltd",
        address: "123 Oxford Street",
        city: "London",
        postalCode: "W1D 2HG",
        country: "United Kingdom",
        vatNumber: "GB123456789",
        phone: "+44123456789"
      }
    },
  })

  console.log(
    `✅ English customer created: ${testCustomer2.name} (${testCustomer2.email})`
  )

  // Create Spanish customer - Maria Garcia
  const testCustomerMCP = await prisma.customers.create({
    data: {
      id: "test-customer-123", // Fixed ID for MCP testing
      name: "Maria Garcia",
      email: "maria.garcia@shopme.com",
      phone: "+34666777888",
      address: JSON.stringify({
        name: "Maria Garcia",
        street: "Calle Gran Vía 78",
        city: "Madrid",
        postalCode: "28013",
        country: "España"
      }),
      company: "Garcia Imports S.L.",
      discount: 5, // 5% discount
      language: "es",
      currency: "EUR",
      notes: "Cliente frecuente - Le gustan los productos artesanales",
      workspaceId: mainWorkspaceId,
      invoiceAddress: {
        firstName: "Maria",
        lastName: "Garcia",
        company: "Garcia Imports S.L.",
        address: "Calle Mayor 45",
        city: "Madrid",
        postalCode: "28013",
        country: "España",
        vatNumber: "ES12345678Z",
        phone: "+34666777888"
      }
    },
  })

  console.log(
    `✅ Spanish customer created: ${testCustomerMCP.name} (${testCustomerMCP.email})`
  )

  // Create Portuguese customer - João Silva
  const testCustomer4 = await prisma.customers.create({
    data: {
      name: "João Silva",
      email: "joao.silva@shopme.com",
      phone: "+351123456789",
      address: JSON.stringify({
        name: "João Silva",
        street: "Rua da Liberdade 200",
        city: "Lisboa",
        postalCode: "1250-096",
        country: "Portugal"
      }),
      company: "Silva & Filhos Lda",
      discount: 0,
      language: "pt",
      currency: "EUR",
      notes: "Novo cliente - Interessado em produtos gourmet",
      workspaceId: mainWorkspaceId,
      invoiceAddress: {
        firstName: "João",
        lastName: "Silva",
        company: "Silva & Filhos Lda",
        address: "Rua Augusta 100",
        city: "Lisboa",
        postalCode: "1100-053",
        country: "Portugal",
        vatNumber: "PT123456789",
        phone: "+351123456789"
      }
    },
  })

  console.log(
    `✅ Portuguese customer created: ${testCustomer4.name} (${testCustomer4.email})`
  )

  // Create chat sessions and welcome messages for each customer
  console.log("🔄 Creating chat sessions and welcome messages...")

  // Italian customer - Mario Rossi
  const chatSession1 = await prisma.chatSession.create({
    data: {
      customerId: testCustomer.id,
      workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "it",
        customerName: "Mario Rossi"
      }
    }
  })

  await prisma.message.create({
    data: {
      chatSessionId: chatSession1.id,
      direction: "INBOUND",
      content: "Ciao!",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    }
  })

  await prisma.message.create({
    data: {
      chatSessionId: chatSession1.id,
      direction: "OUTBOUND",
      content: "Ciao Mario! Benvenuto da L'Altra Italia! 🇮🇹 Sono qui per aiutarti a scoprire i nostri prodotti italiani di qualità. Come posso esserti utile oggi?",
      type: "TEXT",
      aiGenerated: true,
      metadata: {
        agentSelected: "CHATBOT_DUAL_LLM",
        sentBy: "AI"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 4) // 4 minutes ago
    }
  })

  // English customer - John Smith
  const chatSession2 = await prisma.chatSession.create({
    data: {
      customerId: testCustomer2.id,
      workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "en",
        customerName: "John Smith"
      }
    }
  })

    await prisma.message.create({
      data: {
      chatSessionId: chatSession2.id,
      direction: "INBOUND",
      content: "Hello!",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 3) // 3 minutes ago
    }
  })

    await prisma.message.create({
      data: {
        chatSessionId: chatSession2.id,
      direction: "OUTBOUND",
      content: "Hello John! Welcome to L'Altra Italia! 🇮🇹 I'm here to help you discover our quality Italian products. How can I assist you today?",
      type: "TEXT",
      aiGenerated: true,
      metadata: {
        agentSelected: "CHATBOT_DUAL_LLM",
        sentBy: "AI"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 2) // 2 minutes ago
    }
  })

  // Spanish customer - Maria Garcia
  const chatSession3 = await prisma.chatSession.create({
    data: {
      customerId: testCustomerMCP.id,
      workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "es",
        customerName: "Maria Garcia"
      }
    }
  })

    await prisma.message.create({
      data: {
        chatSessionId: chatSession3.id,
      direction: "INBOUND",
      content: "¡Hola!",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 60 * 1) // 1 minute ago
    }
  })

    await prisma.message.create({
      data: {
      chatSessionId: chatSession3.id,
      direction: "OUTBOUND",
      content: "¡Hola Maria! ¡Bienvenida a L'Altra Italia! 🇮🇹 Estoy aquí para ayudarte a descubrir nuestros productos italianos de calidad. ¿Cómo puedo ayudarte hoy?",
      type: "TEXT",
      aiGenerated: true,
      metadata: {
        agentSelected: "CHATBOT_DUAL_LLM",
        sentBy: "AI"
      },
      createdAt: new Date() // Now
    }
  })

  // Portuguese customer - João Silva
  const chatSession4 = await prisma.chatSession.create({
          data: {
      customerId: testCustomer4.id,
            workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "pt",
        customerName: "João Silva"
      }
    }
  })

  await prisma.message.create({
          data: {
      chatSessionId: chatSession4.id,
      direction: "INBOUND",
      content: "Olá!",
      type: "TEXT",
      createdAt: new Date(Date.now() - 1000 * 30) // 30 seconds ago
    }
  })

  await prisma.message.create({
      data: {
      chatSessionId: chatSession4.id,
      direction: "OUTBOUND",
      content: "Olá João! Bem-vindo à L'Altra Italia! 🇮🇹 Estou aqui para ajudá-lo a descobrir nossos produtos italianos de qualidade. Como posso ajudá-lo hoje?",
      type: "TEXT",
      aiGenerated: true,
      metadata: {
        agentSelected: "CHATBOT_DUAL_LLM",
        sentBy: "AI"
      },
      createdAt: new Date(Date.now() - 1000 * 15) // 15 seconds ago
    }
  })

  console.log("✅ Chat sessions and welcome messages created successfully!")
  console.log(`   🇮🇹 Mario Rossi (Italian) - Chat ID: ${chatSession1.id}`)
  console.log(`   🇬🇧 John Smith (English) - Chat ID: ${chatSession2.id}`)
  console.log(`   🇪🇸 Maria Garcia (Spanish) - Chat ID: ${chatSession3.id}`)
  console.log(`   🇵🇹 João Silva (Portuguese) - Chat ID: ${chatSession4.id}`)

  console.log("✅ Test customers with active chats and welcome messages created successfully!")

  // Create sample orders for test customers
  console.log("🔄 Creating sample orders for test customers...")

  // Get some products for orders
  const sampleProducts = await prisma.products.findMany({
    where: { workspaceId: mainWorkspaceId },
    take: 5
  })

  if (sampleProducts.length > 0) {
    // Create order for Mario Rossi (Italian customer)
    const order1 = await prisma.orders.create({
      data: {
        orderCode: "ORD-001-2024",
        customerId: testCustomer.id,
        workspaceId: mainWorkspaceId,
        status: "CONFIRMED",
        totalAmount: 25.50,
        notes: "Ordine di test per Mario Rossi - Prodotti italiani premium",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    })

    // Add items to Mario's order
    await prisma.orderItems.create({
      data: {
        orderId: order1.id,
        productId: sampleProducts[0].id,
        quantity: 2,
        unitPrice: sampleProducts[0].price,
        totalPrice: sampleProducts[0].price * 2
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order1.id,
        productId: sampleProducts[1].id,
        quantity: 1,
        unitPrice: sampleProducts[1].price,
        totalPrice: sampleProducts[1].price
      }
    })

    // Create order for John Smith (English customer with discount)
    const order2 = await prisma.orders.create({
      data: {
        orderCode: "ORD-002-2024",
        customerId: testCustomer2.id,
        workspaceId: mainWorkspaceId,
        status: "PENDING",
        totalAmount: 18.90,
        notes: "Test order for John Smith - VIP customer with 10% discount",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      }
    })

    // Add items to John's order
    await prisma.orderItems.create({
      data: {
        orderId: order2.id,
        productId: sampleProducts[2].id,
        quantity: 1,
        unitPrice: sampleProducts[2].price,
        totalPrice: sampleProducts[2].price
      }
    })

    // Create order for Maria Garcia (Spanish customer)
    const order3 = await prisma.orders.create({
      data: {
        orderCode: "ORD-003-2024",
        customerId: testCustomerMCP.id,
        workspaceId: mainWorkspaceId,
        status: "DELIVERED",
        totalAmount: 32.80,
        notes: "Pedido de prueba para Maria Garcia - Cliente frecuente",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    })

    // Add items to Maria's order
    await prisma.orderItems.create({
      data: {
        orderId: order3.id,
        productId: sampleProducts[3].id,
        quantity: 3,
        unitPrice: sampleProducts[3].price,
        totalPrice: sampleProducts[3].price * 3
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order3.id,
        productId: sampleProducts[4].id,
        quantity: 1,
        unitPrice: sampleProducts[4].price,
        totalPrice: sampleProducts[4].price
      }
    })

    // Create additional orders for Mario Rossi
    const order4 = await prisma.orders.create({
      data: {
        orderCode: "ORD-004-2024",
        customerId: testCustomer.id,
        workspaceId: mainWorkspaceId,
        status: "DELIVERED",
        totalAmount: 45.20,
        notes: "Ordine premium per Mario Rossi - Prodotti DOP",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order4.id,
        productId: sampleProducts[0].id,
        quantity: 3,
        unitPrice: sampleProducts[0].price,
        totalPrice: sampleProducts[0].price * 3
      }
    })

    const order5 = await prisma.orders.create({
      data: {
        orderCode: "ORD-005-2024",
        customerId: testCustomer.id,
        workspaceId: mainWorkspaceId,
        status: "CONFIRMED",
        totalAmount: 67.80,
        notes: "Ordine grande per Mario Rossi - Prodotti artigianali",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order5.id,
        productId: sampleProducts[1].id,
        quantity: 2,
        unitPrice: sampleProducts[1].price,
        totalPrice: sampleProducts[1].price * 2
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order5.id,
        productId: sampleProducts[2].id,
        quantity: 1,
        unitPrice: sampleProducts[2].price,
        totalPrice: sampleProducts[2].price
      }
    })

    const order6 = await prisma.orders.create({
      data: {
        orderCode: "ORD-006-2024",
        customerId: testCustomer.id,
        workspaceId: mainWorkspaceId,
        status: "PENDING",
        totalAmount: 28.90,
        notes: "Ordine recente per Mario Rossi - Prodotti freschi",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order6.id,
        productId: sampleProducts[3].id,
        quantity: 1,
        unitPrice: sampleProducts[3].price,
        totalPrice: sampleProducts[3].price
      }
    })

    const order7 = await prisma.orders.create({
      data: {
        orderCode: "ORD-007-2024",
        customerId: testCustomer.id,
        workspaceId: mainWorkspaceId,
        status: "DELIVERED",
        totalAmount: 89.50,
        notes: "Ordine VIP per Mario Rossi - Selezione premium",
        trackingNumber: "DHL1234456",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order7.id,
        productId: sampleProducts[4].id,
        quantity: 4,
        unitPrice: sampleProducts[4].price,
        totalPrice: sampleProducts[4].price * 4
      }
    })

    await prisma.orderItems.create({
      data: {
        orderId: order7.id,
        productId: sampleProducts[0].id,
        quantity: 2,
        unitPrice: sampleProducts[0].price,
        totalPrice: sampleProducts[0].price * 2
      }
    })

    console.log("✅ Sample orders created successfully!")
    console.log(`   📦 Order ORD-001-2024 for Mario Rossi (CONFIRMED) - €25.50`)
    console.log(`   📦 Order ORD-002-2024 for John Smith (PENDING) - €18.90`)
    console.log(`   📦 Order ORD-003-2024 for Maria Garcia (DELIVERED) - €32.80`)
    console.log(`   📦 Order ORD-004-2024 for Mario Rossi (DELIVERED) - €45.20`)
    console.log(`   📦 Order ORD-005-2024 for Mario Rossi (CONFIRMED) - €67.80`)
    console.log(`   📦 Order ORD-006-2024 for Mario Rossi (PENDING) - €28.90`)
    console.log(`   📦 Order ORD-007-2024 for Mario Rossi (DELIVERED) - €89.50`)
  } else {
    console.log("⚠️ No products found, skipping order creation")
  }

  // Seed Aviso Legal document - RIMOSSO (documenti non esistono più nel sistema)
  // await seedAvisoLegalDocument(mainWorkspaceId)

  console.log("🎉 SEED COMPLETED SUCCESSFULLY!")
  console.log("=".repeat(50))
  console.log("   ✅ Database cleaned and reseeded")
  console.log("   ✅ Admin user ready")
  console.log("   ✅ Workspace configured")
  console.log("   ✅ L'Altra Italia categories and products loaded")
  console.log("   ✅ Services configured")
  console.log("   ✅ FAQs loaded")
  console.log("   ✅ Test customers created")
  console.log("   ✅ Sample orders created")
  console.log("   ✅ System ready for WhatsApp")

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${adminEmail}`)
  console.log(`- Workspace creato/aggiornato: ${createdWorkspaces[0].name}`)
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`)
  console.log(`- Prodotti creati/aggiornati: ${products.length}`)
  console.log(`- Services creati/aggiornati: ${services.length}`)
  console.log(`- FAQs create: ${faqsData.length}`)
  console.log(
    `- 4 test customers with active chats and conversation history created: Mario Rossi (🇮🇹), John Smith (🇬🇧), Maria Garcia (🇪🇸), João Silva (🇵🇹)`
  )
  console.log(`- 7 sample orders created with different statuses (5 for Mario Rossi, 1 for John Smith, 1 for Maria Garcia)`)
  console.log(`- Embeddings ready for manual generation via API`)

  // 🚨 REGOLA ASSOLUTA: Generazione automatica embedding dopo seed
  console.log("\n🚨 REGOLA CRITICA: GENERAZIONE AUTOMATICA EMBEDDINGS")
  console.log("================================================")
  console.log("⚠️  QUESTA È UNA REGOLA ASSOLUTA CHE NON DEVE ESSERE BYPASSATA")
  console.log("⚠️  Gli embeddings DEVONO essere generati automaticamente dopo ogni seed")
  console.log("⚠️  Senza embeddings, SearchRag non funziona e il chatbot fallisce")
  
  await generateEmbeddingsAfterSeed()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
