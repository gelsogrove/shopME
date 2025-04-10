import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Wrench } from "lucide-react"
import { ReactNode, useState } from "react"

interface Service {
  id: string
  name: string
  description: string
  price: string
  status: "active" | "inactive"
  [key: string]: string | ReactNode
}

const initialServices: Service[] = [
  {
    id: "1",
    name: "Shipping Service",
    description:
      "Express courier shipping service with delivery within 24/48 business hours.",
    price: "9.99",
    status: "active",
  },
  {
    id: "2",
    name: "Christmas Gift Wrapping",
    description:
      "Special packaging for Christmas gifts with wrapping paper, ribbons and personalized card.",
    price: "12.50",
    status: "active",
  },
  {
    id: "3",
    name: "Shipping Insurance",
    description:
      "Full insurance coverage for transported goods up to €1000 in value.",
    price: "7.99",
    status: "inactive",
  },
  {
    id: "4",
    name: "Gift Wrapping",
    description:
      "Standard gift wrapping service with elegant paper, ribbon and gift tag.",
    price: "5.99",
    status: "active",
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const filteredServices = services.filter((service) =>
    Object.values(service).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleToggleStatus = (service: Service) => {
    setServices(
      services.map((s) => ({
        ...s,
        status:
          s.id === service.id
            ? service.status === "active"
              ? "inactive"
              : "active"
            : s.status,
      }))
    )
  }

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Service },
    { header: "Description", accessorKey: "description" as keyof Service },
    {
      header: "Price",
      accessorKey: "price" as keyof Service,
      cell: ({ row }: { row: { original: Service } }) => (
        <span className="font-medium">€{row.original.price}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Service,
      cell: ({ row }: { row: { original: Service } }) => (
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

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
      status: "active",
    }

    setServices([...services, newService])
    setShowAddDialog(false)
  }

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setShowEditDialog(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedService) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedService: Service = {
      ...selectedService,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
    }

    setServices(
      services.map((s) => (s.id === selectedService.id ? updatedService : s))
    )
    setShowEditDialog(false)
    setSelectedService(null)
  }

  const handleDelete = (service: Service) => {
    setSelectedService(service)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedService) return
    setServices(services.filter((s) => s.id !== selectedService.id))
    setShowDeleteDialog(false)
    setSelectedService(null)
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
