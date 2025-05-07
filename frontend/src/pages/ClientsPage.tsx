import { ClientSheet } from "@/components/shared/ClientSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { WhatsAppChatModal } from "@/components/shared/WhatsAppChatModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { api } from "@/services/api"
import { commonStyles } from "@/styles/common"
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from "@tanstack/react-table"
import {
    Bot,
    MessageSquare,
    Pencil,
    Plus,
    Trash2,
    Users
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
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
  shippingAddress: ShippingAddress
  workspaceId?: string
  createdAt?: string
  updatedAt?: string
  last_privacy_version_accepted?: string
  push_notifications_consent?: boolean
  activeChatbot?: boolean
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSheetOpen, setClientSheetOpen] = useState(false)
  const [clientSheetMode, setClientSheetMode] = useState<"view" | "edit">("view")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Stati per il dialogo di conferma eliminazione
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [clientsWithChats, setClientsWithChats] = useState<Set<string>>(new Set());
  const [showPlayground, setShowPlayground] = useState(false)

  // Replace with useQuery
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    isError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['clients', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const customersResponse = await api.get(`/workspaces/${workspace.id}/customers`);
      const customersData = customersResponse.data;
      
      // Map the client data
      const mappedClients = customersData.map((customer: any) => ({
        id: customer.id || '',
        name: customer.name || '',
        email: customer.email || '',
        company: customer.company || '',
        discount: customer.discount || 0,
        phone: customer.phone || '',
        language: customer.language || 'English',
        notes: customer.notes || '',
        shippingAddress: parseAddress(customer.address),
        workspaceId: customer.workspaceId,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        last_privacy_version_accepted: customer.last_privacy_version_accepted,
        push_notifications_consent: customer.push_notifications_consent,
        activeChatbot: customer.activeChatbot !== undefined ? customer.activeChatbot : true
      }));
      
      // Sort clients by ID in descending order (newer clients at the top)
      return mappedClients.sort((a: Client, b: Client) => {
        // If IDs are UUIDs or contain non-numeric characters, compare them as strings
        if (a.id > b.id) return -1;
        if (a.id < b.id) return 1;
        return 0;
      });
    },
    enabled: !!workspace?.id
  });

  // Fetch chats to determine which clients have existing chats
  useEffect(() => {
    const fetchExistingChats = async () => {
      try {
        const response = await api.get("/chat/recent");
        if (response.data.success && response.data.data) {
          // First create a properly typed array of phone numbers
          const phoneNumbers: string[] = response.data.data
            .map((chat: any) => chat.customerPhone)
            .filter((phone: any): phone is string => typeof phone === 'string');
          
          // Then create the Set from the typed array
          setClientsWithChats(new Set(phoneNumbers));
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };
    
    fetchExistingChats();
  }, []);

  // Controlla se c'è un parametro edit nell'URL per aprire automaticamente il form di modifica
  useEffect(() => {
    const clientIdToEdit = searchParams.get('edit')
    const sourceParam = searchParams.get('source')
    
    if (clientIdToEdit && clients.length > 0) {
      const clientToEdit = clients.find((client: Client) => client.id === clientIdToEdit)
      
      if (clientToEdit) {
        console.log('Opening client edit form for:', clientToEdit.name)
        setSelectedClient(clientToEdit)
        setClientSheetMode('edit')
        setClientSheetOpen(true)
        
      }
    }
  }, [clients, searchParams, navigate])

  // Use isLoading and clients from useQuery for rendering and filtering
  const filteredClients = clients.filter((client: Client) =>
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
        // Convert address to string for API
        address: stringifyAddress(shippingAddress),
        last_privacy_version_accepted: formData.get('last_privacy_version_accepted') as string,
        push_notifications_consent: formData.get('push_notifications_consent') === 'on'
      }
      
      // Create client in API
      const response = await api.post(`/workspaces/${workspace.id}/customers`, customerData)
      const newCustomer = response.data
      
      if (newCustomer) {
        // Add the new client to state with converted format
        refetchClients()
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
        address: stringifyAddress(shippingAddress),
        isActive: true,
        last_privacy_version_accepted: formData.get('last_privacy_version_accepted') as string,
        push_notifications_consent: formData.get('push_notifications_consent') === 'on'
      }
      
      console.log('Updating customer with data:', customerData)
      console.log('Customer ID:', selectedClient.id)
      console.log('Workspace ID:', workspace.id)
      
      // Update client in API
      const response = await api.put(
        `/workspaces/${workspace.id}/customers/${selectedClient.id}`,
        customerData
      )
      const updatedCustomer = response.data
      
      console.log('Response from update API:', updatedCustomer)
      
      if (updatedCustomer) {
        // Update client in state with correct format and preserve existing data not returned by API
        refetchClients()
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
  const handleViewChatHistory = async (client: Client) => {
    try {
      // Cerca di trovare la chat esistente per questo cliente usando il suo numero di telefono
      const response = await api.get("/chat/recent");
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        // Cerca una chat con lo stesso numero di telefono
        const existingChat = response.data.data.find(
          (chat: any) => chat.customerPhone === client.phone
        );
        
        if (existingChat) {
          // Se la chat esiste, vai direttamente alla chat con il sessionId corretto
          navigate(`/chat?sessionId=${existingChat.sessionId}`);
          return;
        }
      }
      
      // If no existing chat is found, navigate to the chat page with client name as search filter
      navigate(`/chat?client=${encodeURIComponent(client.name)}`);
    } catch (error) {
      console.error("Error finding chat for client:", error);
      // Navigate to chat page with client name as search filter even if there's an error
      navigate(`/chat?client=${encodeURIComponent(client.name)}`);
    }
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
  const handleDelete = (client: Client) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!workspace?.id || !clientToDelete) return
    
    try {
      // Delete client using customers API
      await api.delete(`/workspaces/${workspace.id}/customers/${clientToDelete.id}`)
      
      // Remove from state if successful
      refetchClients()
      toast.success('Client deleted successfully')
      setShowDeleteDialog(false)
      setClientToDelete(null)
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
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
      shippingAddress: {
        street: "",
        city: "",
        zip: "",
        country: "",
      },
      last_privacy_version_accepted: "",
      push_notifications_consent: false
    }
    
    setSelectedClient(newClient)
    setClientSheetMode("edit")
    setClientSheetOpen(true)
  }

  // Define columns for the DataTable in the requested order
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
      header: "Company",
      accessorKey: "company",
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
      header: "GDPR",
      accessorKey: "last_privacy_version_accepted",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.last_privacy_version_accepted 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.last_privacy_version_accepted ? 'Accepted' : 'Not Accepted'}
        </span>
      ),
    },
    {
      header: "Push",
      accessorKey: "push_notifications_consent",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.push_notifications_consent
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.push_notifications_consent ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      header: "Chatbot",
      accessorKey: "activeChatbot",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Bot className={`h-4 w-4 mr-1 ${row.original.activeChatbot !== false ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.original.activeChatbot !== false
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {row.original.activeChatbot !== false ? 'Auto' : 'Manual'}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end items-center gap-2">
          {/* Chat history button for all clients */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => handleViewChatHistory(row.original)}
                >
                  <span className="sr-only">Chat history</span>
                  <MessageSquare className={`h-4 w-4 ${clientsWithChats.has(row.original.phone) ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View chat history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Edit button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => handleEdit(row.original)}
                >
                  <span className="sr-only">Edit</span>
                  <Pencil className={`${commonStyles.actionIcon} ${commonStyles.primary}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Delete button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-red-50"
                  onClick={() => handleDelete(row.original)}
                >
                  <span className="sr-only">Delete</span>
                  <Trash2 className={`${commonStyles.actionIcon} text-red-600`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ]

  // In the return, use isLoading from useQuery
  if (isLoadingWorkspace || isLoadingClients) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading clients.</div>
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
          />

          {/* Search and New Chat aligned */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white mr-2"
              onClick={() => setShowPlayground(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
            <Input
              type="search"
              placeholder="Search clients..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Number of items display */}
          <div className="text-sm text-muted-foreground ml-1 mb-2">
            {filteredClients.length} items
          </div>

          <div className="mt-6 w-full">
            <DataTable 
              columns={columns} 
              data={filteredClients}
              globalFilter={searchValue}
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Playground Modal */}
      <WhatsAppChatModal
        isOpen={showPlayground}
        onClose={() => setShowPlayground(false)}
        channelName="WhatsApp Chat"
        phoneNumber={""}
        selectedChat={null}
      />

      <ClientSheet
        client={selectedClient}
        open={clientSheetOpen}
        onOpenChange={setClientSheetOpen}
        onSubmit={handleClientSubmit}
        mode={clientSheetMode}
        availableLanguages={availableLanguages}
      />

      {/* Dialog di conferma eliminazione */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Client"
        description={`Are you sure you want to delete ${clientToDelete?.name || 'this client'}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
