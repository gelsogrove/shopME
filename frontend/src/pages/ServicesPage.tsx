import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { Service, servicesApi } from "@/services/servicesApi"
import { commonStyles } from "@/styles/common"
import { Wrench } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ServicesPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      if (!workspace?.id) return
      try {
        const data = await servicesApi.getAllForWorkspace(workspace.id)
        setServices(data)
      } catch (error) {
        console.error("Error loading services:", error)
        toast.error("Failed to load services")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWorkspace) {
      loadServices()
    }
  }, [workspace?.id, isLoadingWorkspace])

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
        <span>{row.original.price}€</span>
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
      currency: "€",
    }

    try {
      const newService = await servicesApi.create(workspace.id, data)
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
      currency: "€",
    }

    try {
      const updatedService = await servicesApi.update(
        selectedService.id,
        workspace.id,
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
      await servicesApi.delete(selectedService.id, workspace.id)
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
        <Label htmlFor="price">Price (€)</Label>
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
        onAdd={() => setShowAddSheet(true)}
        data={filteredServices}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Add Service Sheet */}
      <FormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add Service"
        description="Add a new service to your workspace"
        onSubmit={handleAdd}
        submitLabel="Add Service"
      >
        {renderFormFields(null)}
      </FormSheet>

      {/* Edit Service Sheet */}
      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title={selectedService ? "Edit Service" : "Add Service"}
        description={
          selectedService
            ? "Edit an existing service"
            : "Add a new service to your workspace"
        }
        onSubmit={handleEditSubmit}
        submitLabel={selectedService ? "Save Changes" : "Add Service"}
      >
        {renderFormFields(selectedService)}
      </FormSheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Service"
        description={`Are you sure you want to delete ${selectedService?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}
