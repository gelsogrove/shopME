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
import { Pencil, X } from "lucide-react"
import { useState } from "react"

// Importing services from ServicesPage
interface Service {
  id: string
  name: string
  description: string
  price: string
  status: "active" | "inactive"
}

const availableServices: Service[] = [
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
    status: "active",
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

interface Client {
  id: number
  name: string
  email: string
  company: string
  discount: number
  phone: string
  language: string
  notes?: string
  serviceIds: string[] // IDs of subscribed services
  shippingAddress: {
    street: string
    city: string
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
    notes: "Regular customer",
    serviceIds: ["1", "4"], // Shipping Service and Gift Wrapping
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
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
    notes: "Prefers email contact",
    serviceIds: ["1", "2"], // Shipping Service and Christmas Gift Wrapping
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
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
      <SheetContent className="w-[45%] sm:max-w-[45%] !p-0 [&>button]:hidden">
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
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {client.serviceIds && client.serviceIds.length > 0 ? (
                    client.serviceIds.map((serviceId) => {
                      const service = availableServices.find(
                        (s) => s.id === serviceId
                      )
                      return service ? (
                        <li key={serviceId}>
                          {service.name} - €{service.price}
                        </li>
                      ) : null
                    })
                  ) : (
                    <li className="text-gray-500">No services selected</li>
                  )}
                </ul>
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
                  {client.shippingAddress.city}, {client.shippingAddress.zip}
                  <br />
                  {client.shippingAddress.country}
                </address>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Client Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={client.notes || ""}
                  />
                </div>
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
      notes: formData.get("notes") as string,
      serviceIds: availableServices
        .filter((service) => formData.get(`service-${service.id}`) === "on")
        .map((service) => service.id),
      shippingAddress: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        zip: formData.get("zip") as string,
        country: formData.get("country") as string,
      },
    }

    console.log("Updated client:", updatedClient)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[45%] sm:max-w-[45%] !p-0 [&>button]:hidden">
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
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      name="zip"
                      defaultValue={client.shippingAddress.zip}
                      required
                    />
                  </div>
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
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableServices
                    .filter((service) => service.status === "active")
                    .map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          name={`service-${service.id}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          defaultChecked={client.serviceIds.includes(
                            service.id
                          )}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium"
                        >
                          {service.name} - €{service.price}
                        </label>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Client Notes</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    defaultValue={client.notes || ""}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto">
                Save
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
      header: "Phone",
      accessorKey: "phone",
    },
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
      header: "Discount",
      accessorKey: "discount",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.discount}%</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end w-full">
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
