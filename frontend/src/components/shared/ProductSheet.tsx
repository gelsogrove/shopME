import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useEffect, useState } from "react"

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

interface ProductSheetProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  title: string
  availableCategories: string[]
  isNew?: boolean
  showImageField?: boolean
}

export function ProductSheet({
  product,
  open,
  onOpenChange,
  onSubmit,
  title,
  availableCategories,
  isNew = false,
  showImageField = false,
}: ProductSheetProps) {
  const [imageUrl, setImageUrl] = useState<string>(product?.image || "")
  const [previewAvailable, setPreviewAvailable] = useState<boolean>(
    !!product?.image
  )

  useEffect(() => {
    if (product?.image) {
      setImageUrl(product.image)
      setPreviewAvailable(true)
    } else {
      setImageUrl("")
      setPreviewAvailable(false)
    }
  }, [product])

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
    setPreviewAvailable(!!e.target.value)
  }

  if (!isNew && !product) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Product name"
                defaultValue={product?.name || ""}
                required
                className="border-green-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="w-full min-h-[100px] rounded-md border border-green-500 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Product description"
                defaultValue={product?.description || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                placeholder="0.00"
                defaultValue={product?.price || ""}
                required
                className="border-green-500 focus-visible:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product?.quantity || "0"}
                required
                className="border-green-500 focus-visible:ring-green-500"
              />
            </div>
            {showImageField && (
              <div className="space-y-3">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  placeholder="https://example.com/image.jpg"
                  defaultValue={product?.image || ""}
                  onChange={handleImageUrlChange}
                  className="border-green-500 focus-visible:ring-green-500"
                />
                {previewAvailable && (
                  <div className="mt-2">
                    <p className="text-sm mb-1">Preview:</p>
                    <div className="w-full h-48 overflow-hidden rounded-md border border-green-200">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          setPreviewAvailable(false)
                          ;(e.target as HTMLImageElement).src =
                            "https://placehold.co/600x400/e2e8f0/64748b?text=Preview+Not+Available"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      name="categories"
                      value={category}
                      defaultChecked={product?.categories.includes(category)}
                      className="border-green-500 text-green-600 focus:ring-green-500"
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-sm font-normal"
                    >
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {!isNew && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status"
                    name="status"
                    value="active"
                    defaultChecked={product?.status === "active"}
                    className="border-green-500 text-green-600 focus:ring-green-500"
                  />
                  <Label htmlFor="status" className="text-sm font-normal">
                    Active
                  </Label>
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isNew ? "Add Product" : "Save Changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
