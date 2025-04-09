import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function cleanup() {
  try {
    // Get all workspaces
    const workspaces = await prisma.workspace.findMany()

    for (const workspace of workspaces) {
      // Get all languages for this workspace
      const languages = await prisma.languages.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'asc' }
      })

      // Group languages by code
      const languagesByCode: { [key: string]: typeof languages } = {}
      languages.forEach(lang => {
        if (!languagesByCode[lang.code]) {
          languagesByCode[lang.code] = []
        }
        languagesByCode[lang.code].push(lang)
      })

      // For each language code, keep the oldest and delete the rest
      for (const [code, langs] of Object.entries(languagesByCode)) {
        if (langs.length > 1) {
          // Keep the first (oldest) language
          const [keep, ...duplicates] = langs
          
          // Delete duplicates
          await prisma.languages.deleteMany({
            where: {
              id: { in: duplicates.map(d => d.id) }
            }
          })
          
          console.log(`Deleted ${duplicates.length} duplicate(s) of language ${code} for workspace ${workspace.name}`)
        }
      }
    }

    console.log("Cleanup completed successfully!")
  } catch (error) {
    console.error("Error during cleanup:", error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup() 