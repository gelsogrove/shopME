import { Edit, Eye, Search, Tag } from "lucide-react"
import { useState } from "react"

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("")

  // Italian food products data
  const [products, setProducts] = useState([
    {
      id: "PROD001",
      name: "Parmigiano Reggiano DOP",
      price: 29.99,
      category: "Formaggi",
      stock: 45,
      isActive: true,
      image:
        "https://plus.unsplash.com/premium_photo-1674654419438-28f837e76c38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      description:
        "Formaggio stagionato 24 mesi, prodotto nelle zone tipiche del disciplinare DOP",
    },
    {
      id: "PROD002",
      name: "Olio Extra Vergine Toscano",
      price: 19.99,
      category: "Oli e Condimenti",
      stock: 120,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      description:
        "Olio di oliva extra vergine IGP dalla Toscana, raccolta 2023",
    },
    {
      id: "PROD003",
      name: "Pasta di Gragnano IGP",
      price: 4.99,
      category: "Pasta",
      stock: 200,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=800&auto=format&fit=crop&q=60",
      description: "Spaghetti artigianali di grano duro, trafilati al bronzo",
    },
    {
      id: "PROD004",
      name: "Prosciutto di Parma DOP",
      price: 39.99,
      category: "Salumi",
      stock: 30,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1614777986387-015c2a89b696?w=800&auto=format&fit=crop&q=60",
      description: "Prosciutto stagionato 18 mesi, affettato a mano",
    },
    {
      id: "PROD005",
      name: "Pomodori San Marzano DOP",
      price: 3.99,
      category: "Conserve",
      stock: 150,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1571905577201-ababc1f8d7d0?w=800&auto=format&fit=crop&q=60",
      description: "Pomodori pelati interi dell'Agro Sarnese-Nocerino",
    },
    {
      id: "PROD006",
      name: "Aceto Balsamico di Modena",
      price: 24.99,
      category: "Oli e Condimenti",
      stock: 80,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1576007594790-2c73df2cd761?w=800&auto=format&fit=crop&q=60",
      description: "Aceto balsamico invecchiato 12 anni, IGP",
    },
    {
      id: "PROD007",
      name: "Pecorino Romano DOP",
      price: 19.99,
      category: "Formaggi",
      stock: 60,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1566454825481-9c19f2ca2f44?w=800&auto=format&fit=crop&q=60",
      description: "Formaggio pecorino stagionato 12 mesi",
    },
    {
      id: "PROD008",
      name: "Pasta alla Chitarra",
      price: 5.99,
      category: "Pasta",
      stock: 100,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=800&auto=format&fit=crop&q=60",
      description: "Pasta fresca all'uovo tagliata a mano",
    },
    {
      id: "PROD009",
      name: "Mortadella Bologna IGP",
      price: 12.99,
      category: "Salumi",
      stock: 40,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800&auto=format&fit=crop&q=60",
      description: "Mortadella artigianale con pistacchi",
    },
    {
      id: "PROD010",
      name: "Pesto alla Genovese DOP",
      price: 6.99,
      category: "Conserve",
      stock: 90,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1564844536308-50f14e5c1b00?w=800&auto=format&fit=crop&q=60",
      description: "Pesto fresco con basilico genovese DOP",
    },
    {
      id: "PROD011",
      name: "Gorgonzola DOP Piccante",
      price: 15.99,
      category: "Formaggi",
      stock: 35,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=60",
      description: "Formaggio erborinato stagionato 3 mesi",
    },
    {
      id: "PROD012",
      name: "Paccheri di Gragnano",
      price: 4.99,
      category: "Pasta",
      stock: 150,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=60",
      description: "Pasta di semola di grano duro, formato tradizionale",
    },
    {
      id: "PROD013",
      name: "Salame di Felino IGP",
      price: 16.99,
      category: "Salumi",
      stock: 25,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&auto=format&fit=crop&q=60",
      description: "Salame stagionato secondo tradizione",
    },
    {
      id: "PROD014",
      name: "Passata di Pomodoro",
      price: 2.99,
      category: "Conserve",
      stock: 200,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1608842850202-06e71de0b251?w=800&auto=format&fit=crop&q=60",
      description: "Passata di pomodoro 100% italiano",
    },
    {
      id: "PROD015",
      name: "Mozzarella di Bufala DOP",
      price: 9.99,
      category: "Formaggi",
      stock: 50,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60",
      description: "Mozzarella fresca di bufala campana",
    },
    {
      id: "PROD016",
      name: "Orecchiette Pugliesi",
      price: 4.5,
      category: "Pasta",
      stock: 120,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=800&auto=format&fit=crop&q=60",
      description: "Pasta fresca fatta a mano secondo tradizione pugliese",
    },
    {
      id: "PROD017",
      name: "Speck Alto Adige IGP",
      price: 18.99,
      category: "Salumi",
      stock: 40,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1625938144755-652e08e359b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      description: "Speck affumicato e stagionato delle Dolomiti",
    },
    {
      id: "PROD018",
      name: "Olive Taggiasche",
      price: 7.99,
      category: "Conserve",
      stock: 80,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1593629718768-e8860d848eba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      description: "Olive in salamoia della Liguria",
    },
    {
      id: "PROD019",
      name: "Nduja Calabrese",
      price: 8.99,
      category: "Salumi",
      stock: 30,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1591386767153-987783380885?w=800&auto=format&fit=crop&q=60",
      description: "Salame spalmabile piccante della tradizione calabrese",
    },
    {
      id: "PROD020",
      name: "Risotto alla Milanese",
      price: 6.99,
      category: "Primi Piatti",
      stock: 100,
      isActive: true,
      image:
        "https://images.unsplash.com/photo-1633964913295-ceb43826e7c7?w=800&auto=format&fit=crop&q=60",
      description: "Riso Carnaroli con zafferano, pronto da cucinare",
    },
  ])

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle toggle active status
  const handleToggleActive = (productId) => {
    setProducts(
      products.map((product) => ({
        ...product,
        isActive:
          product.id === productId ? !product.isActive : product.isActive,
      }))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Prodotti
        </h1>

        {/* Search bar */}
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Cerca prodotti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
            <span className="mr-2">Aggiungi Prodotto</span>
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error(`Failed to load image for ${product.name}:`, e)
                  e.target.onerror = null // prevent infinite loop
                  e.target.src = `https://placehold.co/800x600/EFEFEF/999999?text=${encodeURIComponent(
                    product.name
                  )}`
                }}
                loading="lazy"
              />
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  {/* Category tag */}
                  <div className="flex items-center mt-1">
                    <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category}
                    </span>
                  </div>
                </div>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  €{product.price.toFixed(2)}
                </p>
              </div>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {product.description}
              </p>

              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Disponibilità: {product.stock} unità
                </p>
              </div>

              <div className="mt-6 flex justify-between items-center">
                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(product.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {product.isActive ? "Attivo" : "Non Attivo"}
                </button>

                {/* Action buttons */}
                <div className="flex space-x-3">
                  <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
