import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main() {
  console.log("Starting services seed...");

  // Check if the workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { slug: "altra-italia" },
  });

  if (!workspace) {
    console.error("Workspace 'altra-italia' not found!");
    return;
  }

  // Define the services
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

  console.log("Creating services...");
  
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

  console.log("Services seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding services:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 