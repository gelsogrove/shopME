import { PageLayout } from "@/components/layout/PageLayout"
import { ClientSheet } from "@/components/shared/ClientSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { getWorkspaceId } from "@/config/workspace.config"
import { api } from "@/services/api"
import { getLanguages, Language } from "@/services/workspaceApi"
import { useQuery } from '@tanstack/react-query'
import { Ban, Pencil, Send, ShoppingBag, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
  agentName?: string
}

interface ShippingAddress {
  street: string
  city: string
  zip: string
  country: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  discount?: number
  language?: string
  notes?: string
  shippingAddress: ShippingAddress
}

interface Chat {
  id: string
  sessionId: string
  customerId: string
  customerName: string
  customerPhone: string
  companyName?: string
  lastMessage: string
  unreadCount: number
  lastMessageTime: string
  messages?: Message[]
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "Data non disponibile";
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data non valida";
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('it-IT', options);
  } catch (error) {
    return "Errore nella formattazione data";
  }
};

export function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = searchParams.get("sessionId")
  const clientSearchTerm = searchParams.get("client") || ""
  const initialLoadRef = useRef(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['English', 'Italian', 'Spanish', 'French'])
  const [showBlockDialog, setShowBlockDialog] = useState<boolean>(false)
  const [showOrdersDialog, setShowOrdersDialog] = useState<boolean>(false)
  const navigate = useNavigate()

  // Fetch chats with React Query
  const {
    data: allChats = [],
    isLoading: isLoadingChats,
    isError: isErrorChats,
    refetch: refetchChats
  } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get("/api/chat/recent");
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error("Errore nel caricamento delle chat");
      }
    }
  });

  // Filter chats based on search term
  const chats = clientSearchTerm
    ? allChats.filter((chat: Chat) => 
        chat.customerName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        chat.customerPhone?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        chat.companyName?.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        chat.lastMessage?.toLowerCase().includes(clientSearchTerm.toLowerCase())
      )
    : allChats;

  // Select first chat when chats are loaded and no chat is selected
  useEffect(() => {
    if (chats.length > 0 && !selectedChat && !sessionId) {
      selectChat(chats[0]);
    }
  }, [chats, selectedChat, sessionId])

  // Fetch available languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languages: Language[] = await getLanguages();
        if (languages && languages.length > 0) {
          setAvailableLanguages(languages.map((lang: Language) => lang.name));
        }
      } catch (error) {
        // Keep default languages in state
      }
    };
    
    fetchLanguages();
  }, []);

  // Select chat from URL parameters on initial load
  useEffect(() => {
    if (sessionId && chats.length > 0 && initialLoadRef.current) {
      const chat = chats.find((c: Chat) => c.sessionId === sessionId)
      if (chat) {
        selectChat(chat, false) // false = don't update URL again
        initialLoadRef.current = false
      }
    }
  }, [sessionId, chats])

  // Auto-scroll to latest messages
  useEffect(() => {
    if (messagesEndRef.current && !loadingChat) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages, loadingChat]);

  // Select a chat and load its messages
  const selectChat = async (chat: Chat, updateUrl = true) => {
    setLoadingChat(true);
    try {
      const chatWithCompany = {
        ...chat,
        companyName: chat.companyName || ""
      };
      
      if (updateUrl) {
        setSearchParams({ sessionId: chatWithCompany.sessionId });
      }
      
      if (!chatWithCompany.messages) {
        const response = await api.get(`/api/chat/${chatWithCompany.sessionId}/messages`);
        if (response.data.success) {
          const formattedMessages: Message[] = response.data.data.map((m: any) => ({
            id: m.id,
            content: m.content,
            sender: m.direction === "INBOUND" ? "customer" : "user",
            timestamp: m.createdAt || new Date().toISOString(),
            agentName: m.direction === "OUTBOUND" ? (m.metadata?.agentName || "Generic") : undefined
          }));
          
          chatWithCompany.messages = formattedMessages;
        }
      }
      
      setSelectedChat(chatWithCompany);
      
      if (chatWithCompany.unreadCount > 0) {
        refetchChats();
      }
      
    } catch (error) {
      toast.error("Non è stato possibile caricare i messaggi");
    } finally {
      setLoadingChat(false);
    }
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedChat) return
    
    // Set loading state to true before sending the message
    setLoading(true)
    
    try {
      // Create a new message - this is a human user sending a message to the bot
      const newMessage = {
        id: Date.now().toString(),
        content: messageInput,
        // This is the customer's message, so sender should be "customer"
        sender: "customer" as const,
        timestamp: new Date().toISOString()
      }
      
      // Update selected chat with the new message
      const updatedChat = {
        ...selectedChat,
        messages: [...(selectedChat.messages || []), newMessage],
        lastMessage: messageInput,
        lastMessageTime: new Date().toISOString()
      }
      
      setSelectedChat(updatedChat)
      setMessageInput("")
      
      // Get workspaceId from storage
      let currentWorkspaceId = "";
      try {
        const workspaceData = sessionStorage.getItem("currentWorkspace");
        if (workspaceData) {
          const workspace = JSON.parse(workspaceData);
          currentWorkspaceId = workspace.id;
        } else {
          currentWorkspaceId = getWorkspaceId();
        }
      } catch (err) {
        currentWorkspaceId = getWorkspaceId();
      }
      
      // Send message to backend
      const response = await api.post('/api/messages', { 
        message: messageInput,
        phoneNumber: selectedChat.customerPhone,
        workspaceId: currentWorkspaceId
      });
      
      if (response.data.success) {
        // Refresh chats after sending a message
        refetchChats()
        
        // Extract agent name from response metadata if available
        let agentName = "Generic";
        if (response.data.data.metadata && response.data.data.metadata.agentName) {
          agentName = response.data.data.metadata.agentName;
        }
        
        // Create response message from the bot
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.data.processedMessage,
          // This is the bot's response, so sender should be "user"
          sender: "user" as const,
          timestamp: new Date().toISOString(),
          agentName: agentName
        }
        
        // Update selected chat with the bot response
        setSelectedChat(prevChat => {
          if (!prevChat) return null
          return {
            ...prevChat,
            messages: [...(prevChat.messages || []), responseMessage],
            lastMessage: responseMessage.content,
            lastMessageTime: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      toast.error("Non è stato possibile inviare il messaggio")
    } finally {
      // Set loading state back to false after the request is complete
      setLoading(false)
    }
  }

  // Disable message input during loading
  const isInputDisabled = loadingChat;

  // Handle chat deletion
  const handleDeleteChat = () => {
    if (!selectedChat) return
    setShowDeleteDialog(true)
  }

  // Handle customer editing
  const handleEditCustomer = async () => {
    if (!selectedChat) {
      toast.error("No chat selected");
      return;
    }
    setShowEditSheet(true);
  };
  
  // Convert address object to string
  const stringifyAddress = (address: ShippingAddress): string => {
    try {
      return JSON.stringify(address);
    } catch (e) {
      return '';
    }
  }
  
  // Convert text with URLs to HTML with clickable links
  const formatTextWithLinks = (text: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    return text.replace(urlRegex, (url) => {
      const displayUrl = url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline break-all">${displayUrl}</a>`;
    });
  };

  // Get auth credentials from different storage sources
  const getAuthCredentials = () => {
    try {
      // Try localStorage first
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData?.token) {
          return userData.token;
        }
      }
      
      // Try token directly
      const token = localStorage.getItem("token");
      if (token) {
        return token;
      }
      
      // Try session storage
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const sessionUserData = JSON.parse(sessionUser);
        if (sessionUserData?.token) {
          return sessionUserData.token;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  // Confirm chat deletion
  const handleDeleteConfirm = async () => {
    if (!selectedChat) return
    
    try {
      // Get the auth token from localStorage
      const token = getAuthCredentials();
      
      // Construct full URL
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const fullUrl = `${apiUrl}/api/chat/${selectedChat.sessionId}`;
      
      // Try with native fetch API as fallback
      if (token) {
        // First try the test endpoint without auth
        try {
          const testUrl = `${apiUrl}/api/chat/test/${selectedChat.sessionId}`;
          const testResponse = await fetch(testUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.ok) {
            const data = await testResponse.json();
            
            toast.success("Chat deleted successfully (test endpoint)");
            
            // Remove chat from list
            refetchChats()
            setSelectedChat(null);
            setSearchParams({});
            setShowDeleteDialog(false);
            return;
          }
        } catch (testError) {
          // Continue with normal endpoint
        }
        
        // Try normal endpoint with auth
        const fetchResponse = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (fetchResponse.ok) {
          toast.success("Chat deleted successfully");
          
          // Remove chat from list
          refetchChats()
          setSelectedChat(null);
          setSearchParams({});
          setShowDeleteDialog(false);
          return;
        }
      }
      
      // Fall back to axios if fetch didn't work
      const response = await api.delete(`/api/chat/${selectedChat.sessionId}`);
      
      if (response.data.success) {
        toast.success("Chat deleted successfully");
        
        // Deselect the chat
        refetchChats()
        setSelectedChat(null);
        
        // Update URL parameters
        setSearchParams({});
      } else {
        toast.error("Error deleting chat");
      }
    } catch (error: any) {
      toast.error("Could not delete chat. Please try again.");
    } finally {
      setShowDeleteDialog(false);
    }
  }

  // Handle saving customer changes
  const handleSaveCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedChat) return;
    
    try {
      setLoading(true);
      
      // Get a valid workspace ID
      const workspaceId = getWorkspaceId();
      
      // Check if workspace ID is valid
      if (!workspaceId) {
        toast.error("Missing workspace ID");
        return;
      }
      
      // Extract form data
      const formData = new FormData(e.currentTarget);
      
      // Prepare shipping address
      const shippingAddress = {
        street: formData.get('street') as string || '',
        city: formData.get('city') as string || '',
        zip: formData.get('zip') as string || '',
        country: formData.get('country') as string || ''
      };
      
      // Get the form values - format to match the API expectations
      const customerData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string || '',
        phone: formData.get('phone') as string || '',
        company: formData.get('company') as string || '',
        language: formData.get('language') as string || 'en',
        discount: parseFloat(formData.get('discount') as string) || 0,
        notes: formData.get('notes') as string || '',
        address: JSON.stringify(shippingAddress),
        isActive: true
      };
      
      // Build the endpoint URL
      const endpoint = `/api/workspaces/${workspaceId}/customers/${selectedChat.customerId}`;
      
      // Make API call with PUT method to update customer
      const response = await api.put(endpoint, customerData);
      
      if (response.status === 200) {
        toast.success("Customer updated successfully");
        setShowEditSheet(false);
        // Update only the selected chat's customer info
        if (selectedChat) {
          const updatedCustomer = response.data;
          setSelectedChat({
            ...selectedChat,
            customerName: updatedCustomer.name || selectedChat.customerName,
            customerPhone: updatedCustomer.phone || selectedChat.customerPhone,
            companyName: updatedCustomer.company || selectedChat.companyName,
          });
        }
      } else {
        toast.error("Failed to update customer: " + (response.data?.error || "Unknown error"));
      }
    } catch (error) {
      toast.error("Failed to update customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show orders dialog
  const handleViewOrders = () => {
    setShowOrdersDialog(true);
  };

  return (
    <PageLayout>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Chat List */}
        <Card className="col-span-4 p-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search chats..."
              value={clientSearchTerm}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                if (e.target.value) {
                  newParams.set("client", e.target.value);
                } else {
                  newParams.delete("client");
                }
                // Mantieni il sessionId se presente
                if (sessionId) {
                  newParams.set("sessionId", sessionId);
                }
                setSearchParams(newParams);
              }}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {chats.length > 0 ? (
              chats.map((chat: Chat) => {
                // IMPORTANT: Compare sessionId instead of id
                const isSelected = selectedChat?.sessionId === chat.sessionId;
                
                return (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer rounded-lg mb-2 transition-all
                      ${isSelected 
                        ? 'border-l-4 border-green-600 bg-green-50 text-green-800 font-bold' 
                        : 'border-l-0 bg-white text-gray-900'}
                      ${!isSelected ? 'hover:bg-gray-50' : ''}
                      ${loadingChat && isSelected ? "opacity-70 pointer-events-none" : ""}`}
                    onClick={() => selectChat(chat)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">
                          {chat.customerName} {chat.companyName ? `(${chat.companyName})` : ''}
                        </h3>
                        <p className="text-xs text-green-600">
                          {chat.customerPhone}
                        </p>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDate(chat.lastMessageTime)}
                    </p>
                  </div>
                );
              })
            ) : isLoadingChats ? (
              <div className="flex items-center justify-center h-full">
                <div className="space-x-2 flex">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '0ms', animationDuration: '0.8s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '150ms', animationDuration: '0.8s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" 
                       style={{ animationDelay: '300ms', animationDuration: '0.8s' }}></div>
                </div>
              </div>
            ) : clientSearchTerm ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-gray-500 mb-2">Nessun risultato trovato per "{clientSearchTerm}"</p>
                <button 
                  className="text-sm text-green-600 hover:text-green-800"
                  onClick={() => setSearchParams(sessionId ? { sessionId } : {})}
                >
                  Cancella ricerca
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nessuna chat disponibile
              </div>
            )}
          </div>
        </Card>
        {/* Chat Window */}
        <Card className="col-span-8 p-4 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex justify-between items-center pb-2 border-b h-[60px]">
                <div>
                  <div 
                    className="flex items-center cursor-pointer group"
                    onClick={handleEditCustomer}
                  >
                    <h2 className="font-bold text-sm group-hover:text-green-600 transition-colors">
                      {selectedChat.customerName} {selectedChat.companyName ? `(${selectedChat.companyName})` : ''}
                    </h2>
                    <Pencil className="h-3 w-3 ml-1 text-green-600 group-hover:text-green-700 transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewOrders}
                    className="hover:bg-blue-50 h-7 px-2 py-0"
                    title="View Customer Orders"
                  >
                    <ShoppingBag className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-blue-600 text-xs">View orders</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBlockDialog(true)}
                    className="hover:bg-orange-50 h-7 px-2 py-0"
                    title="Block Use (Coming Soon)"
                  >
                    <Ban className="h-3 w-3 text-orange-600 mr-1" />
                    <span className="text-orange-600 text-xs">Block user</span>
                  </Button>
                  <Button 
                    id="delete-chat-button"
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteChat}
                    className="hover:bg-red-50 h-7 px-2 py-0"
                  >
                    <Trash2 className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-red-600 text-xs">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Messages - Modificato lo stile per una scrollbar dedicata e auto-scroll al fondo */}
              <div className="flex-1 overflow-y-auto py-2 space-y-2 h-[calc(100%-115px)] border border-gray-100 rounded-md p-2 scrollbar-container">
                {loadingChat ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="space-x-2 flex">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" 
                             style={{ animationDelay: '0ms', animationDuration: '0.8s' }}></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" 
                             style={{ animationDelay: '150ms', animationDuration: '0.8s' }}></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" 
                             style={{ animationDelay: '300ms', animationDuration: '0.8s' }}></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Caricamento messaggi...</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedChat.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[45%] p-2 rounded-lg ${
                            message.sender === "user"
                              ? "bg-green-100 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          {message.sender === "user" && message.agentName && (
                            <div className="text-[10px] text-green-700 font-medium mb-1 border-b border-green-200 pb-1">
                              Agent: {message.agentName}
                            </div>
                          )}
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatTextWithLinks(message.content) }}
                            className="message-content break-words whitespace-pre-wrap text-xs"
                          />
                          <p className="text-[10px] mt-1 opacity-70 text-right">
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Indicatore di loading quando si attende la risposta */}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-[45%] p-2 rounded-lg bg-gray-100 text-gray-900">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                                style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                                style={{ animationDelay: '150ms', animationDuration: '0.6s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                                style={{ animationDelay: '300ms', animationDuration: '0.6s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="mt-2 flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[40px] resize-none text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  disabled={isInputDisabled || loading}
                />
                <Button
                  onClick={(e) => handleSubmit(e)}
                  className="self-end h-8 w-8 p-0"
                  size="sm"
                  disabled={isInputDisabled || loading}
                >
                  {loading ? (
                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to view message history
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Chat"
        description={`Are you sure you want to delete the chat with ${selectedChat?.customerName}? This action cannot be undone and all messages will be lost.`}
        onConfirm={handleDeleteConfirm}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
      
      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block Chatbot</AlertDialogTitle>
            <AlertDialogDescription>
              This functionality is currently under development and will be available soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Orders Dialog */}
      <AlertDialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>View Customer Orders</AlertDialogTitle>
            <AlertDialogDescription>
              This functionality is currently under development and will be available soon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Customer Edit Sheet */}
      <ClientSheet
        client={selectedChat ? selectedChat.customerId : null}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleSaveCustomer}
        mode="edit"
        availableLanguages={availableLanguages}
      />
    </PageLayout>
  );
}