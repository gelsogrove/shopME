import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  console.log("Starting workspace reset process...");
  
  // Get the workspace ID to remove - updated to the correct ID
  const workspaceIdToRemove = "cm9912ez10000i16wgr13pvaf";
  
  try {
    // Delete all related records first
    console.log(`Deleting related records for workspace ${workspaceIdToRemove}...`);
    
    // Delete services
    await prisma.services.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("Services deleted");
    
    // Delete products
    await prisma.products.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("Products deleted");
    
    // Delete categories
    await prisma.categories.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("Categories deleted");
    
    // Delete prompts
    await prisma.prompts.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("Prompts deleted");
    
    // Delete languages
    await prisma.languages.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("Languages deleted");
    
    // Delete user workspaces
    await prisma.userWorkspace.deleteMany({
      where: { workspaceId: workspaceIdToRemove }
    });
    console.log("User workspaces deleted");
    
    // Finally delete the workspace
    await prisma.workspace.delete({
      where: { id: workspaceIdToRemove }
    });
    console.log(`Workspace ${workspaceIdToRemove} deleted successfully`);
    
    // Create a new workspace with the same ID
    const newWorkspace = await prisma.workspace.create({
      data: {
        id: "cm9912ez10000i16wgr13pvaf", // Use the same ID
        name: "L'Altra Italia(ESP)",
        slug: "altra-italia-esp",
        whatsappPhoneNumber: "+34654728753",
        isActive: true,
        language: "it",
        currency: "EUR"
      }
    });
    
    console.log(`New workspace created: ${newWorkspace.name} (ID: ${newWorkspace.id})`);
    
    console.log("Workspace reset completed successfully!");
    console.log("Now run the full-seed.ts script to populate the new workspace with data.");
    
  } catch (error) {
    console.error("Error during workspace reset:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }); 