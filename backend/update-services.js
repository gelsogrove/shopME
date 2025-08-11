const { PrismaClient } = require('@prisma/client');

async function checkServices() {
  const prisma = new PrismaClient();
  
  try {
    const services = await prisma.services.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        price: true
      }
    });
    
    console.log('Services found:');
    console.log(JSON.stringify(services, null, 2));
    
    // Update services without code
    for (const service of services) {
      if (!service.code) {
        // Generate a simple code based on service name
        let code = 'SRV' + String(services.indexOf(service) + 1).padStart(3, '0');
        if (service.name.toLowerCase().includes('shipping')) {
          code = 'SHIP001';
        }
        
        await prisma.services.update({
          where: { id: service.id },
          data: { code: code }
        });
        console.log(`Updated service ${service.name} with code: ${code}`);
      }
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

checkServices().catch(console.error);
