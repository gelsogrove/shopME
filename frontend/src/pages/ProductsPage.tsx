import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductSheet } from "@/components/shared/ProductSheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { categoriesApi } from "@/services/categoriesApi"
import { productsApi, type Product } from "@/services/productsApi"
import { formatPrice } from "@/utils/format"
import { Package2, Pencil, Tag, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Define a type that's compatible with both our Product and the ProductSheet component
interface ProductDisplay {
  id: string
  name: string
  description: string
  price: string
  stock: number
  categoryId: string | null
  image: string | null
}

export function ProductsPage() {
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: string, name: string }>>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductDisplay | null>(
    null
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [failedImages, setFailedImages] = useState<{[key: string]: boolean}>({})
  
  // Mappe a immagini statiche per categorie o nomi di prodotti
  const staticImages: {[key: string]: string} = {
    'pasta': '/images/products/pasta.svg',
    'Pasta': '/images/products/pasta.svg',
    'beverages': '/images/products/beverages.svg',
    'Beverages': '/images/products/beverages.svg',
    'cheese': '/images/products/cheese.svg',
    'Cheese': '/images/products/cheese.svg',
    'default': '/images/products/placeholder.svg'
  };
  
  // Test immagini predefinite in ordine di priorità
  const testImages = [
    '/uploads/products/placeholder.svg',
    '/uploads/products/test-placeholder.txt',
  ];
  
  // Funzione per assegnare immagini di test ai prodotti senza immagini
  const assignTestImagesToProducts = (prods) => {
    return prods.map(product => {
      // Se il prodotto non ha un'immagine, proviamo a trovare un'immagine statica basata sulla categoria
      if (!product.image) {
        // Prima cerchiamo una corrispondenza per categoria
        if (product.category && staticImages[product.category.name]) {
          return {
            ...product,
            image: staticImages[product.category.name]
          };
        }
        
        // Cerchiamo una corrispondenza per nome prodotto (parziale)
        const matchingKey = Object.keys(staticImages).find(key => 
          product.name.toLowerCase().includes(key.toLowerCase()));
        
        if (matchingKey) {
          return {
            ...product,
            image: staticImages[matchingKey]
          };
        }
        
        // Se non troviamo corrispondenze, usiamo un'immagine casuale dal pool predefinito
        return {
          ...product,
          image: testImages[Math.floor(Math.random() * testImages.length)]
        };
      }
      return product;
    });
  };
  
  // Funzione per assicurarsi che l'URL sia completo
  const getCompleteImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Se l'URL è già completo (inizia con http:// o https://)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Se è un URL relativo, lo trasformiamo in assoluto
    if (url.startsWith('/')) {
      return `${window.location.origin}${url}`;
    }
    
    // In caso contrario, assumiamo sia un percorso relativo
    return `${window.location.origin}/${url}`;
  };
  
  // Funzione per ottenere l'immagine corretta considerando anche fallback e stati
  const getProductImage = (product: Product) => {
    // Verifica prima imageUrl (nuovo campo API)
    if (product.imageUrl && !failedImages[product.id]) {
      return getCompleteImageUrl(product.imageUrl);
    }
    
    // Poi verifica image (campo legacy)
    if (product.image && !failedImages[product.id]) {
      return getCompleteImageUrl(product.image);
    }
    
    // Se l'immagine è fallita o non esiste, cerca un'immagine statica per categoria
    if (product.category && staticImages[product.category.name]) {
      return staticImages[product.category.name];
    }
    
    // Cerca un'immagine statica in base al nome del prodotto
    const matchingKey = Object.keys(staticImages).find(key => 
      product.name.toLowerCase().includes(key.toLowerCase()));
    
    if (matchingKey) {
      return staticImages[matchingKey];
    }
    
    // Fallback all'immagine di default
    return staticImages.default;
  };

  // Fetch products when workspace changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!workspace?.id) return

      setIsLoading(true)
      try {
        const response = await productsApi.getAllForWorkspace(workspace.id)
        console.log('Risposta API prodotti:', response)
        
        // La risposta ora è un oggetto che contiene direttamente l'array dei prodotti
        if (response && Array.isArray(response.products)) {
          console.log('Product sample with category:', response.products[0])
          
          // Per test: assegna immagini di test a prodotti senza immagine
          const productsWithImages = assignTestImagesToProducts(response.products);
          setProducts(productsWithImages);
        } else {
          console.error('Formato risposta API non valido:', response)
          setProducts([])
          toast.error("Errore nel formato della risposta API")
        }
      } catch (error) {
        console.error("Failed to load products:", error)
        setProducts([])
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [workspace?.id])

  // Fetch categories when workspace changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!workspace?.id) return

      try {
        const categoriesData = await categoriesApi.getAllForWorkspace(workspace.id)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load categories:", error)
        toast.error("Failed to load categories")
      }
    }

    loadCategories()
  }, [workspace?.id])

  // Fetch suppliers when workspace changes
  useEffect(() => {
    const loadSuppliers = async () => {
      if (!workspace?.id) return

      try {
        // Assuming there's a suppliersApi with a getAllForWorkspace method
        const response = await fetch(`/api/workspaces/${workspace.id}/suppliers`);
        if (response.ok) {
          const suppliersData = await response.json();
          setSuppliers(suppliersData);
        } else {
          console.error("Failed to load suppliers:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load suppliers:", error)
      }
    }

    loadSuppliers()
  }, [workspace?.id])

  // Aggiungere un log per vedere quali immagini stanno venendo caricate
  useEffect(() => {
    if (products.length > 0) {
      console.log('Prodotti con immagini:', products.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.image,
        completeImageUrl: getCompleteImageUrl(p.image),
        productImage: getProductImage(p)
      })));
    }
  }, [products, failedImages]);

  // Filter products based on search value, selected category and selected supplier
  const filteredProducts = products.filter(
    (product) => 
      product.isActive && (
        // Category filter
        (selectedCategory === "all" || 
         (selectedCategory === "none" && !product.categoryId) || 
         product.categoryId === selectedCategory) &&
        // Supplier filter
        (selectedSupplier === "all" || 
         (selectedSupplier === "none" && !product.supplierId) || 
         product.supplierId === selectedSupplier) &&
        // Search filter
        (product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
         product.description.toLowerCase().includes(searchValue.toLowerCase()))
      )
  )

  // Create a properly formatted array of categories for the select dropdown
  const availableCategories = [
    { value: "none", label: "No Category" },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ];

  const handleAdd = async (formData: FormData) => {
    if (!workspace?.id) {
      toast.error("No workspace selected")
      return
    }

    try {
      // Usa direttamente l'URL dell'immagine fornito dal form
      const imageUrl = formData.get("image") as string || undefined;

      const newProduct = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(
          (formData.get("price") as string).replace("€", "").trim()
        ),
        stock: parseInt(formData.get("stock") as string) || 0,
        categoryId: formData.get("categoryId") as string,
        image: imageUrl,
        isActive: true,
      }

      const createdProduct = await productsApi.create(workspace.id, newProduct)
      setProducts([...products, createdProduct])
      toast.success("Product added successfully")
      setShowAddSheet(false)
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    }
  }

  const handleEdit = (product: Product) => {
    // Convert the API Product to our ProductDisplay type for the sheet
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image,
    })
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedProduct || !workspace?.id) return

    try {
      // Usa direttamente l'URL dell'immagine fornito dal form
      const imageUrl = formData.get("image") as string || undefined;

      const updatedProduct = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(
          (formData.get("price") as string).replace("€", "").trim()
        ),
        stock: parseInt(formData.get("stock") as string) || 0,
        categoryId: formData.get("categoryId") as string || undefined,
        image: imageUrl,
      }

      const response = await productsApi.update(
        selectedProduct.id,
        workspace.id,
        updatedProduct
      )
      setProducts(
        products.map((p) => (p.id === selectedProduct.id ? response : p))
      )
      toast.success("Product updated successfully")
      setShowEditSheet(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleDelete = (product: Product) => {
    // Convert the API Product to our ProductDisplay type
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image,
    })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || !workspace?.id) return

    try {
      await productsApi.delete(selectedProduct.id, workspace.id)
      
      // Invece di rimuovere il prodotto dall'array, aggiorniamo il suo stato isActive
      setProducts(products.map(p => {
        if (p.id === selectedProduct.id) {
          return {
            ...p, 
            isActive: false,
            status: 'INACTIVE'
          }
        }
        return p
      }))
      
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setShowDeleteDialog(false)
      setSelectedProduct(null)
    }
  }

  const handleCategoryChange = (productId: string, categoryId: string) => {
    setProducts(products.map(prod => {
      if (prod.id === productId) {
        const selectedCategory = categories.find(cat => cat.id === categoryId);
        
        return {
          ...prod,
          categoryId: categoryId === "none" ? null : categoryId,
          category: selectedCategory ? {
            id: selectedCategory.id,
            name: selectedCategory.name,
            workspaceId: workspace?.id || "",
            slug: selectedCategory.id,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : null
        };
      }
      return prod;
    }));
  };

  if (isWorkspaceLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        Loading products...
      </div>
    )
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Products"
            titleIcon={<Package2 className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search products..."
            onAdd={() => setShowAddSheet(true)}
            addButtonText="Add Product"
          />

          {/* Number of items display */}
          <div className="text-sm text-muted-foreground ml-1 mb-2">
            {filteredProducts.length} items
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4 ml-1">
            {/* Category filter */}
            <div className="flex items-center">
              <Tag className="h-4 w-4 text-muted-foreground mr-2" />
              <label className="mr-2 text-sm font-medium">Filter by category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Supplier filter */}
            <div className="flex items-center">
              <Tag className="h-4 w-4 text-muted-foreground mr-2" />
              <label className="mr-2 text-sm font-medium">Filter by supplier:</label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  <SelectItem value="none">No Supplier</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="mb-3 aspect-video relative overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="object-cover w-full h-full"
                      onError={() => {
                        console.error(`Failed to load image for ${product.name}:`, product.image);
                        setFailedImages(prev => ({...prev, [product.id]: true}));
                      }}
                    />
                  </div>

                  {/* Header con nome e prezzo */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate flex-1">
                      {product.name}
                    </h3>
                    <span className="text-green-600 font-semibold ml-2">
                      {formatPrice(product.price, workspace?.currency)}
                    </span>
                  </div>

                  {/* Category - with dropdown to change */}
                  <div className="mb-2 flex items-center">
                    <div className="flex-1">
                      {product.categoryId && (
                        <CategoryBadge 
                          category={product.category || product.categoryId} 
                        />
                      )}
                      {!product.categoryId && (
                        <span className="text-xs text-gray-500">No category</span>
                      )}
                    </div>
                  </div>

                  {/* Supplier */}
                  {product.supplier && (
                    <div className="mb-2 flex items-center">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">Supplier: {product.supplier.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  {/* Stock and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : product.status === "INACTIVE"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4 text-green-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit product</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete product</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductSheet
        product={null}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add New Product"
        availableCategories={availableCategories}
        onSubmit={handleAdd}
      />

      <ProductSheet
        product={selectedProduct}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Product"
        availableCategories={availableCategories}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone and will permanently remove the product from your inventory.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
