import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useWorkspace } from "@/hooks/use-workspace"
import { servicesApi } from "@/services/servicesApi"
import { Wrench } from "lucide-react"
import { ReactNode, useEffect, useState } from "react"
import toast from "react-hot-toast"

// Map API service to display format
interface DisplayService {
  id: string
  name: string
  description: string
  price: string
  status: "active" | "inactive"
  [key: string]: string | ReactNode
}

export default function ServicesPage() {
  const { workspace } = useWorkspace()
  const [services, setServices] = useState<DisplayService[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<DisplayService | null>(null)
  // Create state for currency symbol to force rerenders
  const [currentCurrencySymbol, setCurrentCurrencySymbol] = useState("€")

  // Get the currency symbol for the current workspace
  const getCurrencySymbol = () => {
    if (!workspace || !workspace.currency) return "€"; // Default to Euro
    
    // Convert currency code to symbol
    switch (workspace.currency) {
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "EUR":
      default:
        return "€";
    }
  };

  // Update currency symbol whenever workspace changes
  useEffect(() => {
    setCurrentCurrencySymbol(getCurrencySymbol());
  }, [workspace]);

  // Handle opening add dialog
  const handleOpenAddSheet = () => {
    // Force update of currency symbol before opening sheet
    const symbol = getCurrencySymbol();
    console.log("Opening sheet with currency symbol:", symbol);
    setCurrentCurrencySymbol(symbol);
    setShowAddSheet(true);
  };

  // Load services when the workspace is available or when currency changes
  useEffect(() => {
    if (workspace?.id) {
      loadServices()
    }
  }, [workspace?.id, workspace?.currency])

  const loadServices = async () => {
    if (!workspace?.id) return
    
    try {
      setLoading(true)
      console.log("Fetching services for workspace:", workspace.id)
      console.log("API URL:", `api/workspaces/${workspace.id}/services`)
      
      const data = await servicesApi.getAllForWorkspace(workspace.id)
      console.log("Services API response:", data)
      
      // Map API service to display format
      const formattedServices: DisplayService[] = data.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        status: service.isActive ? "active" : "inactive"
      }))
      
      setServices(formattedServices)
      console.log("Loaded services with currency:", workspace.currency, "Symbol:", getCurrencySymbol())
    } catch (error) {
      console.error("Failed to load services", error)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) =>
    Object.values(service).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleToggleStatus = async (service: DisplayService) => {
    if (!workspace?.id) return
    
    try {
      const newStatus = service.status === "active" ? "inactive" : "active"
      
      await servicesApi.update(service.id, {
        isActive: newStatus === "active"
      })
      
      setServices(
        services.map((s) => ({
          ...s,
          status: s.id === service.id ? newStatus : s.status,
        }))
      )
      
      toast.success(`Service ${newStatus === "active" ? "activated" : "deactivated"}`)
    } catch (error) {
      console.error("Failed to update service status", error)
      toast.error("Failed to update service status")
    }
  }

  const columns = [
    { header: "Name", accessorKey: "name" as keyof DisplayService },
    { header: "Description", accessorKey: "description" as keyof DisplayService },
    {
      header: "Price",
      accessorKey: "price" as keyof DisplayService,
      cell: ({ row }: { row: { original: DisplayService } }) => (
        <span className="font-medium">{currentCurrencySymbol}{row.original.price}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof DisplayService,
      cell: ({ row }: { row: { original: DisplayService } }) => (
        <Button
          variant={row.original.status === "active" ? "default" : "outline"}
          onClick={() => handleToggleStatus(row.original)}
          className="w-24 cursor-pointer"
        >
          <StatusBadge status={row.original.status}>
            {row.original.status.charAt(0).toUpperCase() +
              row.original.status.slice(1)}
          </StatusBadge>
        </Button>
      ),
    },
  ]

  // Force log of current currency symbol for debugging
  console.log("Current currency symbol in component:", currentCurrencySymbol);
  console.log("Workspace currency:", workspace?.currency);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    // Get form data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const isActive = formData.get("isActive") === "true";
    
    console.log("Form data:", { name, description, priceStr, isActive, "raw": formData.get("isActive") });
    
    // Validate
    if (!name || !description || !priceStr) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Convert price to number
    const priceClean = priceStr.replace(currentCurrencySymbol, "").trim();
    let price: number;
    try {
      price = parseFloat(priceClean);
      if (isNaN(price) || price <= 0) {
        toast.error("Price must be a positive number");
        return;
      }
    } catch (err) {
      toast.error("Invalid price format");
      return;
    }
    
    try {
      const result = await servicesApi.create(workspace.id, {
        name,
        description,
        price,
        isActive,
        currency: workspace.currency || "EUR"
      })
      
      // Chiudiamo prima la sheet
      setShowAddSheet(false)
      toast.success("Service added successfully")
      
      // Poi forziamo il ricaricamento dei servizi
      await loadServices()
    } catch (error: any) {
      console.error("Failed to add service", error)
      
      // More specific error message if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to add service");
      }
    }
  }

  const handleOpenEditSheet = (service: DisplayService) => {
    // Force update of currency symbol before opening sheet
    const symbol = getCurrencySymbol();
    console.log("Opening edit sheet with currency symbol:", symbol);
    console.log("Service to edit:", service);
    
    // Assicuriamoci che il servizio abbia tutti i campi necessari
    const enhancedService = {
      ...service,
      isActive: service.status === "active"
    };
    
    setCurrentCurrencySymbol(symbol);
    setSelectedService(enhancedService);
    setShowEditSheet(true);
    
    // Log after state update to confirm
    setTimeout(() => {
      console.log("Edit sheet should be open now, showEditSheet:", showEditSheet, "selectedService:", selectedService);
    }, 100);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    // Get form data and validate
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const isActive = formData.get("isActive") === "true";
    
    console.log("Form data:", { name, description, priceStr, isActive, "raw": formData.get("isActive") });
    
    // Validate
    if (!name || !description || !priceStr) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Convert price to number
    const priceClean = priceStr.replace(currentCurrencySymbol, "").trim();
    let price: number;
    try {
      price = parseFloat(priceClean);
      if (isNaN(price) || price <= 0) {
        toast.error("Price must be a positive number");
        return;
      }
    } catch (err) {
      toast.error("Invalid price format");
      return;
    }
    
    try {
      console.log("Updating service with data:", { 
        id: selectedService.id, 
        name, 
        description, 
        price, 
        isActive,
        currency: workspace?.currency || "EUR" 
      });
      
      // First update the UI state to close the sheet
      setShowEditSheet(false);
      setSelectedService(null);
      
      // Then make the API call
      await servicesApi.update(selectedService.id, {
        name,
        description,
        price,
        isActive,
        currency: workspace?.currency || "EUR"
      });
      
      // Show success message
      toast.success("Service updated successfully");
      
      // Force a complete reload of services
      if (workspace?.id) {
        await loadServices();
      }
    } catch (error) {
      console.error("Failed to update service", error);
      toast.error("Failed to update service");
      
      // Re-enable editing on error
      setShowEditSheet(true);
    }
  }

  const handleDelete = (service: DisplayService) => {
    setSelectedService(service)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedService) return
    
    try {
      await servicesApi.delete(selectedService.id)
      
      // Update local state
      setServices(services.filter((s) => s.id !== selectedService.id))
      setShowDeleteDialog(false)
      setSelectedService(null)
      toast.success("Service deleted successfully")
    } catch (error) {
      console.error("Failed to delete service", error)
      toast.error("Failed to delete service")
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  // Debug info per il form di modifica
  console.log("Rendering with edit state:", { showEditSheet, selectedService });

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Services"
            titleIcon={<Wrench className="mr-2 h-5 w-5 text-green-500" />}
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search services..."
            itemCount={filteredServices.length}
            onAdd={handleOpenAddSheet}
            addButtonText="Add Service"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredServices}
              onEdit={(service) => {
                console.log("Edit button clicked for service:", service);
                handleOpenEditSheet(service);
              }}
              onDelete={(service) => {
                console.log("Delete button clicked for service:", service);
                handleDelete(service);
              }}
              globalFilter={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* Add Service Sheet */}
      <Sheet open={showAddSheet} onOpenChange={(open) => {
        setShowAddSheet(open);
        if (!open && workspace?.id) {
          // Se la sheet viene chiusa, ricarica i servizi
          loadServices();
        }
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Add New Service</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAdd} className="flex flex-col h-full">
            <div className="overflow-y-auto px-6 flex-grow">
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Service name"
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ({currentCurrencySymbol})</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="0.00"
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
                    defaultChecked={true}
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
                Add Service
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Service Sheet */}
      <Sheet open={showEditSheet} onOpenChange={(open) => {
        setShowEditSheet(open);
        if (!open && workspace?.id) {
          // Se la sheet viene chiusa, ricarica i servizi
          loadServices();
        }
      }}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Edit Service</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full">
            <div className="overflow-y-auto px-6 flex-grow">
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Service name"
                    defaultValue={selectedService?.name || ""}
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
                    defaultValue={selectedService?.description || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ({currentCurrencySymbol})</Label>
                  <Input
                    id="price"
                    name="price"
                    placeholder="0.00"
                    defaultValue={selectedService?.price || ""}
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
                    defaultChecked={selectedService?.status === "active"}
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
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        description={`Are you sure you want to delete ${selectedService?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
