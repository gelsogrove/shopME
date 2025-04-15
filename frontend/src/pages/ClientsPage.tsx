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
import { api } from "@/services/api"
import { servicesApi } from "@/services/servicesApi"
import { type ColumnDef } from "@tanstack/react-table"
import { MessageSquare, Users } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
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

// Effettua il parsing dell'indirizzo da una stringa
const parseAddress = (addressStr?: string | null): ShippingAddress => {
  if (!addressStr) {
    return { street: '', city: '', zip: '', country: '' }
  }
  
  try {
    // Prova a fare il parsing come JSON
    const parsed = JSON.parse(addressStr)
    if (typeof parsed === 'object') {
      return {
        street: parsed.street || '',
        city: parsed.city || '',
        zip: parsed.zip || '',
        country: parsed.country || ''
      }
    }
  } catch (e) {
    // Se non è JSON, lo trattiamo come indirizzo semplice
    console.warn('Failed to parse address as JSON:', addressStr)
  }
  
  // Default o fallback se il parsing fallisce
  return {
    street: addressStr,
    city: '',
    zip: '',
    country: ''
  }
}

// Converte un oggetto indirizzo in stringa
const stringifyAddress = (address: ShippingAddress): string => {
  return JSON.stringify(address)
}

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
  
  // Riferimento per tenere traccia delle chiamate API già effettuate
  const dataLoaded = useRef(false)

  // Memoizza la funzione di caricamento dati
  const loadData = useCallback(async () => {
    if (!workspace?.id || dataLoaded.current) return
    
    try {
      setIsLoading(true)
      
      // Carica i clienti e i servizi in parallelo
      const [customersResponse, servicesData] = await Promise.all([
        api.get(`/api/workspaces/${workspace.id}/customers`),
        servicesApi.getAllForWorkspace(workspace.id)
      ])
      
      const customersData = customersResponse.data
      
      // Converti i dati dei clienti dal formato API al formato interno
      const formattedClients = customersData.map((customer: any) => ({
        id: customer.id || '',
        name: customer.name || '',
        email: customer.email || '',
        company: customer.company || '',
        discount: customer.discount || 0,
        phone: customer.phone || '',
        language: customer.language || 'English',
        notes: customer.notes || '',
        serviceIds: customer.serviceIds || [],
        shippingAddress: parseAddress(customer.address),
        workspaceId: customer.workspaceId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }))
      
      setClients(formattedClients)
      
      // Converti i dati dei servizi
      const formattedServices = servicesData.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description || "",
        price: service.price?.toString() || "0",
        status: service.isActive ? "active" as const : "inactive" as const
      }))
      
      setAvailableServices(formattedServices)
      dataLoaded.current = true
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load clients or services')
    } finally {
      setIsLoading(false)
    }
  }, [workspace?.id])

  // Carica i dati solo quando il workspace è disponibile e non stiamo ancora caricando
  useEffect(() => {
    if (!isLoadingWorkspace && workspace?.id && !dataLoaded.current) {
      loadData()
    }
  }, [loadData, workspace?.id, isLoadingWorkspace])

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
      
      // Prepare shipping address data as a string (JSON)
      const shippingAddress: ShippingAddress = {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        zip: formData.get('zip') as string,
        country: formData.get('country') as string
      }
      
      // Prepare client data for customers API
      const customerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        phone: formData.get('phone') as string,
        language: formData.get('language') as string,
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string,
        serviceIds,
        // Convert address to string for API
        address: stringifyAddress(shippingAddress)
      }
      
      // Create client in API
      const response = await api.post(`/api/workspaces/${workspace.id}/customers`, customerData)
      const newCustomer = response.data
      
      if (newCustomer) {
        // Add the new client to state with converted format
        setClients(prevClients => [...prevClients, {
          id: newCustomer.id,
          name: newCustomer.name || '',
          email: newCustomer.email || '',
          company: newCustomer.company || '',
          discount: newCustomer.discount || 0,
          phone: newCustomer.phone || '',
          language: newCustomer.language || 'English',
          notes: newCustomer.notes || '',
          serviceIds: newCustomer.serviceIds || [],
          shippingAddress: parseAddress(newCustomer.address),
          workspaceId: newCustomer.workspaceId,
          createdAt: newCustomer.createdAt,
          updatedAt: newCustomer.updatedAt
        }])
        toast.success('Client created successfully')
      }
      
      // Close the form
      setClientSheetOpen(false)
      
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
    }
  }

  // Handle update client
  const handleUpdateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id || !selectedClient?.id) return

    try {
      const formData = new FormData(e.currentTarget)
      
      // Extract service IDs from form data
      const serviceIds: string[] = []
      availableServices.forEach(service => {
        if (formData.get(`service-${service.id}`) === "on") {
          serviceIds.push(service.id)
        }
      })
      
      // Prepare shipping address data as string
      const shippingAddress: ShippingAddress = {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        zip: formData.get('zip') as string,
        country: formData.get('country') as string
      }
      
      // Prepare client data for customers API - includendo tutti i campi
      const customerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        phone: formData.get('phone') as string,
        language: formData.get('language') as string,
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string,
        serviceIds,
        address: stringifyAddress(shippingAddress),
        isActive: true
      }
      
      console.log('Updating customer with data:', customerData)
      console.log('Customer ID:', selectedClient.id)
      console.log('Workspace ID:', workspace.id)
      
      // Update client in API
      const response = await api.put(
        `/api/workspaces/${workspace.id}/customers/${selectedClient.id}`,
        customerData
      )
      const updatedCustomer = response.data
      
      console.log('Response from update API:', updatedCustomer)
      
      if (updatedCustomer) {
        // Update client in state with correct format and preserve existing data not returned by API
        setClients(prevClients =>
          prevClients.map(client =>
            client.id === selectedClient.id
              ? {
                  ...client, // Mantieni i dati esistenti
                  id: updatedCustomer.id,
                  name: updatedCustomer.name || client.name,
                  email: updatedCustomer.email || client.email,
                  company: updatedCustomer.company || client.company,
                  discount: updatedCustomer.discount ?? client.discount,
                  phone: updatedCustomer.phone || client.phone,
                  language: updatedCustomer.language || client.language,
                  notes: updatedCustomer.notes || client.notes,
                  serviceIds: updatedCustomer.serviceIds || client.serviceIds,
                  shippingAddress: parseAddress(updatedCustomer.address),
                  updatedAt: updatedCustomer.updatedAt
                }
              : client
          )
        )
        toast.success('Client updated successfully')
      }
      
      // Close the form
      setClientSheetOpen(false)
      setSelectedClient(null)
      
    } catch (error: any) {
      console.error('Error updating client:', error)
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      toast.error(`Failed to update client: ${error.message || 'Unknown error'}`)
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
        // Delete client using customers API
        await api.delete(`/api/workspaces/${workspace.id}/customers/${client.id}`)
        
        // Remove from state if successful
        setClients(clients.filter(c => c.id !== client.id))
        toast.success('Client deleted successfully')
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
        <div className="flex justify-end items-center space-x-2">
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
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-blue-100"
                >
                  <MessageSquare className="h-5 w-5 text-blue-600" />
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
