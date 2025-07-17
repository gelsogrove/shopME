import { useWorkspace } from "@/hooks/use-workspace"
import { clientsApi, type Client } from "@/services/clientsApi"
import { commonStyles } from "@/styles/common"
import { MessageSquare, Pencil, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/shared/PageHeader"
import { DataTable } from "../components/shared/DataTable"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { toast } from "../lib/toast"
import { type ColumnDef } from "@tanstack/react-table"

// Map Client interface to Customer interface for compatibility
interface Customer {
  id: string
  name: string
  phone: string
  email: string
  totalOrders: number
  totalSpent: number
  lastActive: string
  status: "active" | "inactive"
  gdprConsent: boolean
  pushNotificationsConsent: boolean
  activeChatbot: boolean
  discount: number
  company?: string
}

// Convert Client to Customer format
const clientToCustomer = (client: Client): Customer => ({
  id: client.id,
  name: client.name,
  phone: client.phone,
  email: client.email || "",
  totalOrders: 0,
  totalSpent: 0,
  lastActive: client.updatedAt || client.createdAt,
  status: client.isActive ? "active" : "inactive",
  gdprConsent: client.gdprConsent || false,
  pushNotificationsConsent: client.pushNotificationsConsent || false,
  activeChatbot: client.activeChatbot || false,
  discount: client.discount || 0,
  company: client.company || undefined,
})

export default function CustomersPage() {
  const { workspace } = useWorkspace()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    discount: 0,
    gdprConsent: false,
    pushNotificationsConsent: false,
    activeChatbot: false,
  })

  // Load customers from API
  useEffect(() => {
    const loadCustomers = async () => {
      if (!workspace?.id) return

      setIsLoading(true)
      try {
        const clients = await clientsApi.getAllForWorkspace(workspace.id)
        const customerData = clients.map(clientToCustomer)
        setCustomers(customerData)
      } catch (error) {
        console.error("Failed to load customers:", error)
        toast.error("Failed to load customers")
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [workspace?.id])

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = searchValue === "" || 
      customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone.includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      (customer.company && customer.company.toLowerCase().includes(searchValue.toLowerCase()))

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Define columns for DataTable
  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <p>{row.original.phone}</p>
          <p className="text-sm text-gray-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: ({ row }) => row.original.company || "N/A",
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => `${row.original.discount}%`,
    },
    {
      accessorKey: "lastActive",
      header: "Last Active",
      cell: ({ row }) => new Date(row.original.lastActive).toLocaleDateString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
  ]

  const handleAdd = () => {
    setSelectedCustomerId(null)
    setFormState({
      name: "",
      phone: "",
      email: "",
      company: "",
      discount: 0,
      gdprConsent: false,
      pushNotificationsConsent: false,
      activeChatbot: false,
    })
    setShowEditDialog(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    setFormState({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      company: customer.company || "",
      discount: customer.discount,
      gdprConsent: customer.gdprConsent,
      pushNotificationsConsent: customer.pushNotificationsConsent,
      activeChatbot: customer.activeChatbot,
    })
    setShowEditDialog(true)
  }

  const handleDelete = (customer: Customer) => {
    setSelectedCustomerId(customer.id)
    setShowDeleteDialog(true)
  }

  const handleChat = (customerId: string) => {
    // Find the customer and navigate to chat
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      navigate(`/chat?search=${encodeURIComponent(customer.name)}`)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormState(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "discount" ? Number(value) : value)
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id) return

    try {
      const clientData = {
        name: formState.name,
        phone: formState.phone,
        email: formState.email,
        company: formState.company || undefined,
        isActive: true, // Always set new customers as active
        gdprConsent: formState.gdprConsent,
        pushNotificationsConsent: formState.pushNotificationsConsent,
        activeChatbot: formState.activeChatbot,
        discount: formState.discount,
        workspaceId: workspace.id,
      }

      if (selectedCustomerId) {
        // Update existing customer
        await clientsApi.update(selectedCustomerId, clientData)
        setCustomers(prev => prev.map(c => 
          c.id === selectedCustomerId 
            ? { ...c, ...formState, status: "active" as const }
            : c
        ))
        toast.success("Customer updated successfully")
      } else {
        // Create new customer
        const newClient = await clientsApi.create(clientData)
        const newCustomer = clientToCustomer(newClient)
        setCustomers(prev => [...prev, newCustomer])
        toast.success("Customer created successfully")
      }
      
      setShowEditDialog(false)
    } catch (error) {
      console.error("Failed to save customer:", error)
      toast.error("Failed to save customer")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomerId) return

    try {
      await clientsApi.delete(selectedCustomerId)
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomerId))
      setShowDeleteDialog(false)
      toast.success("Customer deleted successfully")
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  if (!workspace) {
    return <div>No workspace selected</div>
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Customers"
        titleIcon={<Users className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search customers..."
        onAdd={handleAdd}
        addButtonText="Add"
        itemCount={filteredCustomers.length}
      />

      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable<Customer>
          data={filteredCustomers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          renderActions={(customer) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleChat(customer.id)}
              title="Chat with Customer"
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </Button>
          )}
        />
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCustomerId ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formState.phone}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={formState.company}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formState.discount}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            {/* GDPR and Push Notification Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gdprConsent"
                  name="gdprConsent"
                  checked={formState.gdprConsent}
                  onChange={handleFormChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <Label
                  htmlFor="gdprConsent"
                  className="text-sm font-medium text-gray-700"
                >
                  GDPR Consent
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pushNotificationsConsent"
                  name="pushNotificationsConsent"
                  checked={formState.pushNotificationsConsent}
                  onChange={handleFormChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <Label
                  htmlFor="pushNotificationsConsent"
                  className="text-sm font-medium text-gray-700"
                >
                  Push Notifications
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {selectedCustomerId ? "Save Changes" : "Add Customer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
