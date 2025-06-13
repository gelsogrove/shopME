import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { Service, servicesApi } from "@/services/servicesApi"
import { commonStyles } from "@/styles/common"
import { formatPrice, getCurrencySymbol } from "@/utils/format"
import { Wrench } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ServicesPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const loadServices = async () => {
    if (!workspace?.id) return
    try {
      const data = await servicesApi.getServices(workspace.id)
      setServices(data)
    } catch (error) {
      console.error("Error loading services:", error)
      toast.error("Failed to load services")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoadingWorkspace) {
      loadServices()
    }
  }, [workspace?.id, isLoadingWorkspace])

  const handleGenerateEmbeddings = async () => {
    if (!workspace?.id) return

    setIsGeneratingEmbeddings(true)
    try {
      await servicesApi.generateEmbeddings(workspace.id)
      
      toast.success('Service embeddings generation started successfully')
      
      // Reload services to see updated status
      await loadServices()
    } catch (error) {
      console.error('Failed to generate service embeddings:', error)
      toast.error('Failed to generate service embeddings')
    } finally {
      setIsGeneratingEmbeddings(false)
    }
  }

  const filteredServices = services.filter((service) =>
    Object.values(service).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Service, size: 200 },
    { 
      header: "Description", 
      accessorKey: "description" as keyof Service, 
      size: 400,
      cell: ({ row }: { row: { original: Service } }) => {
        const description = row.original.description;
        const maxLength = 80;
        const isTruncated = description.length > maxLength;
        
        return (
          <div>
            {isTruncated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      {description.substring(0, maxLength)}...
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4 text-sm">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              description
            )}
          </div>
        );
      }
    },
    {
      header: "Price",
      accessorKey: "price" as keyof Service,
      size: 100,
      cell: ({ row }: { row: { original: Service } }) => (
        <span>{formatPrice(row.original.price, workspace?.currency)}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Service,
      size: 100,
      cell: ({ row }: { row: { original: Service } }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isActive 
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error("Invalid price")
      return
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price,
      currency: workspace.currency || "EUR",
      isActive: formData.get("isActive") === "on"
    }

    try {
      const newService = await servicesApi.createService(workspace.id, data)
      setServices([...services, newService])
      setShowAddSheet(false)
      toast.success("Service created successfully")
    } catch (error) {
      console.error("Error creating service:", error)
      toast.error("Failed to create service")
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error("Invalid price")
      return
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price,
      currency: workspace.currency || "EUR",
      isActive: formData.get("isActive") === "on"
    }

    try {
      const updatedService = await servicesApi.updateService(
        workspace.id,
        selectedService.id,
        data
      )
      setServices(
        services.map((s) => (s.id === selectedService.id ? updatedService : s))
      )
      setShowEditSheet(false)
      setSelectedService(null)
      toast.success("Service updated successfully")
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    }
  }

  const handleDelete = (service: Service) => {
    setSelectedService(service)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedService || !workspace?.id) return

    try {
      await servicesApi.deleteService(workspace.id, selectedService.id)
      setServices(services.filter((s) => s.id !== selectedService.id))
      setShowDeleteDialog(false)
      setSelectedService(null)
      toast.success("Service deleted successfully")
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  const currencySymbol = getCurrencySymbol(workspace?.currency)

  const renderFormFields = (service: Service | null) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Service name"
          defaultValue={service?.name}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          className="w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Service description - Provide detailed information about the service, including what it includes, limitations, and any special requirements"
          defaultValue={service?.description}
          required
        />
        <p className="text-xs text-gray-500">Enter a detailed description of the service. You can include features, benefits, and any important information customers should know.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price ({currencySymbol})</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Service price"
          defaultValue={service?.price}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive" 
          name="isActive"
          defaultChecked={service ? service.isActive : true}
        />
        <Label htmlFor="isActive">Active</Label>
        <p className="text-xs text-gray-500 ml-2">Only active services will be shown to customers</p>
      </div>
    </div>
  )

  return (
    <PageLayout>
      <CrudPageContent
        title="Services"
        titleIcon={<Wrench className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search services..."
        extraButtons={
          <Button
            onClick={handleGenerateEmbeddings}
            disabled={isGeneratingEmbeddings}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGeneratingEmbeddings ? "Generating..." : "Generate Embeddings"}
          </Button>
        }
        onAdd={() => setShowAddSheet(true)}
        addButtonText="Add"
        data={filteredServices}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add Service"
        description="Add a new service that you offer to your customers"
        onSubmit={handleAdd}
      >
        {renderFormFields(null)}
      </FormSheet>

      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Service"
        description="Edit the details of this service"
        onSubmit={handleEditSubmit}
      >
        {selectedService && renderFormFields(selectedService)}
      </FormSheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        description={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}
