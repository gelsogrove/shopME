import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, X } from "lucide-react"
import { useState } from "react"

interface Client {
  id: number
  name: string
  email: string
  company: string
  discount: number
  phone: string
  language: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

const availableLanguages = ["Spanish", "English", "Italian"]

const clients: Client[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc",
    discount: 10,
    phone: "+1234567890",
    language: "English",
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    company: "Tech Corp",
    discount: 15,
    phone: "+0987654321",
    language: "Spanish",
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
    },
  },
]

function ClientDetailsSheet({
  client,
  open,
  onClose,
}: {
  client: Client | null
  open: boolean
  onClose: () => void
}): JSX.Element | null {
  if (!client) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden">
        <div className="flex items-start p-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </SheetClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Client Details
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 grid gap-6 pb-8">
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Client Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Name:</dt>
                    <dd>{client.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Email:</dt>
                    <dd>{client.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Company:</dt>
                    <dd>{client.company}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Language:</dt>
                    <dd>{client.language}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Discount:</dt>
                    <dd>{client.discount}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Phone:</dt>
                    <dd>{client.phone}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  {client.shippingAddress.street}
                  <br />
                  {client.shippingAddress.city}, {client.shippingAddress.state}{" "}
                  {client.shippingAddress.zip}
                  <br />
                  {client.shippingAddress.country}
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ClientEditSheet({
  client,
  open,
  onClose,
}: {
  client: Client | null
  open: boolean
  onClose: () => void
}): JSX.Element | null {
  if (!client) return null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const updatedClient = {
      ...client,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      phone: formData.get("phone") as string,
      language: formData.get("language") as string,
      discount: Number(formData.get("discount")),
      shippingAddress: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip: formData.get("zip") as string,
        country: formData.get("country") as string,
      },
    }

    console.log("Updated client:", updatedClient)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden">
        <div className="flex items-start p-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </SheetClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Edit Client</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-6 pb-8">
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Client Info</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={client.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={client.email}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      defaultValue={client.company}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={client.phone}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select name="language" defaultValue={client.language}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={client.discount}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    defaultValue={client.shippingAddress.street}
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={client.shippingAddress.city}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={client.shippingAddress.state}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={client.shippingAddress.zip}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={client.shippingAddress.country}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function ClientsPage(): JSX.Element {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [searchValue, setSearchValue] = useState("")

  const filteredClients = clients.filter((client) =>
    Object.values(client).some((value) =>
      typeof value === "object"
        ? Object.values(value).some((v) =>
            String(v).toLowerCase().includes(searchValue.toLowerCase())
          )
        : String(value).toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const handleAddClient = () => {
    // In a real app, you would show a form to add a new client
    console.log("Add client functionality would be implemented here")
  }

  const columns: ColumnDef<Client>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Language",
      accessorKey: "language",
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewingClient(row.original)}
            title="View Client"
          >
            <Eye className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingClient(row.original)}
            title="Edit Client"
            className="hover:bg-green-50"
          >
            <Pencil className="h-5 w-5 text-green-600" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Clients"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search clients..."
        onAdd={handleAddClient}
        itemCount={clients.length}
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredClients}
          globalFilter={searchValue}
        />
      </div>

      <ClientDetailsSheet
        client={viewingClient}
        open={!!viewingClient}
        onClose={() => setViewingClient(null)}
      />

      <ClientEditSheet
        client={editingClient}
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
      />
    </div>
  )
}
