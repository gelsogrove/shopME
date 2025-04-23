// Script temporaneo per aggiungere la pizza napoletana al database

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspaceId = "cm9hjgq9v00014qk8fsdy4ujv";
  
  // Trova la categoria Pizza e Pasta
  const category = await prisma.categories.findFirst({
    where: {
      name: "Pizza e Pasta",
      workspaceId: workspaceId,
    },
  });

  if (!category) {
    console.log("Categoria Pizza e Pasta non trovata!");
    return;
  }

  // Verifica se la pizza già esiste
  const existingProduct = await prisma.products.findFirst({
    where: {
      name: "Pizza Napoletana Artigianale",
      workspaceId: workspaceId,
    },
  });

  if (existingProduct) {
    console.log("La Pizza Napoletana Artigianale è già presente nel database!");
    return;
  }

  // Crea la pizza
  await prisma.products.create({
    data: {
      name: "Pizza Napoletana Artigianale",
      description: "Autentica pizza napoletana con impasto a lunga lievitazione (24h), pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 485°C per 60-90 secondi secondo la tradizione. Certificata Specialità Tradizionale Garantita (STG).",
      price: 12.90,
      stock: 25,
      image: "https://www.lapassionefalochef.it/wp-content/uploads/2024/05/pizza-in-padella.jpg",
      isActive: true,
      status: "ACTIVE",
      slug: "pizza-napoletana-artigianale-" + Date.now(),
      workspaceId: workspaceId,
      categoryId: category.id,
    },
  });

  console.log("Pizza Napoletana Artigianale aggiunta con successo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 