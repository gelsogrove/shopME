import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

const clients: Client[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc",
    discount: 10,
    phone: "+1234567890",
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
      <SheetContent
        className={`w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden ${
          open ? "slide-from-right" : "slide-to-right"
        }`}
        side="right"
      >
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
  onSave,
}: {
  client: Client | null
  open: boolean
  onClose: () => void
  onSave: (updatedClient: Client) => void
}): JSX.Element | null {
  if (!client) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const updatedClient = {
      ...client,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      company: formData.get("company") as string,
      discount: parseFloat(formData.get("discount") as string),
      phone: formData.get("phone") as string,
      shippingAddress: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zip: formData.get("zip") as string,
        country: formData.get("country") as string,
      },
    }
    onSave(updatedClient)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={`w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden ${
          open ? "slide-from-right" : "slide-to-right"
        }`}
        side="right"
      >
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Client Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={client.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={client.email}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    defaultValue={client.company}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={client.discount}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={client.phone} />
                </div>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="street"
                    defaultValue={client.shippingAddress.street}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      defaultValue={client.shippingAddress.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      defaultValue={client.shippingAddress.state}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      defaultValue={client.shippingAddress.country}
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

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchValue, setSearchValue] = useState("")

  const handleSaveClient = (updatedClient: Client) => {
    // In a real app, this would make an API call to update the client
    console.log("Saving client:", updatedClient)
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => <div>{row.getValue("discount")}%</div>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original

        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-green-50"
              onClick={() => setSelectedClient(client)}
            >
              <Eye className="h-5 w-5 text-green-600" />
              <span className="sr-only">View client</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
              onClick={() => setEditingClient(client)}
            >
              <Pencil className="h-5 w-5 text-black" />
              <span className="sr-only">Edit client</span>
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Clients"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search clients..."
        itemCount={clients.length}
      />

      <div className="mt-6">
        <DataTable
          data={clients}
          columns={columns}
          globalFilter={searchValue}
        />
      </div>

      <ClientDetailsSheet
        client={selectedClient}
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />

      <ClientEditSheet
        client={editingClient}
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleSaveClient}
      />
    </div>
  )
}
