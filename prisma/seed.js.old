// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Pulizia database
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.service.deleteMany({});
  
  // Creazione categorie
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Pizza e Pasta', slug: 'category_pizza_e_pasta', description: 'Pizze artigianali e pasta fresca della tradizione italiana' },
      { name: 'Antipasti', slug: 'category_antipasti', description: 'Antipasti tradizionali italiani' },
      { name: 'Piatti Pronti', slug: 'category_piatti_pronti', description: 'Piatti pronti da riscaldare e servire' },
      { name: 'Dolci', slug: 'category_dolci', description: 'Dolci tipici della tradizione italiana' },
      { name: 'Salumi', slug: 'category_salumi', description: 'Salumi e affettati tipici italiani' },
      { name: 'Pesce', slug: 'category_pesce', description: 'Specialità di pesce della tradizione italiana' },
      { name: 'Salse', slug: 'category_salse', description: 'Salse e condimenti italiani' },
    ]
  });

  // Recupero ID delle categorie
  const categoryPizzaPasta = await prisma.category.findUnique({ where: { slug: 'category_pizza_e_pasta' } });
  const categoryAntipasti = await prisma.category.findUnique({ where: { slug: 'category_antipasti' } });
  const categoryPiattiPronti = await prisma.category.findUnique({ where: { slug: 'category_piatti_pronti' } });
  const categoryDolci = await prisma.category.findUnique({ where: { slug: 'category_dolci' } });
  const categorySalumi = await prisma.category.findUnique({ where: { slug: 'category_salumi' } });
  const categoryPesce = await prisma.category.findUnique({ where: { slug: 'category_pesce' } });
  const categorySalse = await prisma.category.findUnique({ where: { slug: 'category_salse' } });

  // Creazione prodotti
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Pizza Napoletana Artigianale",
        description: "Autentica pizza napoletana con impasto a lunga lievitazione (24h), pomodoro San Marzano DOP, mozzarella di bufala campana e basilico fresco. Cotta in forno a legna a 485°C per 60-90 secondi secondo la tradizione. Certificata Specialità Tradizionale Garantita (STG).",
        price: 12.90,
        stock: 25,
        categoryId: categoryPizzaPasta.id,
        images: ["https://www.lapassionefalochef.it/wp-content/uploads/2024/05/pizza-in-padella.jpg"]
      },
      {
        name: "Tagliatelle al Ragù Bolognese",
        description: "Autentica pasta all'uovo tagliata a mano (8mm di larghezza) secondo la ricetta depositata alla Camera di Commercio di Bologna. Accompagnata dal tradizionale ragù bolognese preparato con carne di manzo e maiale, soffritto, pomodoro e vino, cotto lentamente per almeno 4 ore.",
        price: 14.50,
        stock: 20,
        categoryId: categoryPizzaPasta.id,
        images: ["https://b3067249.smushcdn.com/3067249/wp-content/uploads/2022/03/ragu-authenric-taglietelle.jpg?lossy=0&strip=1&webp=1"]
      },
      {
        name: "Trofie al Pesto Genovese",
        description: "Trofie fresche artigianali servite con autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, formaggio Parmigiano Reggiano e Pecorino, aglio e olio extravergine d'oliva della Riviera Ligure.",
        price: 13.90,
        stock: 18,
        categoryId: categoryPizzaPasta.id,
        images: ["https://www.ilgiornaledelcibo.it/wp-content/uploads/2008/05/trofie-al-pesto-li-per-li.jpg"]
      },
      {
        name: "Tiramisù Tradizionale",
        description: "Autentico dolce italiano preparato secondo la ricetta tradizionale veneta. Strati di savoiardi inzuppati in caffè espresso, alternati a crema al mascarpone e cacao amaro in polvere. Ogni porzione è preparata a mano e conservata a temperatura controllata.",
        price: 8.90,
        stock: 30,
        categoryId: categoryDolci.id,
        images: ["https://primochef.it/wp-content/uploads/2019/06/SH_tiramisu.jpg.webp"]
      },
      {
        name: "Lasagna al Forno Tradizionale",
        description: "Autentica lasagna italiana con sfoglie di pasta all'uovo fatte a mano, stratificate con ragù di carne selezionata, besciamella cremosa e Parmigiano Reggiano DOP. Cotta lentamente al forno per ottenere la perfetta consistenza e il caratteristico bordo croccante.",
        price: 15.90,
        stock: 15,
        categoryId: categoryPiattiPronti.id,
        images: ["https://www.donnamoderna.com/content/uploads/2002/08/Lasagne-alla-bolognese-ricetta-tradizionale-830x625.jpg"]
      },
      {
        name: "Linguine allo Scoglio",
        description: "Pasta linguine di grano duro servita con un ricco sugo di mare che include cozze, vongole, gamberetti e calamari freschi. Preparata con pomodorini freschi, aglio, prezzemolo e un tocco di peperoncino. Un classico piatto della cucina costiera italiana.",
        price: 16.90,
        stock: 12,
        categoryId: categoryPesce.id,
        images: ["https://www.giallozafferano.it/images/231-23195/Spaghetti-allo-scoglio_450x300.jpg"]
      },
      {
        name: "Cannolo Siciliano Artigianale",
        description: "Autentico cannolo siciliano con croccante scorza di cialda fritta a mano, ripiena di ricotta di pecora fresca setacciata e dolcificata con zucchero. Arricchito con gocce di cioccolato fondente e guarnito con pistacchi di Bronte DOP e scorze di arancia candita.",
        price: 7.50,
        stock: 35,
        categoryId: categoryDolci.id,
        images: ["https://barpompi.it/wp-content/uploads/2021/05/cannolo-grande.jpg"]
      },
      {
        name: "Porchetta di Ariccia IGP",
        description: "Autentica porchetta di Ariccia IGP, specialità laziale preparata con maiale intero disossato, arrotolato e aromatizzato con una miscela di erbe aromatiche (rosmarino, finocchietto selvatico, aglio e pepe nero). Cotta lentamente in forno a legna per 8 ore, presenta una crosta croccante e una carne interna tenera e succosa.",
        price: 18.90,
        stock: 10,
        categoryId: categorySalumi.id,
        images: ["https://www.spesa-on-line.com/wp-content/uploads/2020/03/porchetta-di-ariccia-igp.jpg"]
      },
      {
        name: "Vitello Tonnato Piemontese",
        description: "Classica preparazione piemontese di fettine sottili di vitello cotto a bassa temperatura, servite con salsa tonnata cremosa preparata con tonno, capperi, acciughe e maionese. Un antipasto elegante e raffinato, perfetto per le occasioni speciali.",
        price: 14.50,
        stock: 15,
        categoryId: categoryAntipasti.id,
        images: ["https://langhe.net/wp-content/uploads/2011/05/vitello_tonnato2.jpg"]
      },
      {
        name: "Pesto alla Genovese DOP",
        description: "Autentico pesto genovese preparato secondo la ricetta tradizionale ligure con basilico DOP di Prà, pinoli italiani, aglio, sale marino, Parmigiano Reggiano DOP invecchiato 24 mesi, Pecorino Sardo e olio extravergine d'oliva della Riviera Ligure. Lavorato a crudo nel mortaio di marmo per preservare tutti gli aromi.",
        price: 8.90,
        stock: 40,
        categoryId: categorySalse.id,
        images: ["https://discovernorthernitaly.com/wp-content/uploads/2024/08/Liguria-3.jpg"]
      }
    ]
  });

  // Creazione clienti demo
  const clients = await prisma.client.createMany({
    data: [
      {
        name: "Mario Rossi",
        email: "mario.rossi@example.com",
        company: "Ristorante Da Mario",
        phone: "3331234567",
        language: "Italian",
        discount: 10,
        streetAddress: "Via Roma 123",
        city: "Milano",
        zipCode: "20100",
        country: "Italy"
      },
      {
        name: "Giulia Bianchi",
        email: "giulia.bianchi@example.com",
        company: "Pasticceria Bianchi",
        phone: "3397654321",
        language: "Italian",
        discount: 15,
        streetAddress: "Corso Italia 45",
        city: "Roma",
        zipCode: "00100",
        country: "Italy"
      },
      {
        name: "Restaurant Da Luigi",
        email: "info@daluigi.it",
        company: "Da Luigi SRL",
        phone: "028765432",
        language: "Italian",
        discount: 20,
        streetAddress: "Piazza Navona 7",
        city: "Roma",
        zipCode: "00186",
        country: "Italy"
      }
    ]
  });

  // Creazione servizi (basato sulle schermate)
  const services = await prisma.service.createMany({
    data: [
      {
        name: "Gift Package",
        description: "Luxury gift wrapping service with personalized message and premium packaging materials",
        price: 30.00
      },
      {
        name: "Shipping",
        description: "Premium shipping service with tracking and guaranteed delivery within 3-5 business days",
        price: 30.00
      },
      {
        name: "Insurance",
        description: "Product insurance service for your valuable items. Covers damage during shipping",
        price: 30.00
      }
    ]
  });

  // Creazione agenti (basato sulle schermate)
  const agents = await prisma.agent.createMany({
    data: [
      {
        name: "Router",
        department: "",
        instructions: "You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent."
      },
      {
        name: "AGENT_1",
        department: "GENERIC",
        instructions: "You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent."
      },
      {
        name: "AGENT_2",
        department: "PRODUCTS",
        instructions: "You are a product specialist for the Italian food shop \"L'Altra Italia\". You can answer detailed questions about our products, including ingredients, origin, traditional preparation methods, and culinary uses. Be knowledgeable, passionate, and provide authentic Italian cultural context when appropriate."
      },
      {
        name: "AGENT_3",
        department: "TRANSPORT",
        instructions: "You are a marketing copywriter for the Italian food shop \"L'Altra Italia\". Create compelling and engaging marketing copy for our authentic Italian products. Your tone should be warm, evocative of Italian culinary traditions, and emphasize the quality and authenticity of our offerings."
      },
      {
        name: "AGENT_4",
        department: "INVOICES",
        instructions: "You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent."
      },
      {
        name: "AGENT_5",
        department: "SERVICES",
        instructions: "....You are a helpful customer service assistant for our online shop \"L'Altra Italia\". Respond to customer queries in a polite and helpful manner. Be concise and direct in your answers. If you don't know the answer, say so and offer to connect them with a human agent."
      }
    ]
  });

  console.log('Database seed completato con successo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 