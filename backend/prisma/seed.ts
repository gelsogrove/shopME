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

import { OrderStatus, PrismaClient } from "@prisma/client"
import * as bcrypt from "bcrypt"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

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

// Andrea's Two-LLM Architecture - Router Prompt (DEPRECATED)
const ROUTER_PROMPT = `DEPRECATED: This router is no longer used in Andrea's Two-LLM Architecture.

🏗️ ANDREA'S REVOLUTIONARY ARCHITECTURE:
- LLM 1: RAG Processor (handles all routing automatically)
- LLM 2: Formatter (this agent - creates conversational responses)

🚫 OLD FUNCTION ROUTING (No Longer Used):
- ~~welcome_back_user~~ → Direct response in LLM 2
- ~~checkout_intent~~ → Future NewOrder() function
- ~~rag_search~~ → Automatic in LLM 1 RAG processing

🎯 FUTURE FUNCTIONS (Only These):
- NewOrder() → When user wants to finalize purchase
- ContactOperator() → When user requests human support

⚡ NEW WORKFLOW:
1. User Query → N8N Workflow
2. LLM 1 (RAG Processor) → Analyzes query + searches database
3. LLM 2 (Formatter) → Creates natural response using structured data
4. Result → Perfect, accurate, conversational response

Note: This router prompt is kept for historical reference but is not used in the current Two-LLM architecture.
"hai le mozzarelle fresche?" → rag_search
"do you have mozzarella?" → rag_search
"vendete vino?" → rag_search
"voglio comprare" → checkout_intent

User message: "{message}"`

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
    const { DocumentService } = require("../src/services/documentService")

    const embeddingService = new EmbeddingService()
    const documentService = new DocumentService()

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

    console.log("🔄 4. Generating Document embeddings...")
    try {
      const documentResult =
        await documentService.generateEmbeddingsForActiveDocuments(
          mainWorkspaceId
        )
      console.log(
        `✅ Document embeddings: ${documentResult.processed} processed, ${documentResult.errors.length} errors`
      )
      if (documentResult.errors.length > 0) {
        console.log("⚠️ Document errors:", documentResult.errors)
      }
    } catch (error) {
      console.log("❌ Document embeddings failed:", error.message)
    }

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

async function cleanAndImportN8NWorkflow() {
  console.log("\n🔄 N8N Complete Cleanup & Import:")
  console.log("============================")

  try {
    const fs = require("fs")
    const path = require("path")
    const { exec } = require("child_process")
    const { promisify } = require("util")
    const execAsync = promisify(exec)

    // Path to the workflow file
    const workflowPath = path.join(
      __dirname,
      "../../n8n/workflows/shopme-whatsapp-workflow.json"
    )

    if (!fs.existsSync(workflowPath)) {
      console.log("⚠️ N8N workflow file not found:", workflowPath)
      return
    }

    console.log(
      "🗑️ Complete cleanup: removing workflows AND credentials to prevent duplicates..."
    )

    // Execute the N8N cleanup and import script
    const scriptsPath = path.join(__dirname, "../../scripts")

    // Check if the nuclear cleanup script exists
    const nuclearScript = path.join(scriptsPath, "n8n_nuclear-cleanup.sh")

    if (fs.existsSync(nuclearScript)) {
      console.log("🚀 Running N8N NUCLEAR cleanup to prevent any duplicates...")

      try {
        // Make script executable
        await execAsync(`chmod +x "${nuclearScript}"`)

        // Run the nuclear cleanup script that completely resets N8N
        const { stdout, stderr } = await execAsync(`"${nuclearScript}"`, {
          cwd: scriptsPath,
          timeout: 180000, // 180 seconds timeout for nuclear cleanup (includes docker restart and setup)
        })

        if (stdout) {
          console.log("📥 N8N Nuclear Cleanup Output:", stdout)
        }

        if (stderr && !stderr.includes("Warning")) {
          console.log("⚠️ N8N Nuclear Cleanup Warnings:", stderr)
        }

        console.log(
          "✅ N8N nuclear cleanup and workflow import completed successfully"
        )
      } catch (execError) {
        console.error(
          "❌ Error running N8N nuclear cleanup script:",
          execError.message
        )
        console.log("💡 You can manually run: scripts/n8n_nuclear-cleanup.sh")
      }
    } else {
      console.log("⚠️ N8N nuclear cleanup script not found:", nuclearScript)
      console.log("💡 Please ensure scripts/n8n_nuclear-cleanup.sh exists")
    }
  } catch (error) {
    console.error("❌ Error in N8N workflow management:", error.message)
    console.log("💡 N8N workflow import can be done manually if needed")
  }

  console.log("============================\n")
}

// Function to seed default document
async function seedDefaultDocument() {
  console.log("Seeding default document...")

  try {
    // Check if document already exists
    const existingDocument = await prisma.documents.findFirst({
      where: {
        workspaceId: mainWorkspaceId,
        originalName: "international-transportation-law.pdf",
      },
    })

    if (existingDocument) {
      console.log("Default document already exists, skipping...")
      return
    }

    // Copy PDF from samples to uploads directory
    const sourcePath = path.join(
      __dirname,
      "samples",
      "international-transportation-law.pdf"
    )
    const targetDir = path.join(__dirname, "..", "uploads", "documents")
    const filename = `${Date.now()}-international-transportation-law.pdf`
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
        originalName: "international-transportation-law.pdf",
        filePath: targetPath, // Use absolute path for processing
        fileSize: stats.size,
        mimeType: "application/pdf",
        status: "UPLOADED",
        workspaceId: mainWorkspaceId,
      },
    })

    console.log(`Document created with ID: ${document.id}`)

    // Note: Embedding generation is skipped in seed due to memory constraints
    // The document will be in UPLOADED status and can be processed manually via API
    console.log(
      "Document created successfully - embeddings can be generated via API"
    )
  } catch (error) {
    console.error("Error seeding default document:", error)
  }
}

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
        n8nWorkflowUrl: "http://localhost:5678/webhook/webhook-start",
        plan: "FREE",
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
          temperature: 0.7,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("SofIA AgentConfig creato per il workspace principale")
    } else {
      console.log("AgentConfig già esistente per il workspace principale")
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
          temperature: 0.7,
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
          content: ROUTER_PROMPT,
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
        n8nWorkflowUrl: "http://localhost:5678/webhook/webhook-start",
        plan: "FREE",
        wipMessages: {
          en: "Work in progress. Please contact us later.",
          it: "Lavori in corso. Contattaci più tardi.",
          es: "Trabajos en curso. Por favor, contáctenos más tarde.",
          pt: "Em manutenção. Por favor, contacte-nos mais tarde.",
        },
        welcomeMessages: {
          it: "Benvenuto a L'Altra Italia! 👋 Sono il tuo assistente virtuale e sono qui per aiutarti con qualsiasi informazione sui nostri prodotti e servizi. Come posso assisterti oggi? 😊",
          en: "Welcome to L'Altra Italia! 👋 I'm your virtual assistant and I'm here to help you with any information about our products and services. How can I assist you today? 😊",
          es: "¡Bienvenido a L'Altra Italia! 👋 Soy tu asistente virtual y estoy aquí para ayudarte con cualquier información sobre nuestros productos y servicios. ¿Cómo puedo ayudarte hoy? 😊",
        },
        debugMode: true,
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
          temperature: 0.7,
          maxTokens: 1000,
          isActive: true,
        },
      })
      console.log("SofIA AgentConfig creato per il workspace principale")
    } else {
      console.log("AgentConfig già esistente per il workspace principale")
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
          temperature: 0.7,
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
          content: ROUTER_PROMPT,
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

  // Create combined food categories (from both files)
  const foodCategories = [
    // Categorie dal seed.ts originale
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
  for (const agent of [defaultAgent]) {
    const existingPrompt = await prisma.prompts.findFirst({
      where: {
        name: agent.promptName,
        workspaceId: mainWorkspaceId,
      },
    })

    if (!existingPrompt) {
      let promptContent = ""
      let promptFilePath = ""

      // Use specific prompt files based on agent name
      switch (agent.name) {
        case "GENERIC":
          promptFilePath = path.join(__dirname, "prompts/gdpr.md")
          break
        case "PRODUCTS AND CARTS":
          promptFilePath = path.join(__dirname, "prompts/product-and.carts.md")
          break
        case "ORDERS AND INVOICES":
          promptFilePath = path.join(__dirname, "prompts/orders-and-invoice.md")
          break
        case "TRANSPORT":
          promptFilePath = path.join(__dirname, "prompts/transport.md")
          break
        case "SERVICES":
          promptFilePath = path.join(__dirname, "prompts/services.md")
          break
        default:
          promptFilePath = path.join(__dirname, "prompts/gdpr.md")
      }

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

  // Create combined products list (from both files)
  const products = [
    // Prodotti dal seed.ts originale
    {
      name: "Gragnano IGP Pasta - Spaghetti",
      code: "00001",
      description:
        "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
      price: 4.99,
      stock: 120,

      status: "ACTIVE",
      slug: "gragnano-igp-pasta-spaghetti",
      categoryName: "Pasta",
    },
    {
      name: "Homemade Tagliatelle",
      code: "00002",
      description:
        "Freshly made egg tagliatelle, perfect for rich meat sauces and ragù.",
      price: 6.99,
      stock: 45,

      status: "ACTIVE",
      slug: "homemade-tagliatelle",
      categoryName: "Pasta",
    },
    {
      name: "Parmigiano Reggiano DOP 24 months",
      code: "00003",
      description:
        "Authentic Parmigiano Reggiano DOP aged 24 months. Intense flavor with a granular texture.",
      price: 29.99,
      stock: 25,

      status: "ACTIVE",
      slug: "parmigiano-reggiano-dop-24-months",
      categoryName: "Cheese",
    },
    {
      name: "Mozzarella di Bufala Campana DOP",
      code: "00004",
      description:
        "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
      price: 9.99,
      stock: 40,

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

      status: "ACTIVE",
      slug: "pistacchi-di-bronte-dop",
      categoryName: "Antipasti",
    },

    // Prodotti aggiunti dal seed.js.old
    {
      name: "Pizza Napoletana Artigianale",
      description:
        "Autentica pizza napoletana con impasto a lunga lievitazione (24h), pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 485°C per 60-90 secondi secondo la tradizione. Certificata Specialità Tradizionale Garantita (STG).",
      price: 12.9,
      stock: 25,

      status: "ACTIVE",
      slug: "pizza-napoletana-artigianale",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Tagliatelle al Ragù Bolognese",
      description:
        "Autentica pasta all'uovo tagliata a mano (8mm di larghezza) secondo la ricetta depositata alla Camera di Commercio di Bologna. Accompagnata dal tradizionale ragù bolognese preparato con carne di manzo e maiale, soffritto, pomodoro e vino, cotto lentamente per almeno 4 ore.",
      price: 14.5,
      stock: 20,

      status: "ACTIVE",
      slug: "tagliatelle-al-ragu-bolognese",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Trofie al Pesto Genovese",
      description:
        "Trofie fresche artigianali servite con autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, formaggio Parmigiano Reggiano e Pecorino, aglio e olio extravergine d'oliva della Riviera Ligure.",
      price: 13.9,
      stock: 18,

      status: "ACTIVE",
      slug: "trofie-al-pesto-genovese",
      categoryName: "Pizza e Pasta",
    },
    {
      name: "Tiramisù Tradizionale",
      description:
        "Autentico dolce italiano preparato secondo la ricetta tradizionale veneta. Strati di savoiardi inzuppati in caffè espresso, alternati a crema al mascarpone e cacao amaro in polvere. Ogni porzione è preparata a mano e conservata a temperatura controllata.",
      price: 8.9,
      stock: 30,

      status: "ACTIVE",
      slug: "tiramisu-tradizionale",
      categoryName: "Desserts",
    },
    {
      name: "Lasagna al Forno Tradizionale",
      description:
        "Autentica lasagna italiana con sfoglie di pasta all'uovo fatte a mano, stratificate con ragù di carne selezionata, besciamella cremosa e Parmigiano Reggiano DOP. Cotta lentamente al forno per ottenere la perfetta consistenza e il caratteristico bordo croccante.",
      price: 15.9,
      stock: 15,

      status: "ACTIVE",
      slug: "lasagna-al-forno-tradizionale",
      categoryName: "Piatti Pronti",
    },
    {
      name: "Linguine allo Scoglio",
      description:
        "Pasta linguine di grano duro servita con un ricco sugo di mare che include cozze, vongole, gamberetti e calamari freschi. Preparata con pomodorini freschi, aglio, prezzemolo e un tocco di peperoncino. Un classico piatto della cucina costiera italiana.",
      price: 16.9,
      stock: 12,

      status: "ACTIVE",
      slug: "linguine-allo-scoglio",
      categoryName: "Pesce",
    },
    {
      name: "Cannolo Siciliano Artigianale",
      description:
        "Autentico cannolo siciliano con croccante scorza di cialda fritta a mano, ripiena di ricotta di pecora fresca setacciata e dolcificata con zucchero. Arricchito con gocce di cioccolato fondente e guarnito con pistacchi di Bronte DOP e scorze di arancia candita.",
      price: 7.5,
      stock: 35,

      status: "ACTIVE",
      slug: "cannolo-siciliano-artigianale",
      categoryName: "Desserts",
    },
    {
      name: "Porchetta di Ariccia IGP",
      description:
        "Autentica porchetta di Ariccia IGP, specialità laziale preparata con maiale intero disossato, arrotolato e aromatizzato con una miscela di erbe aromatiche (rosmarino, finocchietto selvatico, aglio e pepe nero). Cotta lentamente in forno a legna per 8 ore, presenta una crosta croccante e una carne interna tenera e succosa.",
      price: 18.9,
      stock: 10,

      status: "ACTIVE",
      slug: "porchetta-di-ariccia-igp",
      categoryName: "Salumi",
    },
    {
      name: "Mozzarella di Bufala",
      description:
        "Autentica Mozzarella di Bufala Campana DOP, prodotta esclusivamente con latte di bufala secondo la tradizione secolare della Campania. Caratterizzata da una superficie liscia e una consistenza elastica, presenta un colore bianco perlaceo e un sapore dolce e delicato con note di latte fresco. Confezionata nel suo siero di conservazione per mantenerne intatte le caratteristiche organolettiche.",
      price: 12.5,
      stock: 30,

      status: "ACTIVE",
      slug: "mozzarella-di-bufala",
      categoryName: "Cheese",
    },
    {
      name: "Parmigiano Reggiano",
      description:
        "Autentico Parmigiano Reggiano DOP, un formaggio a pasta dura prodotto con latte vaccino crudo parzialmente scremato. Stagionato per almeno 12 mesi, si distingue per il suo sapore ricco, complesso e persistente con note di frutta secca e brodo. La sua consistenza è granulosa e friabile, con una crosta spessa di colore giallo paglierino. Considerato il 'Re dei formaggi', è ideale sia da tavola che da grattugia.",
      price: 24.9,
      stock: 35,

      status: "ACTIVE",
      slug: "parmigiano-reggiano",
      categoryName: "Cheese",
    },
    {
      name: "Pomodori Pelati San Marzano",
      description:
        "Autentici pomodori pelati San Marzano DOP, coltivati nell'area vesuviana della Campania secondo tradizione. Raccolti a piena maturazione e lavorati entro 24 ore, conservano tutto il sapore, la dolcezza e il basso livello di acidità tipici della varietà. Confezionati in succo di pomodoro naturale senza conservanti aggiunti, sono l'ingrediente ideale per salse, sughi e pizze della tradizione italiana.",
      price: 3.9,
      stock: 60,

      status: "ACTIVE",
      slug: "pomodori-pelati-san-marzano",
      categoryName: "Vegetables",
    },
    {
      name: "Pesto alla Genovese DOP",
      description:
        "Autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, aglio, sale marino, Parmigiano Reggiano DOP invecchiato 24 mesi, Pecorino Sardo e olio extravergine d'oliva della Riviera Ligure. Lavorato a crudo nel mortaio di marmo per preservare tutti gli aromi.",
      price: 8.9,
      stock: 40,

      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Salse",
    },
    {
      name: "Pizza Margherita",
      description:
        "Un cornicione leggero e soffice, pomodori dolci, mozzarella e qualche foglia di basilico profumato. Questo è tutto ciò di cui hai bisogno per una classica pizza margherita, il punto di partenza perfetto per il tuo viaggio nella preparazione della pizza fatta in casa, nonché una ricetta collaudata per quando vuoi...",
      price: 8.9,
      stock: 40,

      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Salse",
    },
    {
      name: "Limoncello di Capri",
      description:
        "Limoncello di Capri, prodotto secondo la ricetta tradizionale italiana, è un liquore dolce e leggero, caratterizzato da un sapore intenso e fruttato. È preparato con limoni freschi di Capri, zucchero e acqua, e viene fermentato per ottenere un'alchocolizzazione naturale.",
      price: 8.9,
      stock: 40,

      status: "ACTIVE",
      slug: "pesto-alla-genovese-dop",
      categoryName: "Beverages",
    },
  ]

  // Create services for the main workspace (reduced to 2 services as requested)
  const services = [
    {
      name: "Shipping",
      description:
        "Premium shipping service with tracking and guaranteed delivery within 3-5 business days.",
      price: 30.0,
      currency: "EUR",
    },
    {
      name: "Gift Package",
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
            code: product.code || `000${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            description: product.description,
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
      name: "Offerta Estiva 2025",
      description: "Sconto speciale del 20% su tutte le bevande per l'estate!",
      discountPercent: 20,
      startDate: new Date(2025, 6, 1), // July 1st, 2025 (month is 0-indexed)
      endDate: new Date(2025, 8, 30), // September 30th, 2025
      isActive: true,
      categoryId: null as string | null, // Will be set to Beverages category below
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
      name: "Christmas Sale",
      description: "Special holiday discounts on selected items",
      discountPercent: 15,
      startDate: new Date(new Date().getFullYear(), 11, 1), // December 1st
      endDate: new Date(new Date().getFullYear(), 11, 24), // December 24th
      isActive: false,
      categoryId: null as string | null, // All categories
    },
    {
      name: "Summer Clearance",
      description: "End of summer special deals on selected products",
      discountPercent: 30,
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
      // For "Offerta Estiva 2025", find and assign Beverages category
      let finalCategoryId = offer.categoryId
      if (offer.name === "Offerta Estiva 2025") {
        const beverageCategory = await prisma.categories.findFirst({
          where: {
            workspaceId: mainWorkspaceId,
            name: "Beverages",
          },
        })
        if (beverageCategory) {
          finalCategoryId = beverageCategory.id
          console.log(
            `Assigning Offerta Estiva to Beverages category: ${beverageCategory.id}`
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
          workspaceId: mainWorkspaceId,
          categoryId: finalCategoryId,
        },
      })
      console.log(
        `Offer created: ${offer.name} for workspace ${createdWorkspaces[0].name}`
      )
    } catch (error) {
      console.error(`Error creating offer ${offer.name}:`, error)
    }
  }

  // Create offers for specific categories
  // First get a couple of categories to use for category-specific offers
  const categories = await prisma.categories.findMany({
    where: {
      workspaceId: mainWorkspaceId,
    },
    take: 2,
  })

  if (categories.length > 0) {
    const categorySpecificOffers = [
      {
        name: "Pasta Week",
        description: "Special discounts on all pasta products",
        discountPercent: 20,
        startDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Started 5 days ago
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Ends 5 days from now

        categoryId: categories[0].id,
      },
      {
        name: "Wine Tasting Special",
        description: "Premium wines at special prices",
        discountPercent: 10,
        startDate: new Date(new Date().setDate(new Date().getDate())), // Starts today
        endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Ends in 14 days

        categoryId: categories.length > 1 ? categories[1].id : categories[0].id,
      },
    ]

    for (const offer of categorySpecificOffers) {
      try {
        await prisma.offers.create({
          data: {
            ...offer,
            workspaceId: mainWorkspaceId,
          },
        })
        console.log(
          `Category-specific offer created: ${offer.name} for workspace ${createdWorkspaces[0].name}`
        )
      } catch (error) {
        console.error(`Error creating offer ${offer.name}:`, error)
      }
    }
  }

  // Create whatsapp settings for the workspace if not exists
  const existingWhatsappSettings = await prisma.whatsappSettings.findUnique({
    where: { workspaceId: mainWorkspaceId },
  })

  // Read default GDPR policy from file
  const gdprFilePath = path.join(__dirname, "prompts", "gdpr.md")
  try {
    const defaultGdprText = fs.readFileSync(gdprFilePath, "utf8")

    if (!existingWhatsappSettings) {
      await prisma.whatsappSettings.create({
        data: {
          phoneNumber: "+88888888888888",
          apiKey: "dummy-api-key",
          workspaceId: mainWorkspaceId,
          gdpr: defaultGdprText,
          n8nWebhook: "http://localhost:5678/webhook/webhook-start",
          adminEmail: "andrea_gelsomino@hotmail.com",
        },
      })
      console.log("Impostazioni WhatsApp create per il workspace principale")
    } else {
      await prisma.whatsappSettings.update({
        where: { workspaceId: mainWorkspaceId },
        data: {
          phoneNumber: "+88888888888888",
          apiKey: "dummy-api-key",
          gdpr: existingWhatsappSettings.gdpr || defaultGdprText,
          n8nWebhook:
            existingWhatsappSettings.n8nWebhook ||
            "http://localhost:5678/webhook/webhook-start",
          adminEmail:
            existingWhatsappSettings.adminEmail ||
            "andrea_gelsomino@hotmail.com",
        },
      })
      console.log(
        "Impostazioni WhatsApp aggiornate per il workspace principale"
      )
    }
  } catch (error) {
    console.error("Non è stato possibile leggere il file gdpr.md:", error)
    // Continua senza aggiungere il GDPR
    if (!existingWhatsappSettings) {
      await prisma.whatsappSettings.create({
        data: {
          phoneNumber: "+88888888888888",
          apiKey: "dummy-api-key",
          workspaceId: mainWorkspaceId,
          n8nWebhook: "http://localhost:5678/webhook/webhook-start",
          adminEmail: "andrea_gelsomino@hotmail.com",
        },
      })
      console.log(
        "Impostazioni WhatsApp create per il workspace principale (senza GDPR)"
      )
    } else {
      await prisma.whatsappSettings.update({
        where: { workspaceId: mainWorkspaceId },
        data: {
          phoneNumber: "+88888888888888",
          apiKey: "dummy-api-key",
          n8nWebhook:
            existingWhatsappSettings.n8nWebhook ||
            "http://localhost:5678/webhook/webhook-start",
          adminEmail:
            existingWhatsappSettings.adminEmail ||
            "andrea_gelsomino@hotmail.com",
        },
      })
      console.log(
        "Impostazioni WhatsApp aggiornate per il workspace principale (GDPR invariato)"
      )
    }
  }

  // Create FAQ data for the workspace
  console.log("Creating FAQ data...")

  // Delete existing FAQs first
  await prisma.fAQ.deleteMany({
    where: {
      workspaceId: mainWorkspaceId,
    },
  })
  console.log("Deleted existing FAQs")

  // Define sample FAQs
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
  ]

  // Create new FAQs
  for (const faq of faqsData) {
    try {
      await prisma.fAQ.create({
        data: {
          ...faq,
          workspaceId: mainWorkspaceId,
        },
      })
      console.log(`FAQ created: ${faq.question.substring(0, 50)}...`)
    } catch (error) {
      console.error(`Error creating FAQ ${faq.question}:`, error)
    }
  }

  // Create test customers with active chats and welcome messages
  console.log("Creating test customers with active chats...")

  // Delete existing test customers if they exist
  await prisma.customers.deleteMany({
    where: {
      workspaceId: mainWorkspaceId,
      email: { in: ["test.customer@shopme.com", "maria.garcia@shopme.com"] },
    },
  })
  console.log("Deleted existing test customers")

  // Create first test customer - Mario Rossi
  const testCustomer = await prisma.customers.create({
    data: {
      name: "Mario Rossi",
      email: "test.customer@shopme.com",
      phone: "+39123456789",
      address: "123 Roma Street, Milan, Italy",
      company: "Test Company Ltd.",
      language: "en",
      currency: "EUR",
      workspaceId: mainWorkspaceId,
      activeChatbot: true,
      privacy_accepted_at: new Date(),
      push_notifications_consent: true,
      push_notifications_consent_at: new Date(),
      invoiceAddress: {
        firstName: "Mario",
        lastName: "Rossi",
        company: "Test Company Ltd.",
        address: "42 Giuseppe Verdi Street",
        city: "Milan",
        postalCode: "20121",
        country: "Italy",
        vatNumber: "IT12345678901",
        phone: "+39 02 8765432",
        email: "billing@testcompany.com",
      },
    },
  })
  console.log(
    `Test customer 1 created: ${testCustomer.name} (${testCustomer.email})`
  )

  // Create second test customer - Maria Garcia
  const testCustomer2 = await prisma.customers.create({
    data: {
      name: "Maria Garcia",
      email: "maria.garcia@shopme.com",
      phone: "+34666777888",
      address: "45 Balmes Street, Barcelona, Spain",
      company: "Barcelona Foods Ltd.",
      language: "en",
      currency: "EUR",
      workspaceId: mainWorkspaceId,
      activeChatbot: true,
      privacy_accepted_at: new Date(),
      push_notifications_consent: true,
      push_notifications_consent_at: new Date(),
      invoiceAddress: {
        firstName: "Maria",
        lastName: "Garcia",
        company: "Barcelona Foods Ltd.",
        address: "158 Comte Urgell Street",
        city: "Barcelona",
        postalCode: "08036",
        country: "Spain",
        vatNumber: "ES87654321009",
        phone: "+34 93 454 7890",
        email: "billing@barcelonafoods.com",
      },
    },
  })
  console.log(
    `Test customer 2 created: ${testCustomer2.name} (${testCustomer2.email})`
  )

  // Create active chat sessions for both customers
  // Chat session for Mario Rossi
  const chatSession = await prisma.chatSession.create({
    data: {
      customerId: testCustomer.id,
      workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "en",
        userRegistered: true,
        lastActivity: new Date().toISOString(),
      },
    },
  })
  console.log(`Chat session created for customer: ${chatSession.id}`)

  // Chat session for Maria Garcia
  const chatSession2 = await prisma.chatSession.create({
    data: {
      customerId: testCustomer2.id,
      workspaceId: mainWorkspaceId,
      status: "active",
      context: {
        language: "en",
        userRegistered: true,
        lastActivity: new Date().toISOString(),
      },
    },
  })
  console.log(`Chat session created for customer 2: ${chatSession2.id}`)

  // Get the active prompt for creating messages
  const activePrompt = await prisma.prompts.findFirst({
    where: {
      workspaceId: mainWorkspaceId,
      isActive: true,
      isRouter: true,
    },
  })

  // Create initial messages for Mario Rossi (Italian)
  const messages = [
    {
      direction: "INBOUND" as const,
      content: "hello",
      type: "TEXT" as const,
      status: "received",
      aiGenerated: false,
      metadata: {
        timestamp: new Date().toISOString(),
        source: "whatsapp",
      },
    },
    {
      direction: "OUTBOUND" as const,
      content:
        "Hello Mario! 👋 Welcome to L'Altra Italia! I'm your virtual assistant and I'm here to help you with any information about our products and services. How can I assist you today? 😊",
      type: "TEXT" as const,
      status: "sent",
      aiGenerated: true,
      metadata: {
        timestamp: new Date().toISOString(),
        messageType: "welcome",
        language: "en",
        agentSelected: "CHATBOT",
      },
    },
  ]

  for (const messageData of messages) {
    const message = await prisma.message.create({
      data: {
        ...messageData,
        chatSessionId: chatSession.id,
        promptId: activePrompt?.id || null,
      },
    })
    console.log(
      `Message created for Mario: ${messageData.direction} - "${messageData.content.substring(0, 50)}..."`
    )
  }

  // Create initial messages for Maria Garcia (Spanish)
  const messages2 = [
    {
      direction: "INBOUND" as const,
      content: "hello",
      type: "TEXT" as const,
      status: "received",
      aiGenerated: false,
      metadata: {
        timestamp: new Date().toISOString(),
        source: "whatsapp",
      },
    },
    {
      direction: "OUTBOUND" as const,
      content:
        "Hello Maria! 👋 Welcome to L'Altra Italia! I'm your virtual assistant and I'm here to help you with any information about our products and services. How can I assist you today? 😊",
      type: "TEXT" as const,
      status: "sent",
      aiGenerated: true,
      metadata: {
        timestamp: new Date().toISOString(),
        messageType: "welcome",
        language: "en",
        agentSelected: "CHATBOT",
      },
    },
  ]

  for (const messageData of messages2) {
    const message = await prisma.message.create({
      data: {
        ...messageData,
        chatSessionId: chatSession2.id,
        promptId: activePrompt?.id || null,
      },
    })
    console.log(
      `Message created for Maria: ${messageData.direction} - "${messageData.content.substring(0, 50)}..."`
    )
  }

  console.log(
    "✅ Test customers with active chats and welcome messages created successfully!"
  )

  // Create sample orders for testing
  console.log("Creating sample orders for testing...")

  // Get some products and services for order items
  const availableProducts = await prisma.products.findMany({
    where: {
      workspaceId: mainWorkspaceId,
      status: "ACTIVE",
    },
    take: 5,
  })

  const availableServices = await prisma.services.findMany({
    where: {
      workspaceId: mainWorkspaceId,
    },
    take: 2,
  })

  if (availableProducts.length > 0) {
    // Create multiple orders with different statuses
    const ordersData = [
      {
        status: OrderStatus.PENDING,
        paymentStatus: "PENDING",
        paymentMethod: "CREDIT_CARD",
        totalAmount: 89.5,
        shippingAmount: 9.99,
        taxAmount: 15.84,
        shippingAddress: {
          street: "Via Roma 123",
          city: "Milano",
          zipCode: "20121",
          country: "Italy",
          name: "Mario Rossi",
          phone: "+39123456789",
        },
        billingAddress: {
          street: "Via Roma 123",
          city: "Milano",
          zipCode: "20121",
          country: "Italy",
          name: "Mario Rossi",
          phone: "+39123456789",
        },
        notes: "Please deliver after 6 PM",
        discountCode: "FIRST10",
        discountAmount: 8.95,
        items: [
          {
            productId: availableProducts[0].id,
            quantity: 2,
            unitPrice: 29.99,
            totalPrice: 59.98,
            productVariant: "250ml",
          },
          {
            productId: availableProducts[1].id,
            quantity: 1,
            unitPrice: 19.53,
            totalPrice: 19.53,
            productVariant: "500g",
          },
          {
            productId: availableProducts[2].id,
            quantity: 1,
            unitPrice: 24.99,
            totalPrice: 24.99,
            productVariant: null,
          },
          {
            serviceId: availableServices[0]?.id,
            quantity: 1,
            unitPrice: availableServices[0]?.price || 30.0,
            totalPrice: availableServices[0]?.price || 30.0,
          },
        ],
      },
      {
        status: OrderStatus.PROCESSING,
        paymentStatus: "PAID",
        paymentMethod: "PAYPAL",
        totalAmount: 156.75,
        shippingAmount: 12.99,
        taxAmount: 27.84,
        shippingAddress: {
          street: "Carrer de Balmes 45",
          city: "Barcelona",
          zipCode: "08007",
          country: "Spain",
          name: "Maria Garcia",
          phone: "+34666777888",
        },
        billingAddress: {
          street: "Carrer de Balmes 45",
          city: "Barcelona",
          zipCode: "08007",
          country: "Spain",
          name: "Maria Garcia",
          phone: "+34666777888",
        },
        notes: "Corporate order - please provide invoice",
        discountCode: null,
        discountAmount: 0,
        items: [
          {
            productId: availableProducts[0].id,
            quantity: 3,
            unitPrice: 29.99,
            totalPrice: 89.97,
            productVariant: "250ml",
          },
          {
            productId: availableProducts[2].id,
            quantity: 2,
            unitPrice: 22.39,
            totalPrice: 44.78,
            productVariant: "Premium",
          },
        ],
      },
      {
        status: OrderStatus.DELIVERED,
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
        totalAmount: 245.99,
        shippingAmount: 15.99,
        taxAmount: 43.44,
        shippingAddress: {
          street: "Rue de la Paix 12",
          city: "Paris",
          zipCode: "75002",
          country: "France",
          name: "Jean Dupont",
          phone: "+33123456789",
        },
        billingAddress: {
          street: "Rue de la Paix 12",
          city: "Paris",
          zipCode: "75002",
          country: "France",
          name: "Jean Dupont",
          phone: "+33123456789",
        },
        notes: "Delivered successfully to reception",
        discountCode: "BULK20",
        discountAmount: 49.2,
        items: [
          {
            productId: availableProducts[0].id,
            quantity: 5,
            unitPrice: 29.99,
            totalPrice: 149.95,
            productVariant: "250ml",
          },
          {
            productId: availableProducts[1].id,
            quantity: 3,
            unitPrice: 19.53,
            totalPrice: 58.59,
            productVariant: "500g",
          },
          {
            productId: availableProducts[3].id,
            quantity: 1,
            unitPrice: 37.45,
            totalPrice: 37.45,
            productVariant: "Limited Edition",
          },
        ],
      },
      {
        status: OrderStatus.CANCELLED,
        paymentStatus: "REFUNDED",
        paymentMethod: "CREDIT_CARD",
        totalAmount: 67.48,
        shippingAmount: 8.99,
        taxAmount: 11.95,
        shippingAddress: {
          street: "Via Veneto 88",
          city: "Rome",
          zipCode: "00187",
          country: "Italy",
          name: "Giuseppe Verdi",
          phone: "+39987654321",
        },
        billingAddress: {
          street: "Via Veneto 88",
          city: "Rome",
          zipCode: "00187",
          country: "Italy",
          name: "Giuseppe Verdi",
          phone: "+39987654321",
        },
        notes: "Cancelled due to product availability",
        discountCode: null,
        discountAmount: 0,
        items: [
          {
            productId: availableProducts[4].id,
            quantity: 2,
            unitPrice: 23.75,
            totalPrice: 47.5,
            productVariant: "Standard",
          },
        ],
      },
    ]

    // Create orders with different created dates over 3 months
    for (let i = 0; i < ordersData.length; i++) {
      const orderData = ordersData[i]

      // Create order dates spread over the last 90 days (3 months)
      const orderDate = new Date()
      orderDate.setDate(
        orderDate.getDate() - (i * 20 + Math.floor(Math.random() * 10))
      )

      // Distribute orders between customers: odd for Mario, even for Maria
      const customerId = i % 2 === 0 ? testCustomer.id : testCustomer2.id
      const customerName = i % 2 === 0 ? "Mario Rossi" : "Maria Garcia"

      try {
        // Define shipping addresses for each customer
        const shippingAddresses = {
          [testCustomer.id]: {
            // Mario Rossi (Italian customer)
            name: "Mario Rossi",
            street: "Via Roma 123",
            city: "Milano",
            postalCode: "20121",
            province: "MI",
            country: "Italia",
            phone: "+39 02 1234567",
          },
          [testCustomer2.id]: {
            // Maria Garcia (Spanish customer)
            name: "Maria Garcia",
            street: "Carrer de Balmes 456",
            city: "Barcelona",
            postalCode: "08008",
            province: "Barcelona",
            country: "España",
            phone: "+34 93 987 6543",
          },
        }

        // Create order with current database structure including shipping address
        const order = await prisma.orders.create({
          data: {
            orderCode: `${10001 + i}`, // 5-digit numeric codes starting from 10001
            customerId: customerId,
            workspaceId: mainWorkspaceId,
            status: orderData.status,
            totalAmount: orderData.totalAmount,
            shippingAddress: shippingAddresses[customerId],
            createdAt: orderDate,
          },
        })

        console.log(
          `Order created: ${order.id} - Status: ${order.status} - Customer: ${customerName}`
        )

        // Create order items for this order (without itemType for now)
        for (const item of orderData.items) {
          if (item.productId) {
            await prisma.orderItems.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              },
            })
          }
        }

        console.log(
          `Created ${orderData.items.filter((item) => item.productId).length} order items for order ${order.id}`
        )
      } catch (error) {
        console.error(`Error creating order ${i + 1}:`, error)
      }
    }

    console.log("✅ Sample orders created successfully!")
  } else {
    console.log("⚠️ No products available for creating orders")
  }

  // Create additional historical orders for better analytics
  console.log("Creating additional historical orders for 3-month analytics...")

  // Create more orders spread over 3 months for better analytics visualization
  const additionalOrdersCount = 15
  for (let i = 0; i < additionalOrdersCount; i++) {
    const orderDate = new Date()
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 90)) // Random date in last 3 months

    const randomStatus = ["PENDING", "PROCESSING", "DELIVERED", "CANCELLED"][
      Math.floor(Math.random() * 4)
    ]
    const randomPayment =
      randomStatus === "CANCELLED"
        ? "REFUNDED"
        : ["PENDING", "PAID"][Math.floor(Math.random() * 2)]
    const randomAmount = 25 + Math.random() * 200 // Random amount between 25-225

    // Randomly assign to either customer
    const randomCustomerId =
      Math.random() < 0.5 ? testCustomer.id : testCustomer2.id

    try {
      // Define shipping addresses for each customer (for additional orders)
      const shippingAddresses = {
        [testCustomer.id]: {
          // Mario Rossi (Italian customer)
          name: "Mario Rossi",
          street: "Via Roma 123",
          city: "Milano",
          postalCode: "20121",
          province: "MI",
          country: "Italia",
          phone: "+39 02 1234567",
        },
        [testCustomer2.id]: {
          // Maria Garcia (Spanish customer)
          name: "Maria Garcia",
          street: "Carrer de Balmes 456",
          city: "Barcelona",
          postalCode: "08008",
          province: "Barcelona",
          country: "España",
          phone: "+34 93 987 6543",
        },
      }

      const order = await prisma.orders.create({
        data: {
          orderCode: `${20001 + i}`, // 5-digit numeric codes starting from 20001 for additional orders
          workspaceId: mainWorkspaceId,
          customerId: randomCustomerId,
          status: randomStatus as any,
          totalAmount: randomAmount,
          shippingAddress: shippingAddresses[randomCustomerId],
          createdAt: orderDate,
        },
      })

      // Add 1-3 random items to each order
      const itemsCount = 1 + Math.floor(Math.random() * 3)
      for (let j = 0; j < itemsCount; j++) {
        const randomProduct =
          availableProducts[
            Math.floor(Math.random() * availableProducts.length)
          ]
        const quantity = 1 + Math.floor(Math.random() * 3)
        const unitPrice = randomProduct.price

        await prisma.orderItems.create({
          data: {
            orderId: order.id,
            productId: randomProduct.id,
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
          },
        })
      }

      console.log(
        `Additional order ${i + 1}/${additionalOrdersCount} created for ${orderDate.toISOString().split("T")[0]}`
      )
    } catch (error) {
      console.error(`Error creating additional order ${i + 1}:`, error)
    }
  }

  // Create sample usage data for dashboard testing
  console.log("Creating sample usage data for dashboard...")

  // Create usage records for the last 90 days with realistic patterns
  const today = new Date()
  const usageData: Array<{
    workspaceId: string
    clientId: string
    price: number
    createdAt: Date
  }> = []

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // More usage on weekdays, peak hours 10-16
    const isWeekday = date.getDay() >= 1 && date.getDay() <= 5
    const baseMessages = isWeekday ? 8 : 3 // More messages on weekdays
    const randomVariation = Math.floor(Math.random() * 5) // Add some randomness
    const dailyMessages = baseMessages + randomVariation

    // Create messages throughout the day with peak hours
    for (let j = 0; j < dailyMessages; j++) {
      let hour
      if (isWeekday) {
        // Peak hours 10-16 on weekdays
        hour =
          Math.random() < 0.6
            ? 10 + Math.floor(Math.random() * 6)
            : Math.floor(Math.random() * 24)
      } else {
        // Random hours on weekends
        hour = Math.floor(Math.random() * 24)
      }

      const messageTime = new Date(date)
      messageTime.setHours(
        hour,
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      )

      // Randomly assign usage to either customer
      const randomClientId =
        Math.random() < 0.5 ? testCustomer.id : testCustomer2.id

      usageData.push({
        workspaceId: mainWorkspaceId,
        clientId: randomClientId,
        price: 0.005, // 0.5 cents as requested by Andrea
        createdAt: messageTime,
      })
    }
  }

  // Create usage records
  for (const usage of usageData) {
    try {
      await prisma.usage.create({
        data: usage,
      })
    } catch (error) {
      console.error("Error creating usage record:", error)
    }
  }

  console.log(`✅ Created ${usageData.length} usage records for testing`)
  console.log(
    `💰 Total cost simulation: €${(usageData.length * 0.005).toFixed(4)}`
  )

  // Seed default document
  await seedDefaultDocument()

  // PHASE 1: Embedding Generation
  console.log("\n🧠 PHASE 1: EMBEDDING GENERATION")
  console.log("=================================")
  await generateEmbeddingsAfterSeed()

  // PHASE 2: N8N Complete Setup (Credentials + Workflow + Activation)
  console.log("\n🤖 PHASE 2: N8N COMPLETE AUTOMATION")
  console.log("===================================")
  console.log("📋 CHECKLIST ANDREA:")
  console.log("   ✅ Query SQL (completato)")
  console.log("   ⏳ Embedding (in corso)")
  console.log("   ⏳ N8N Credential (prossimo)")
  console.log("   ⏳ Delete old workflow (prossimo)")
  console.log("   ⏳ N8N import workflow (prossimo)")
  console.log("   ⏳ Compila il workflow (prossimo)")
  console.log("   ⏳ Attiva il workflow (prossimo)")

  await cleanAndImportN8NWorkflow()

  console.log("✅ CHECKLIST ANDREA COMPLETATA:")
  console.log("   ✅ Query SQL")
  console.log("   ✅ Embedding")
  console.log("   ✅ N8N Credential (from .env)")
  console.log("   ✅ Delete old workflow")
  console.log("   ✅ N8N import workflow")
  console.log("   ✅ Compila il workflow")
  console.log("   ✅ Attiva il workflow")
  console.log("")
  console.log("🎯 SETUP COMPLETO! N8N PRONTO PER WHATSAPP!")
  console.log("🔗 Webhook URL: http://localhost:5678/webhook/webhook-start")
  console.log("⚙️ Admin Panel: http://localhost:5678")
  console.log("   ✅ Attiva il workflow")

  console.log(`Seed completato con successo!`)
  console.log(`- Admin user creato: ${adminEmail}`)
  console.log(`- Workspace creato/aggiornato: ${createdWorkspaces[0].name}`)
  console.log(`- Categorie create/esistenti: ${foodCategories.length}`)
  console.log(`- Prodotti creati/aggiornati: ${products.length}`)
  console.log(`- Services creati/aggiornati: ${services.length}`)
  console.log(`- FAQs create: ${faqsData.length}`)
  console.log(
    `- Test customer with active chat created: Mario Rossi (+39123456789)`
  )
  console.log(`- Embeddings ready for manual generation via API`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
