import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductSheet } from "@/components/shared/ProductSheet"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  status: "active" | "inactive"
  image: string
  quantity: number
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Parmigiano Reggiano DOP 24 months",
    description:
      "Authentic Parmigiano Reggiano DOP aged 24 months. Intense flavor with a granular texture.",
    price: "29.99",
    categories: ["Cheese"],
    status: "active",
    image:
      "https://www.parmigianoreggiano.com/wp-content/uploads/2020/10/forma-parmigiano-reggiano.jpg",
    quantity: 25,
  },
  {
    id: "2",
    name: "Gragnano IGP Pasta - Spaghetti",
    description:
      "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
    price: "4.99",
    categories: ["Pasta"],
    status: "active",
    image:
      "https://www.gustiditalia.com/wp-content/uploads/2019/11/pasta-di-gragnano-igp-spaghetti.jpg",
    quantity: 120,
  },
  {
    id: "3",
    name: "Tuscan IGP Extra Virgin Olive Oil",
    description:
      "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
    price: "19.99",
    categories: ["Oil"],
    status: "active",
    image:
      "https://www.oliocarli.it/wp-content/uploads/2019/11/olio-toscano.jpg",
    quantity: 48,
  },
  {
    id: "4",
    name: "Prosciutto di Parma DOP 24 months",
    description:
      "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
    price: "24.99",
    categories: ["Cured Meats"],
    status: "active",
    image:
      "https://www.prosciuttodiparma.com/wp-content/uploads/2020/05/prosciutto-di-parma-intero.jpg",
    quantity: 15,
  },
  {
    id: "5",
    name: "Aceto Balsamico di Modena IGP",
    description:
      "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
    price: "14.99",
    categories: ["Condiments"],
    status: "active",
    image:
      "https://www.acetum.it/wp-content/uploads/2020/03/aceto-balsamico-di-modena-igp.jpg",
    quantity: 30,
  },
  {
    id: "6",
    name: "Mozzarella di Bufala Campana DOP",
    description:
      "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
    price: "9.99",
    categories: ["Cheese"],
    status: "active",
    image:
      "https://www.mozzarelladibufala.org/wp-content/uploads/2019/07/mozzarella-di-bufala-campana-dop.jpg",
    quantity: 40,
  },
  {
    id: "7",
    name: "San Marzano DOP Tomatoes",
    description:
      "Authentic San Marzano tomatoes grown in the volcanic soil of Mount Vesuvius. Sweet flavor with low acidity.",
    price: "6.99",
    categories: ["Vegetables", "DOP"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1591111366333-83c9616f8c3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 85,
  },
  {
    id: "8",
    name: "Barolo DOCG Wine",
    description:
      "Premium Barolo DOCG wine from Piedmont, made from Nebbiolo grapes. Full-bodied with notes of roses, tar and herbs.",
    price: "49.99",
    categories: ["Wine", "DOCG"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1586370434639-0fe43b4daa6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 24,
  },
  {
    id: "9",
    name: "Pistacchi di Bronte DOP",
    description:
      "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
    price: "18.99",
    categories: ["Nuts", "DOP"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1616684000067-36952fde56ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 35,
  },
  {
    id: "10",
    name: "Limoncello di Sorrento IGP",
    description:
      "Traditional lemon liqueur made with Sorrento lemons. Bright, sweet and intensely citrusy.",
    price: "22.99",
    categories: ["Spirits", "IGP"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1623857584158-23c769acb3c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 42,
  },
  {
    id: "11",
    name: "Truffle Extra Virgin Olive Oil",
    description:
      "Premium extra virgin olive oil infused with Italian black truffles. Rich, earthy aroma for gourmet dishes.",
    price: "27.99",
    categories: ["Oil", "Condiments"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1604932292784-e154d965a87c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 28,
  },
  {
    id: "12",
    name: "Panettone Tradizionale Milano",
    description:
      "Traditional Milanese Christmas cake with candied fruits and raisins. Soft and aromatic dough made with natural yeast.",
    price: "19.99",
    categories: ["Bakery", "Seasonal"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1607919966373-50958a2d7190?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 50,
  },
  {
    id: "13",
    name: "Pecorino Romano DOP",
    description:
      "Hard, salty sheep's milk cheese from Lazio region. Aged for at least 5 months with a sharp, piquant flavor.",
    price: "16.99",
    categories: ["Cheese", "DOP"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1599674256640-9de576c7b3bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 32,
  },
  {
    id: "14",
    name: "Chianti Classico DOCG",
    description:
      "Tuscan red wine made primarily from Sangiovese grapes. Ruby red color with notes of cherries, plums and violets.",
    price: "24.99",
    categories: ["Wine", "DOCG"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 36,
  },
  {
    id: "15",
    name: "Pistacchi Siciliani",
    description:
      "Premium Sicilian pistachios with their vibrant green color and intense flavor. Perfect for snacking or cooking.",
    price: "12.99",
    categories: ["Nuts"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1525053380689-a3d9a8d05350?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 45,
  },
  {
    id: "16",
    name: "Melanzane Sott'olio",
    description:
      "Eggplants preserved in extra virgin olive oil with herbs and spices. Traditional Southern Italian antipasto.",
    price: "8.99",
    categories: ["Preserved Vegetables", "Antipasti"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1600335895229-6e75511892c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    quantity: 38,
  },
]

const availableCategories = [
  "Pasta",
  "Cheese",
  "Oil",
  "Condiments",
  "Cured Meats",
  "DOP",
  "IGP",
  "Vegetables",
  "Wine",
  "DOCG",
  "Nuts",
  "Spirits",
  "Bakery",
  "Seasonal",
  "Preserved Vegetables",
  "Antipasti",
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    {
      header: "Image",
      accessorKey: "image" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <div className="w-16 h-16 overflow-hidden rounded-md">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                "https://placehold.co/600x400/e2e8f0/64748b?text=Product+Image"
            }}
          />
        </div>
      ),
    },
    { header: "Name", accessorKey: "name" as keyof Product },
    { header: "Description", accessorKey: "description" as keyof Product },
    {
      header: "Price",
      accessorKey: "price" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className="font-medium">€{row.original.price}</span>
      ),
    },
    {
      header: "Quantity",
      accessorKey: "quantity" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className="font-medium">{row.original.quantity}</span>
      ),
    },
    {
      header: "Categories",
      accessorKey: "categories" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <StatusBadge status={row.original.status}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      ),
    },
  ]

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
      categories: formData.getAll("categories") as string[],
      status: "active",
      image:
        (formData.get("image") as string) ||
        "https://placehold.co/600x400/e2e8f0/64748b?text=Product+Image",
      quantity: parseInt(formData.get("quantity") as string) || 0,
    }

    setProducts([...products, newProduct])
    setShowAddSheet(false)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditSheet(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedProduct: Product = {
      ...selectedProduct,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
      categories: formData.getAll("categories") as string[],
      image: (formData.get("image") as string) || selectedProduct.image,
      quantity:
        parseInt(formData.get("quantity") as string) ||
        selectedProduct.quantity,
    }

    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
    )
    setShowEditSheet(false)
    setSelectedProduct(null)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return
    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setShowDeleteDialog(false)
    setSelectedProduct(null)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Italian Products"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddSheet(true)}
        itemCount={products.length}
      />

      <div className="mt-6">
        <DataTable
          data={filteredProducts}
          columns={columns}
          globalFilter={searchValue}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProductSheet
        product={null}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAdd}
        title="Add New Product"
        availableCategories={availableCategories}
        isNew={true}
        showImageField={true}
      />

      <ProductSheet
        product={selectedProduct}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleEditSubmit}
        title="Edit Product"
        availableCategories={availableCategories}
        showImageField={true}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
