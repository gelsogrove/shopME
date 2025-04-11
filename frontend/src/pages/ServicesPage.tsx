import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { useWorkspace } from "@/hooks/use-workspace"
import { Service, servicesApi } from "@/services/servicesApi"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ServicesPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    const loadServices = async () => {
      if (!workspace?.id) return
      try {
        const data = await servicesApi.getAllForWorkspace(workspace.id)
        setServices(data)
      } catch (error) {
        console.error('Error loading services:', error)
        toast.error('Failed to load services')
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
    { header: "Name", accessorKey: "name" as keyof Service },
    { header: "Description", accessorKey: "description" as keyof Service },
    { header: "Price", accessorKey: "price" as keyof Service },
    { header: "Currency", accessorKey: "currency" as keyof Service },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error('Invalid price')
      return
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price,
      currency: formData.get("currency") as string || "€",
    }

    try {
      const newService = await servicesApi.create(workspace.id, data)
      setServices([...services, newService])
      setShowAddDialog(false)
      toast.success('Service created successfully')
    } catch (error) {
      console.error('Error creating service:', error)
      toast.error('Failed to create service')
    }
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error('Invalid price')
      return
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price,
      currency: formData.get("currency") as string,
    }

    try {
      const updatedService = await servicesApi.update(selectedService.id, workspace.id, data)
      setServices(
        services.map((s) =>
          s.id === selectedService.id ? updatedService : s
        )
      )
      setShowEditDialog(false)
      setSelectedService(null)
      toast.success('Service updated successfully')
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error('Failed to update service')
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
      toast.success('Service deleted successfully')
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error('Failed to delete service')
    }
  }

  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Services"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search services..."
        onAdd={() => setShowAddDialog(true)}
        itemCount={filteredServices.length}
      />

      <div className="mt-6">
        <DataTable
          data={filteredServices}
          columns={columns}
          globalFilter={searchValue}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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
            type: "text",
          },
          {
            name: "price",
            label: "Price",
            type: "text",
          },
          {
            name: "currency",
            label: "Currency",
            type: "text",
            defaultValue: "€",
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
            type: "text",
            defaultValue: selectedService?.description,
          },
          {
            name: "price",
            label: "Price",
            type: "text",
            defaultValue: selectedService?.price.toString(),
          },
          {
            name: "currency",
            label: "Currency",
            type: "text",
            defaultValue: selectedService?.currency,
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
