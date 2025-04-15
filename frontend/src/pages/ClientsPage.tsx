import { ClientSheet } from "@/components/shared/ClientSheet"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { type ColumnDef } from "@tanstack/react-table"
import { MessageSquare, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Shared interfaces
interface ShippingAddress {
  street: string
  city: string
  zip: string
  country: string
}

interface Client {
  id: number
  name: string
  email: string
  company: string
  discount: number
  phone: string
  language: string
  notes?: string
  serviceIds: string[]
  shippingAddress: ShippingAddress
}

interface ClientService {
  id: string
  name: string
  description: string
  price: string
  status: "active" | "inactive"
}

// Mock data for services
const availableServices: ClientService[] = [
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

// Mock data for clients
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

const availableLanguages = ["Spanish", "English", "Italian"]

export default function ClientsPage(): JSX.Element {
  const [searchValue, setSearchValue] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSheetOpen, setClientSheetOpen] = useState(false)
  const [clientSheetMode, setClientSheetMode] = useState<"view" | "edit">("view")
  const navigate = useNavigate()

  // Filter clients based on search value
  const filteredClients = clients.filter(
    (client) => 
      client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.company.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Handle sheet submission
  const handleClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    
    // In a real app, you would update the client in your backend
    console.log("Updated client data:", Object.fromEntries(formData.entries()));
  };

  // Handle view chat history
  const handleViewChatHistory = (client: Client) => {
    navigate(`/chat?client=${encodeURIComponent(client.name)}`);
  };

  // Handle edit client
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setClientSheetMode("edit");
    setClientSheetOpen(true);
  };

  // Handle view client details
  const handleView = (client: Client) => {
    setSelectedClient(client);
    setClientSheetMode("view");
    setClientSheetOpen(true);
  };

  // Handle add new client
  const handleAddClient = () => {
    // Create an empty client template
    const newClient: Client = {
      id: Date.now(), // Temporary ID
      name: "",
      email: "",
      company: "",
      discount: 0,
      phone: "",
      language: "English",
      serviceIds: [],
      shippingAddress: {
        street: "",
        city: "",
        zip: "",
        country: "",
      },
    };
    
    setSelectedClient(newClient);
    setClientSheetMode("edit");
    setClientSheetOpen(true);
  };

  // Define columns for the DataTable
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
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Language",
      accessorKey: "language",
      cell: ({ row }) => (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {row.original.language}
        </span>
      ),
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
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewChatHistory(row.original);
                  }}
                  className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Chat History</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Clients"
            titleIcon={<Users className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search clients..."
            onAdd={handleAddClient}
            addButtonText="Add Client"
          />

          {/* Number of items display */}
          <div className="text-sm text-muted-foreground ml-1 mb-2">
            {filteredClients.length} items
          </div>

          <div className="mt-6 w-full">
            <DataTable 
              columns={columns} 
              data={filteredClients}
              globalFilter={searchValue}
              onEdit={handleEdit}
              renderActions={(client) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(client);
                        }}
                        className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                      >
                        <Users className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Client Details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            />
          </div>
        </div>
      </div>

      <ClientSheet
        client={selectedClient}
        open={clientSheetOpen}
        onOpenChange={setClientSheetOpen}
        onSubmit={handleClientSubmit}
        mode={clientSheetMode}
        availableLanguages={availableLanguages}
        availableServices={availableServices}
      />
    </div>
  )
}
