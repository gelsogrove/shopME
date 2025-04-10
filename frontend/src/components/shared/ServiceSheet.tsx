import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { ReactNode } from "react"

interface Service {
  id: string
  name: string
  description: string
  price: string
  isActive?: boolean
  status: "active" | "inactive"
  [key: string]: string | ReactNode | boolean | undefined
}

interface ServiceSheetProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  title: string
  currencySymbol: string
}

export function ServiceSheet({
  service,
  open,
  onOpenChange,
  onSubmit,
  title,
  currencySymbol,
}: ServiceSheetProps) {
  console.log("ServiceSheet rendering with open:", open, "service:", service?.name || "new", "full service:", service);
  
  if (!open) {
    return null;
  }
  
  // If service is provided, ensure all required fields have default values
  const safeService = service ? {
    ...service,
    name: service.name || "",
    description: service.description || "",
    price: service.price || "",
    isActive: service.status === "active" || service.isActive === true
  } : null;
  
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
                defaultValue={safeService?.name || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Service description"
                defaultValue={safeService?.description || ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ({currencySymbol})</Label>
              <Input
                id="price"
                name="price"
                placeholder="0.00"
                defaultValue={safeService?.price || ""}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="text-sm font-medium">
                Active
              </Label>
              <Switch 
                id="isActive" 
                name="isActive"
                defaultChecked={safeService?.isActive !== false}
                value="true"
              />
            </div>
          </div>
          <SheetFooter className="mt-6 px-0">
            <Button type="submit" className="w-full">
              {safeService ? "Save Changes" : "Add Service"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
