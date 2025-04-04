import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Service {
  id: string
  name: string
  description: string
  price: string
}

interface ServiceSheetProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  title: string
  isNew?: boolean
}

export function ServiceSheet({
  service,
  open,
  onOpenChange,
  onSubmit,
  title,
  isNew = false,
}: ServiceSheetProps) {
  if (!isNew && !service) return null

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
                placeholder="Service name"
                defaultValue={service?.name || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Service description"
                defaultValue={service?.description || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                name="price"
                placeholder="0.00"
                defaultValue={service?.price || ""}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            {isNew ? "Add Service" : "Save Changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
