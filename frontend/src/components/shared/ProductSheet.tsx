import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  id: string
  name: string
  description?: string
  price: string
  stock: number
  categoryId?: string | null
  image?: string | null
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
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
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
  // If product is provided, ensure all required fields have default values
  const safeProduct = product ? {
    ...product,
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    stock: product.stock || 0,
    categoryId: product.categoryId || "",
    image: product.image || ""
  } : null;
  
  // Custom submit handler that wraps the provided onSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
    // Manually trigger the sheet to close after submission
    onOpenChange(false);
  };
  
  if (!open) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[80%] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
          <SheetDescription>
            {product ? "Edit an existing product" : "Add a new product to your inventory"}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="overflow-y-auto px-6 flex-grow">
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Product name"
                  defaultValue={safeProduct?.name || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="min-h-[150px]"
                  placeholder="Product description"
                  defaultValue={safeProduct?.description || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (€)</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="0.00"
                  defaultValue={safeProduct?.price || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={safeProduct?.stock || "0"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" defaultValue={safeProduct?.categoryId || ""}>
                  <SelectTrigger id="categoryId">
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
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={safeProduct?.image || ""}
                />
              </div>
            </div>
          </div>
          <SheetFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
            <SheetClose asChild>
              <Button 
                type="button" 
                variant="outline"
                className="border-input hover:bg-accent"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {safeProduct ? "Save Changes" : "Add Product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
