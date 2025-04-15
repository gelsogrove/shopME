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
import { useWorkspace } from "@/hooks/use-workspace"
import { clientsApi, type Client as ApiClient } from "@/services/clientsApi"
import { servicesApi } from "@/services/servicesApi"
import { type ColumnDef } from "@tanstack/react-table"
import { MessageSquare, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

// Shared interfaces
export interface ShippingAddress {
  street: string
  city: string
  zip: string
  country: string
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  discount: number
  phone: string
  language: string
  notes?: string
  serviceIds: string[]
  shippingAddress: ShippingAddress
  workspaceId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ClientService {
  id: string
  name: string
  description: string
  price: string
  status: "active" | "inactive"
}

const availableLanguages = ["Spanish", "English", "Italian"]

export default function ClientsPage(): JSX.Element {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [searchValue, setSearchValue] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [availableServices, setAvailableServices] = useState<ClientService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSheetOpen, setClientSheetOpen] = useState(false)
  const [clientSheetMode, setClientSheetMode] = useState<"view" | "edit">("view")
  const navigate = useNavigate()

  // Load clients and services when workspace changes
  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return
      
      try {
        setIsLoading(true)
        
        // Load clients
        const clientsData = await clientsApi.getAllForWorkspace(workspace.id)
        // Convert API clients to our local Client type
        const formattedClients = (clientsData.clients || []).map((apiClient: ApiClient) => ({
          id: apiClient.id,
          name: apiClient.name,
          email: apiClient.email,
          company: apiClient.company,
          discount: apiClient.discount,
          phone: apiClient.phone,
          language: apiClient.language,
          notes: apiClient.notes,
          serviceIds: apiClient.serviceIds,
          shippingAddress: apiClient.shippingAddress,
          workspaceId: apiClient.workspaceId,
          createdAt: apiClient.createdAt,
          updatedAt: apiClient.updatedAt
        }))
        setClients(formattedClients)
        
        // Load services
        const servicesData = await servicesApi.getAllForWorkspace(workspace.id)
        // Convert API services to our local ClientService type
        const formattedServices = servicesData.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || "",
          price: service.price?.toString() || "0",
          status: service.isActive ? "active" as const : "inactive" as const
        }))
        setAvailableServices(formattedServices)
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load clients')
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWorkspace) {
      loadData()
    }
  }, [workspace?.id, isLoadingWorkspace])

  // Filter clients based on search value
  const filteredClients = clients.filter(
    (client) => 
      client.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.company.toLowerCase().includes(searchValue.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Handle sheet submission for new client
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    try {
      const formData = new FormData(e.currentTarget)
      
      // Extract service IDs from form data
      const serviceIds: string[] = []
      availableServices.forEach(service => {
        if (formData.get(`service-${service.id}`) === "on") {
          serviceIds.push(service.id)
        }
      })
      
      // Prepare client data
      const clientData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        phone: formData.get('phone') as string,
        language: formData.get('language') as string,
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string,
        serviceIds,
        shippingAddress: {
          street: formData.get('street') as string,
          city: formData.get('city') as string,
          zip: formData.get('zip') as string,
          country: formData.get('country') as string
        }
      }
      
      // Create client in API
      const newClient = await clientsApi.create(clientData, workspace.id)
      
      if (newClient) {
        // Add the new client to state
        setClients(prevClients => [...prevClients, {
          ...newClient,
          id: newClient.id.toString()
        }])
        toast.success('Client created successfully')
      }
      
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    }
  }

  // Handle sheet submission for updating client
  const handleUpdateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id || !selectedClient) return

    try {
      const formData = new FormData(e.currentTarget)
      
      // Extract service IDs from form data
      const serviceIds: string[] = []
      availableServices.forEach(service => {
        if (formData.get(`service-${service.id}`) === "on") {
          serviceIds.push(service.id)
        }
      })
      
      // Prepare client data
      const clientData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        phone: formData.get('phone') as string,
        language: formData.get('language') as string,
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string,
        serviceIds,
        shippingAddress: {
          street: formData.get('street') as string,
          city: formData.get('city') as string,
          zip: formData.get('zip') as string,
          country: formData.get('country') as string
        }
      }
      
      // Update client in API
      const updatedClient = await clientsApi.update(
        selectedClient.id.toString(), 
        clientData, 
        workspace.id
      )
      
      if (updatedClient) {
        // Update the client in state
        setClients(prevClients => 
          prevClients.map(client => 
            client.id === updatedClient.id ? {
              ...updatedClient,
              id: updatedClient.id.toString()
            } : client
          )
        )
        toast.success('Client updated successfully')
      }
      
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
    }
  }

  // Handle client form submission (create or update)
  const handleClientSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (selectedClient?.id) {
      handleUpdateClient(e)
    } else {
      handleCreateClient(e)
    }
  }

  // Handle view chat history
  const handleViewChatHistory = (client: Client) => {
    navigate(`/chat?client=${encodeURIComponent(client.name)}`);
  }

  // Handle edit client
  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setClientSheetMode("edit")
    setClientSheetOpen(true)
  }

  // Handle view client details
  const handleView = (client: Client) => {
    setSelectedClient(client)
    setClientSheetMode("view")
    setClientSheetOpen(true)
  }

  // Handle delete client
  const handleDelete = async (client: Client) => {
    if (!workspace?.id) return
    
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      try {
        const success = await clientsApi.delete(client.id.toString(), workspace.id)
        
        if (success) {
          setClients(clients.filter(c => c.id !== client.id))
          toast.success('Client deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting client:', error)
        toast.error('Failed to delete client')
      }
    }
  }

  // Handle add new client
  const handleAddClient = () => {
    // Create an empty client template
    const newClient: Client = {
      id: "", // This will be assigned by the backend
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
    }
    
    setSelectedClient(newClient)
    setClientSheetMode("edit")
    setClientSheetOpen(true)
  }

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
                    e.stopPropagation()
                    handleViewChatHistory(row.original)
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
  ]

  // Show loading state
  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  // Show error if no workspace selected
  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

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
              onDelete={handleDelete}
              renderActions={(client) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(client)
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
