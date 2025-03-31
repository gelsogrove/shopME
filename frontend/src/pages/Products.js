import { Check, Pencil, Search, Tag, X } from "lucide-react"
import { useState } from "react"
import PageLayout from "../components/layout/PageLayout"

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

  const [categories] = useState([
    {
      id: 1,
      name: "Formaggi",
      description: "Formaggi italiani DOP e IGP",
    },
    {
      id: 2,
      name: "Oli e Condimenti",
      description: "Oli extra vergine e condimenti tipici",
    },
    {
      id: 3,
      name: "Pasta",
      description: "Pasta fresca e secca di alta qualità",
    },
    {
      id: 4,
      name: "Salumi",
      description: "Salumi e affettati tradizionali",
    },
    {
      id: 5,
      name: "Conserve",
      description: "Conserve e specialità in barattolo",
    },
    {
      id: 6,
      name: "Primi Piatti",
      description: "Primi piatti pronti della tradizione",
    },
  ])

  const [editingId, setEditingId] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    categories: [],
  })

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

  const handleAdd = () => {
    if (
      newProduct.name.trim() &&
      newProduct.description.trim() &&
      newProduct.price
    ) {
      setProducts([
        ...products,
        {
          id: Math.max(...products.map((p) => p.id)) + 1,
          ...newProduct,
          price: parseFloat(newProduct.price),
        },
      ])
      setNewProduct({ name: "", description: "", price: "", categories: [] })
      setIsAdding(false)
    }
  }

  const handleEdit = (id) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      setEditingId(id)
      setNewProduct({ ...product, price: product.price.toString() })
    }
  }

  const handleUpdate = (id) => {
    if (
      newProduct.name.trim() &&
      newProduct.description.trim() &&
      newProduct.price
    ) {
      setProducts(
        products.map((product) =>
          product.id === id
            ? { ...product, ...newProduct, price: parseFloat(newProduct.price) }
            : product
        )
      )
      setEditingId(null)
      setNewProduct({ name: "", description: "", price: "", categories: [] })
    }
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== id))
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewProduct({ name: "", description: "", price: "", categories: [] })
  }

  const handleCategoryToggle = (categoryId) => {
    setNewProduct((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }))
  }

  const getCategoryNames = (categoryIds) => {
    return categoryIds
      .map((id) => categories.find((cat) => cat.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <PageLayout title="Products">
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Add Product
            </button>
          </div>
        </div>

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
                    e.target.onerror = null
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
                    Stock: {product.stock} units
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  {/* Active status */}
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Active
                  </span>

                  {/* Action buttons */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Product
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter product description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price (€)
                    </label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter stock quantity"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={newProduct.image}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          image: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white sm:text-sm"
                      placeholder="Enter image URL"
                    />
                  </div>
                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newProduct.isActive}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          isActive: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Active
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdate(editingId)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default Products
