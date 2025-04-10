import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle
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
  
  // If service is provided, ensure all required fields have default values
  const safeService = service ? {
    ...service,
    name: service.name || "",
    description: service.description || "",
    price: service.price || "",
    isActive: service.status === "active" || service.isActive === true
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
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="overflow-y-auto px-6 flex-grow">
            <div className="space-y-6 py-6">
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
              {safeService ? "Save Changes" : "Add Service"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
