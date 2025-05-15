import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/hooks/use-workspace"
import { getCurrencySymbol } from "@/utils/format"
import { useEffect, useState } from "react"

interface Product {
  id: string
  name: string
  description?: string
  price: string
  stock: number
  categoryId?: string | null
  image?: string | null
  imageUrl?: string | null
  [key: string]: any;
}

interface CategoryOption {
  value: string
  label: string
}

interface ProductSheetProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (formData: FormData) => void
  title: string
  availableCategories: CategoryOption[]
}

export function ProductSheet({
  product,
  open,
  onOpenChange,
  onSubmit,
  title,
  availableCategories,
}: ProductSheetProps) {
  const { workspace } = useWorkspace()
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  
  // Image URL state
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Ottieni il simbolo della valuta dal workspace
  const currencySymbol = getCurrencySymbol(workspace?.currency)

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setStock(product.stock?.toString() || "0");
      setCategoryId(product.categoryId || "");
      
      // Utilizza imageUrl se disponibile, altrimenti image
      const imageToUse = product.imageUrl || product.image || "";
      
      if (imageToUse) {
        setImageUrl(imageToUse);
        setImagePreview(getCompleteImageUrl(imageToUse));
      } else {
        setImageUrl("");
        setImagePreview(null);
      }
    } else {
      // Reset form for new product
      setName("");
      setDescription("");
      setPrice("");
      setStock("0");
      setCategoryId("");
      setImageUrl("");
      setImagePreview(null);
    }
  }, [product, open]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    
    if (categoryId) {
      formData.append("categoryId", categoryId);
    }
    
    // Handle image URL - assegna sia a image che a imageUrl per compatibilità
    if (imageUrl) {
      formData.append("image", imageUrl);
      formData.append("imageUrl", imageUrl);
    }
    
    onSubmit(formData);
    onOpenChange(false);
  };

  // Preview the image when URL changes
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    if (url) {
      setImagePreview(getCompleteImageUrl(url));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:w-[540px] md:w-[700px] p-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
            <SheetDescription>
              {product ? "Edit an existing product" : "Add a new product to your inventory"}
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price ({currencySymbol})
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                {/* Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Image URL Input */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">
                  Product Image URL
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
                
                {imagePreview && (
                  <div className="mt-2">
                    <Card className="overflow-hidden">
                      <div className="relative w-full h-48">
                        <img 
                          src={imagePreview}
                          alt="Product preview" 
                          className="w-full h-full object-cover"
                          onError={() => {
                            console.error(`Failed to load image preview:`, imageUrl);
                            setImagePreview(null);
                          }}
                        />
                      </div>
                    </Card>
                    <p className="text-xs text-gray-500 mt-1">Image preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <SheetFooter className="px-6 py-4 border-t">
            <div className="flex justify-end w-full gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {product ? "Save Changes" : "Add Product"}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
