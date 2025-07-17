import { useWorkspace } from "@/hooks/use-workspace"
import { clientsApi, type Client } from "@/services/clientsApi"
import { commonStyles } from "@/styles/common"
import { MessageSquare, Pencil, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/shared/PageHeader"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { toast } from "../lib/toast"

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
  email: client.email,
  totalOrders: 0, // This would come from orders API
  totalSpent: 0, // This would come from orders API
  lastActive: client.updatedAt,
  status: client.isActive ? "active" : "inactive", // Use actual isActive field
  gdprConsent: true, // Assuming GDPR consent for existing clients
  pushNotificationsConsent: false, // Default value
  activeChatbot: client.activeChatbot || false,
  discount: client.discount,
  company: client.company,
})

export default function CustomersPage() {
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  )
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formState, setFormState] = useState<
    Omit<Customer, "id" | "totalOrders" | "totalSpent" | "lastActive"> & {
      id?: string
    }
  >({
    name: "",
    phone: "",
    email: "",
    status: "active",
    gdprConsent: false,
    pushNotificationsConsent: false,
    activeChatbot: true,
    discount: 0,
    company: "",
  })
  const navigate = useNavigate()

  // Load customers when workspace changes
  useEffect(() => {
    const loadCustomers = async () => {
      if (!workspace?.id) return

      setIsLoading(true)
      try {
        const response = await clientsApi.getAllForWorkspace(workspace.id)
        const customersData = response.clients.map(clientToCustomer)
        setCustomers(customersData)
      } catch (error) {
        console.error("Failed to load customers:", error)
        toast.error("Failed to load customers")
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomers()
  }, [workspace?.id])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone.includes(searchValue) ||
      customer.email.toLowerCase().includes(searchValue.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setFormState({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        status: customer.status,
        gdprConsent: customer.gdprConsent,
        pushNotificationsConsent: customer.pushNotificationsConsent,
        activeChatbot: customer.activeChatbot,
        discount: customer.discount ?? 0,
        company: customer.company || "",
      })
    }
    setShowEditDialog(true)
  }

  const handleAdd = () => {
    setSelectedCustomerId(null)
    setFormState({
      name: "",
      phone: "",
      email: "",
      status: "active",
      gdprConsent: false,
      pushNotificationsConsent: false,
      activeChatbot: true,
      discount: 0,
      company: "",
    })
    setShowEditDialog(true)
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFormState((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: name === "discount" ? Number(value) : value,
      }))
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace?.id) return
    if (
      !formState.name ||
      !formState.email ||
      !formState.phone ||
      formState.discount === undefined ||
      formState.discount === null
    )
      return
    if (formState.discount < 0) return

    try {
      if (selectedCustomerId) {
        // Edit existing customer
        const clientData = {
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          company: formState.company || "",
          discount: formState.discount,
          language: "en", // Default language
          isActive: formState.status === "active",
        }

        const updatedClient = await clientsApi.update(
          selectedCustomerId,
          clientData,
          workspace.id
        )
        if (updatedClient) {
          const updatedCustomer = clientToCustomer(updatedClient)
          setCustomers((prev) =>
            prev.map((c) => (c.id === selectedCustomerId ? updatedCustomer : c))
          )
          toast.success("Customer updated successfully")
        }
      } else {
        // Create new customer
        const clientData = {
          name: formState.name,
          email: formState.email,
          phone: formState.phone,
          company: formState.company || "",
          discount: formState.discount,
          language: "en", // Default language
          isActive: formState.status === "active",
        }

        const newClient = await clientsApi.create(clientData, workspace.id)
        if (newClient) {
          const newCustomer = clientToCustomer(newClient)
          setCustomers((prev) => [newCustomer, ...prev])
          toast.success("Customer created successfully")
        }
      }
      setShowEditDialog(false)
    } catch (error) {
      console.error("Failed to save customer:", error)
      toast.error("Failed to save customer")
    }
  }

  const handleDelete = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomerId || !workspace?.id) return

    try {
      await clientsApi.delete(selectedCustomerId, workspace.id)
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomerId))
      setShowDeleteDialog(false)
      setSelectedCustomerId(null)
      toast.success("Customer deleted successfully")
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast.error("Failed to delete customer")
    }
  }

  const handleChat = (customerId: string) => {
    navigate(`/chat/${customerId}`)
  }

  if (isWorkspaceLoading || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
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
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "active" | "inactive")
              }
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  <div>
                    <p>{customer.phone}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </TableCell>
                <TableCell>{customer.company || "N/A"}</TableCell>
                <TableCell>{customer.discount}%</TableCell>
                <TableCell>
                  {new Date(customer.lastActive).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      customer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleChat(customer.id)}
                      title="Chat with Customer"
                    >
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(customer.id)}
                      title="Edit Customer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(customer.id)}
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCustomerId ? "Edit Customer" : "Add"}
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
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
                  value={formState.company || ""}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  value={formState.discount}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formState.status}
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-2 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                {selectedCustomerId ? "Save Changes" : "Add"}
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
