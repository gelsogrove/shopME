import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  status: "active" | "inactive"
  image: string
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
  const [imagePreview, setImagePreview] = useState<string>(product?.image || "")

  if (!isNew && !product) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImagePreview(url)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[45%] sm:max-w-[45%] !p-0 [&>button]:hidden">
        <div className="flex items-start p-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </SheetClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">{title}</SheetTitle>
          </SheetHeader>

          <form onSubmit={onSubmit} className="mt-6 grid gap-6 pb-8">
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={product?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={product?.description}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input
                    id="price"
                    name="price"
                    defaultValue={product?.price}
                    required
                  />
                </div>
                {showImageField && (
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      defaultValue={product?.image}
                      onChange={handleImageChange}
                      placeholder="Enter image URL"
                    />
                    {imagePreview && (
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-contain bg-gray-50"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                              "https://placehold.co/600x400/e2e8f0/64748b?text=Invalid+Image"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="categories">Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          name="categories"
                          value={category}
                          defaultChecked={product?.categories.includes(
                            category
                          )}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-[#25D366] hover:bg-[#1ea855] text-white"
              >
                {isNew ? "Add Product" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
