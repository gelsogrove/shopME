import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function createServices() {
  // Get the first workspace
  const workspaces = await prisma.$queryRaw`SELECT * FROM "Workspace" WHERE "isDelete" = false LIMIT 1`;
  const workspace = (workspaces as any[])[0];
  
  if (!workspace) {
    console.log("No workspace found!");
    return;
  }
  
  console.log(`Using workspace: ${workspace.name} (${workspace.id})`);
  
  const defaultServices = [
    {
      name: "Italian Food Consultation",
      description: "Expert advice on Italian cuisine and ingredient selection",
      price: 50.00,
      currency: "€",
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Custom Gift Basket",
      description: "Personalized Italian food gift baskets for special occasions",
      price: 75.00,
      currency: "€",
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Cooking Class",
      description: "Learn authentic Italian cooking techniques with our experts",
      price: 120.00,
      currency: "€",
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Wine Tasting",
      description: "Guided tasting of premium Italian wines",
      price: 45.00,
      currency: "€", 
      isActive: true,
      workspaceId: workspace.id
    },
    {
      name: "Catering Services",
      description: "Full-service Italian catering for events and parties",
      price: 250.00,
      currency: "€",
      isActive: true,
      workspaceId: workspace.id
    }
  ];

  // Check for existing services and create new ones
  console.log("Creating default services...");
  for (const service of defaultServices) {
    // Using raw queries since the Services model might not be fully recognized by TypeScript
    const existingServices = await prisma.$queryRaw`
      SELECT * FROM services 
      WHERE name = ${service.name} AND "workspaceId" = ${service.workspaceId}
      LIMIT 1
    `;
    
    const existingService = (existingServices as any[])[0];

    if (!existingService) {
      await prisma.$executeRaw`
        INSERT INTO services (id, name, description, price, currency, "isActive", "workspaceId", "createdAt", "updatedAt")
        VALUES (
          ${crypto.randomUUID()},
          ${service.name}, 
          ${service.description}, 
          ${service.price}, 
          ${service.currency}, 
          ${service.isActive}, 
          ${service.workspaceId}, 
          NOW(), 
          NOW()
        )
      `;
      console.log(`Service created: ${service.name}`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log("Services creation completed!");
}

createServices()
  .catch((error) => {
    console.error("Error creating services:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 