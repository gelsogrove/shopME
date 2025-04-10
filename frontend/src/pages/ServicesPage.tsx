import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
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
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<DisplayService | null>(null)

  // Load services when the workspace is available
  useEffect(() => {
    if (workspace?.id) {
      loadServices()
    }
  }, [workspace?.id])

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
        <span className="font-medium">€{row.original.price}</span>
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

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    try {
      const result = await servicesApi.create(workspace.id, {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat((formData.get("price") as string).replace("€", "").trim()),
        currency: "€"
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
      setShowAddDialog(false)
      toast.success("Service added successfully")
    } catch (error) {
      console.error("Failed to add service", error)
      toast.error("Failed to add service")
    }
  }

  const handleEdit = (service: DisplayService) => {
    setSelectedService(service)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    try {
      const result = await servicesApi.update(selectedService.id, {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat((formData.get("price") as string).replace("€", "").trim()),
      })
      
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
      
      setShowEditDialog(false)
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

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Services"
            titleIcon={<Wrench className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search services..."
            itemCount={services.length}
            onAdd={() => setShowAddDialog(true)}
            addButtonText="Add Service"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredServices}
              onEdit={handleEdit}
              onDelete={handleDelete}
              globalFilter={searchQuery}
            />
          </div>
        </div>
      </div>

      <FormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New Service"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            className: "min-h-[200px]",
          },
          {
            name: "price",
            label: "Price (€)",
            type: "text",
          },
        ]}
        onSubmit={handleAdd}
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Service"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            defaultValue: selectedService?.name,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            className: "min-h-[200px]",
            defaultValue: selectedService?.description,
          },
          {
            name: "price",
            label: "Price (€)",
            type: "text",
            defaultValue: selectedService?.price,
          },
        ]}
        onSubmit={handleEditSubmit}
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
