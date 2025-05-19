import { commonStyles } from "@/styles/common"
import { MessageSquare, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "../components/shared/PageHeader"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog"
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
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    phone: "+39123456789",
    email: "john.doe@example.com",
    totalOrders: 15,
    totalSpent: 1250.5,
    lastActive: "2024-04-01T10:30:00",
    status: "active",
    gdprConsent: true,
    pushNotificationsConsent: true,
    activeChatbot: true,
    discount: 0,
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "+39987654321",
    email: "jane.smith@example.com",
    totalOrders: 8,
    totalSpent: 750.25,
    lastActive: "2024-03-30T15:45:00",
    status: "active",
    gdprConsent: true,
    pushNotificationsConsent: true,
    activeChatbot: true,
    discount: 0,
  },
  {
    id: "3",
    name: "Mike Johnson",
    phone: "+39456789123",
    email: "mike.johnson@example.com",
    totalOrders: 3,
    totalSpent: 250.75,
    lastActive: "2024-03-15T09:20:00",
    status: "inactive",
    gdprConsent: false,
    pushNotificationsConsent: false,
    activeChatbot: false,
    discount: 0,
  },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formState, setFormState] = useState<Omit<Customer, "id" | "totalOrders" | "totalSpent" | "lastActive"> & { id?: string }>({
    name: "",
    phone: "",
    email: "",
    status: "active",
    gdprConsent: false,
    pushNotificationsConsent: false,
    activeChatbot: true,
    discount: 0,
  })
  const navigate = useNavigate()

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
    })
    setShowEditDialog(true)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.email || !formState.phone || formState.discount === undefined || formState.discount === null) return
    if (formState.discount < 0) return
    if (selectedCustomerId) {
      // Edit
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomerId
            ? { ...c, ...formState, id: selectedCustomerId }
            : c
        )
      )
    } else {
      // New
      setCustomers((prev) => [
        ...prev,
        {
          ...formState,
          id: (Math.random() * 100000).toFixed(0),
          totalOrders: 0,
          totalSpent: 0,
          lastActive: new Date().toISOString(),
        },
      ])
    }
    setShowEditDialog(false)
  }

  const handleDelete = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setShowDeleteDialog(true)
  }

  const handleChat = (customerId: string) => {
    navigate(`/chat/${customerId}`)
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
        addButtonText="Add Customer"
        itemCount={filteredCustomers.length}
      />

      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>GDPR</TableHead>
              <TableHead>Push</TableHead>
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
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>€{customer.totalSpent.toFixed(2)}</TableCell>
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
                    {customer.status.charAt(0).toUpperCase() +
                      customer.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    customer.gdprConsent
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {customer.gdprConsent ? "Accepted" : "Not Accepted"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    customer.pushNotificationsConsent
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {customer.pushNotificationsConsent ? "Enabled" : "Disabled"}
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
            <DialogTitle>{selectedCustomerId ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formState.name} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formState.email} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formState.phone} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" name="discount" type="number" min={0} value={formState.discount} onChange={handleFormChange} required />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select id="status" name="status" value={formState.status} onChange={handleFormChange} className="w-full border rounded-md px-2 py-2">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="gdprConsent" name="gdprConsent" type="checkbox" checked={formState.gdprConsent} onChange={handleFormChange} />
                <Label htmlFor="gdprConsent">GDPR Consent</Label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="pushNotificationsConsent" name="pushNotificationsConsent" type="checkbox" checked={formState.pushNotificationsConsent} onChange={handleFormChange} />
                <Label htmlFor="pushNotificationsConsent">Push Notifications</Label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="activeChatbot" name="activeChatbot" type="checkbox" checked={formState.activeChatbot} onChange={handleFormChange} />
                <Label htmlFor="activeChatbot">Active Chatbot</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{selectedCustomerId ? "Save Changes" : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
