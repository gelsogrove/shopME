import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PageHeader } from "@/components/shared/PageHeader"
import { ServiceSheet } from "@/components/shared/ServiceSheet"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
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
      const data = await servicesApi.getAllForWorkspace(workspace.id)
      
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
        currency: workspace.currency || "EUR"
      })
      
      // Add to the local state
      const newService: DisplayService = {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.price.toString(),
        status: result.isActive ? "active" : "inactive"
      }
      
      setServices([...services, newService])
      setShowAddSheet(false)
      toast.success("Service added successfully")
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
    const isActive = !!formData.get("isActive");
    
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
      
      const result = await servicesApi.update(selectedService.id, {
        name,
        description,
        price,
        isActive,
        currency: workspace?.currency || "EUR"
      })
      
      console.log("Update result:", result);
      
      // Update the local state
      const updatedService: DisplayService = {
        id: result.id,
        name: result.name,
        description: result.description,
        price: result.price.toString(),
        status: result.isActive ? "active" : "inactive"
      }
      
      setServices(
        services.map((s) => (s.id === selectedService.id ? updatedService : s))
      )
      
      setShowEditSheet(false)
      setSelectedService(null)
      toast.success("Service updated successfully")
    } catch (error) {
      console.error("Failed to update service", error)
      toast.error("Failed to update service")
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
            itemCount={services.length}
            onAdd={handleOpenAddSheet}
            addButtonText="Add Service"
          />

          <div className="mt-6 w-full">
            <TooltipProvider>
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
            </TooltipProvider>
          </div>
        </div>
      </div>

      <ServiceSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAdd}
        service={null}
        title="Add New Service"
        currencySymbol={currentCurrencySymbol}
      />

      <ServiceSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleEditSubmit}
        service={selectedService}
        title="Edit Service"
        currencySymbol={currentCurrencySymbol}
      />

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
