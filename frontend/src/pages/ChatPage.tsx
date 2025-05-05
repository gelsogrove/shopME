import { PageLayout } from "@/components/layout/PageLayout"
import { ClientSheet } from "@/components/shared/ClientSheet"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { getWorkspaceId } from "@/config/workspace.config"
import { api } from "@/services/api"
import { getLanguages, Language } from "@/services/workspaceApi"
import { Ban, Pencil, Send, Trash2 } from "lucide-react"
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

export function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = searchParams.get("sessionId")
  const initialLoadRef = useRef(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['English', 'Italian', 'Spanish', 'French'])
  const [showBlockDialog, setShowBlockDialog] = useState<boolean>(false)
  const navigate = useNavigate()

  // Carica le chat all'avvio
  useEffect(() => {
    fetchChats();
  }, [])

  // Seleziona automaticamente la prima chat quando le chat sono caricate
  // e non c'è nessuna chat già selezionata o sessionId nell'URL
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
        console.error("Error fetching languages:", error);
        // Keep default languages in state
      }
    };
    
    fetchLanguages();
  }, []);

  // Seleziona la chat dai parametri URL solo al caricamento iniziale o quando cambia l'URL esternamente
  useEffect(() => {
    if (sessionId && chats.length > 0 && initialLoadRef.current) {
      const chat = chats.find(c => c.sessionId === sessionId)
      if (chat) {
        selectChat(chat, false) // false = don't update URL again
        initialLoadRef.current = false
      }
    }
  }, [sessionId, chats])

  // Funzione per auto-scrollare agli ultimi messaggi
  useEffect(() => {
    if (messagesEndRef.current && !loadingChat) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages, loadingChat]);

  // Funzione per caricare le chat recenti
  const fetchChats = async () => {
    setLoading(true)
    try {
      const response = await api.get("/api/chat/recent")
      if (response.data.success) {
        console.log("Chat data received:", response.data.data);
        
        // Log specifico per verificare i campi di data
        response.data.data.forEach((chat: any, index: number) => {
          console.log(`Chat ${index} - lastMessageTime: ${chat.lastMessageTime || 'MANCANTE'}`);
          // Prova a formattare la data per il debug
          if (chat.lastMessageTime) {
            try {
              const date = new Date(chat.lastMessageTime);
              console.log(`Chat ${index} - data formattata: ${date.toLocaleString()}`);
            } catch (e) {
              console.error(`Chat ${index} - errore formattazione data: ${e}`);
            }
          }
        });
        
        setChats(response.data.data);
      } else {
        toast.error("Errore nel caricamento delle chat")
      }
    } catch (error) {
      console.error("Errore nel caricamento delle chat:", error)
      toast.error("Non è stato possibile caricare le chat")
    } finally {
      setLoading(false)
    }
  }

  // Funzione per formattare la data in modo sicuro
  const formatDate = (dateString: string | null | undefined, agentName?: string) => {
    if (!dateString) {
      console.log("formatDate: dateString è null o undefined");
      return "Data non disponibile";
    }
    
    try {
      console.log(`formatDate: tentativo di formattare "${dateString}"`);
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.log(`formatDate: data invalida "${dateString}"`);
        return "Data non valida";
      }
      
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      const formattedDate = date.toLocaleDateString('it-IT', options);
      
      // Aggiungiamo il nome dell'agente se disponibile
      if (agentName) {
        return `${formattedDate} - ${agentName}`;
      }
      
      return formattedDate;
    } catch (error) {
      console.error("formatDate: errore durante la formattazione", error);
      return "Errore nella formattazione data";
    }
  };

  // Funzione per selezionare una chat e caricare i messaggi
  const selectChat = async (chat: Chat, updateUrl = true) => {
    setLoadingChat(true)
    try {
      // Assicuriamoci che companyName sia sempre presente
      const chatWithCompany = {
        ...chat,
        companyName: chat.companyName || ""
      };
      
      // Aggiorna i parametri URL solo se richiesto
      if (updateUrl) {
        setSearchParams({ sessionId: chatWithCompany.sessionId })
      }
      
      if (!chatWithCompany.messages) {
        // Carica i messaggi della chat selezionata
        const response = await api.get(`/api/chat/${chatWithCompany.sessionId}/messages`)
        if (response.data.success) {
          // Formatta i messaggi per la visualizzazione
          const formattedMessages: Message[] = response.data.data.map((m: any) => ({
            id: m.id,
            content: m.content,
            sender: m.direction === "INBOUND" ? "customer" : "user",
            timestamp: m.createdAt || new Date().toISOString(),
            agentName: m.agentName || (m.direction === "OUTBOUND" ? "Generic" : undefined)
          }))
          
          chatWithCompany.messages = formattedMessages
        }
      }
      
      // Aggiorna lo stato della chat selezionata
      setSelectedChat(chatWithCompany)
      
      // Imposta il conteggio dei messaggi non letti a 0 solo per la chat corrente
      if (chatWithCompany.unreadCount > 0) {
        // Creiamo una nuova lista di chat per aggiornare lo stato correttamente
        const updatedChats = chats.map(c => {
          // Aggiorna solo la chat corrente, mantiene inalterato il conteggio per le altre
          if (c.sessionId === chatWithCompany.sessionId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        });
        
        // Aggiorna lo stato chats con la nuova lista
        setChats(updatedChats);
        
        // Marca i messaggi come letti nel backend (una sola volta)
        try {
          await api.post(`/api/chat/${chatWithCompany.sessionId}/mark-read`)
          
          // Dispatch a custom event to notify the sidebar to update the total unread count
          window.dispatchEvent(new CustomEvent('messagesMarkedAsRead'));
        } catch (err) {
          console.error("Errore nel marcare i messaggi come letti:", err)
        }
      }
      
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error)
      toast.error("Non è stato possibile caricare i messaggi")
    } finally {
      setLoadingChat(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedChat) return
    
    try {
      console.log("Invio messaggio...");
      
      // Crea un nuovo messaggio
      const newMessage = {
        id: Date.now().toString(),
        content: messageInput,
        sender: "user" as const,
        timestamp: new Date().toISOString()
      }
      
      // Aggiorna la chat selezionata con il nuovo messaggio
      const updatedChat = {
        ...selectedChat,
        messages: [...(selectedChat.messages || []), newMessage],
        lastMessage: messageInput,
        lastMessageTime: new Date().toISOString()
      }
      
      setSelectedChat(updatedChat)
      setMessageInput("")
      
      // Ottieni il workspaceId direttamente dal localStorage invece di fare una chiamata API
      let currentWorkspaceId = "";
      try {
        const workspaceData = sessionStorage.getItem("currentWorkspace");
        if (workspaceData) {
          const workspace = JSON.parse(workspaceData);
          currentWorkspaceId = workspace.id;
          console.log("WorkspaceId dal sessionStorage:", currentWorkspaceId);
        } else {
          currentWorkspaceId = getWorkspaceId();
          console.log("WorkspaceId di fallback:", currentWorkspaceId);
        }
      } catch (err) {
        console.error("Errore nel recupero del workspaceId:", err);
        currentWorkspaceId = getWorkspaceId();
      }
      
      console.log("Invio messaggio al backend con workspaceId:", currentWorkspaceId);
      console.log("Dati messaggio:", {
        message: messageInput,
        phoneNumber: selectedChat.customerPhone,
        workspaceId: currentWorkspaceId
      });
      
      // Invia il messaggio al backend
      const response = await api.post('/api/messages', { 
        message: messageInput,
        phoneNumber: selectedChat.customerPhone,
        workspaceId: currentWorkspaceId
      });
      
      console.log("Risposta dal backend:", response.data);
      
      if (response.data.success) {
        // Dopo aver ricevuto la risposta, aggiorniamo nuovamente le chat
        fetchChats()
        
        // Estraiamo il nome dell'agente dalla risposta
        let agentName = "Generic";
        // Cerca il nome dell'agente nella risposta, che potrebbe essere in formato "_Agente: NomeAgente_"
        console.log("Controllo contenuto per agente:", response.data.data.processedMessage);
        const agentMatch = response.data.data.processedMessage.match(/_Agente:\s*([^_]+)_/);
        console.log("Risultato match agente:", agentMatch);
        
        if (agentMatch && agentMatch[1]) {
          agentName = agentMatch[1].trim();
          console.log("Nome agente estratto:", agentName);
        } else {
          console.log("Nessun agente trovato nella risposta, uso il valore predefinito:", agentName);
        }
        
        // Creiamo il messaggio di risposta dal sistema
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.data.processedMessage,
          sender: "customer" as const,
          timestamp: new Date().toISOString(),
          agentName: agentName // Usiamo il nome dell'agente estratto
        }
        
        console.log("Messaggio di risposta creato:", responseMessage);
        
        // Aggiorniamo la chat selezionata con la risposta del sistema
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
      console.error("Errore nell'invio del messaggio:", error)
      toast.error("Non è stato possibile inviare il messaggio")
    }
  }

  // Disable message input during loading
  const isInputDisabled = loadingChat;

  // Funzione per eliminare una chat
  const handleDeleteChat = () => {
    if (!selectedChat) return
    setShowDeleteDialog(true)
  }

  // Funzione per aprire il form di modifica cliente
  const handleEditCustomer = async () => {
    if (!selectedChat) {
      toast.error("No chat selected");
      return;
    }
    setShowEditSheet(true);
  };
  
  // Function to convert address object to string
  const stringifyAddress = (address: ShippingAddress): string => {
    try {
      return JSON.stringify(address);
    } catch (e) {
      console.error("Error stringifying address:", e);
      return '';
    }
  }
  
  // Function to convert text with URLs to HTML with clickable links
  const formatTextWithLinks = (text: string): string => {
    // Regex for URLs - includes support for URLs with query parameters and anchors
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Replace any URL with an HTML link
    return text.replace(urlRegex, (url) => {
      // Sanitize the URL display to prevent XSS
      const displayUrl = url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      
      // Create a fully clickable link 
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-700 underline break-all">${displayUrl}</a>`;
    });
  };

  // Try to get auth credentials from different sources
  const getAuthCredentials = () => {
    try {
      // Try localStorage first
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData?.token) {
          console.log("Found token in localStorage user object");
          return userData.token;
        }
      }
      
      // Try token directly
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Found token directly in localStorage");
        return token;
      }
      
      // Try session storage
      const sessionUser = sessionStorage.getItem("user");
      if (sessionUser) {
        const sessionUserData = JSON.parse(sessionUser);
        if (sessionUserData?.token) {
          console.log("Found token in sessionStorage user object");
          return sessionUserData.token;
        }
      }
      
      // No token found
      console.log("No token found in any storage");
      return null;
    } catch (error) {
      console.error("Error getting auth credentials:", error);
      return null;
    }
  };

  // Funzione per confermare l'eliminazione della chat
  const handleDeleteConfirm = async () => {
    if (!selectedChat) return
    
    try {
      console.log(`Attempting to delete chat with sessionId: ${selectedChat.sessionId}`);
      
      // Get the auth token from localStorage
      const token = getAuthCredentials();
      console.log("Auth token available:", !!token);
      
      // Construct full URL
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const fullUrl = `${apiUrl}/api/chat/${selectedChat.sessionId}`;
      console.log("Full DELETE URL:", fullUrl);
      
      // Try with native fetch API as fallback
      if (token) {
        console.log("Trying with direct fetch API");
        
        // First try the test endpoint without auth
        try {
          console.log("Trying test endpoint without auth");
          const testUrl = `${apiUrl}/api/chat/test/${selectedChat.sessionId}`;
          const testResponse = await fetch(testUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (testResponse.ok) {
            const data = await testResponse.json();
            console.log("Test endpoint response:", data);
            
            toast.success("Chat deleted successfully (test endpoint)");
            
            // Remove chat from list
            setChats(chats.filter(c => c.sessionId !== selectedChat.sessionId));
            setSelectedChat(null);
            setSearchParams({});
            setShowDeleteDialog(false);
            return;
          } else {
            console.error("Test endpoint failed:", testResponse.status, await testResponse.text());
          }
        } catch (testError) {
          console.error("Error with test endpoint:", testError);
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
          const data = await fetchResponse.json();
          console.log("Fetch response:", data);
          
          toast.success("Chat deleted successfully");
          
          // Remove chat from list
          setChats(chats.filter(c => c.sessionId !== selectedChat.sessionId));
          setSelectedChat(null);
          setSearchParams({});
          setShowDeleteDialog(false);
          return;
        } else {
          console.error("Fetch failed:", fetchResponse.status, await fetchResponse.text());
        }
      }
      
      // Fall back to axios if fetch didn't work
      const response = await api.delete(`/api/chat/${selectedChat.sessionId}`);
      
      console.log("Delete response:", response);
      
      if (response.data.success) {
        toast.success("Chat deleted successfully");
        
        // Rimuovi la chat dalla lista
        setChats(chats.filter(c => c.sessionId !== selectedChat.sessionId));
        
        // Deseleziona la chat
        setSelectedChat(null);
        
        // Aggiorna i parametri URL
        setSearchParams({});
      } else {
        toast.error("Error deleting chat");
      }
    } catch (error: any) {
      console.error("Error deleting chat:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
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
      console.log("Form submission started");
      
      // Get a valid workspace ID
      const workspaceId = getWorkspaceId();
      
      // Check if workspace ID is valid
      if (!workspaceId) {
        console.error("Invalid workspace ID");
        toast.error("Missing workspace ID");
        return;
      }
      
      console.log("Using workspace ID:", workspaceId);
      
      // Extract form data
      const formData = new FormData(e.currentTarget);
      console.log("Form data:", Object.fromEntries(formData.entries()));
      
      // Prepare shipping address - make sure all fields are properly populated
      const shippingAddress = {
        street: formData.get('street') as string || '',
        city: formData.get('city') as string || '',
        zip: formData.get('zip') as string || '',
        country: formData.get('country') as string || ''
      };
      
      console.log("Shipping address:", shippingAddress);
      
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
      
      console.log("Updating customer with data:", customerData);
      console.log("Customer ID:", selectedChat.customerId);
      console.log("Workspace ID:", workspaceId);
      
      // Build the endpoint URL
      const endpoint = `/api/workspaces/${workspaceId}/customers/${selectedChat.customerId}`;
      console.log("PUT endpoint:", endpoint);
      
      // Make API call with PUT method to update customer
      const response = await api.put(endpoint, customerData);
      
      console.log("Update response:", response);
      
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
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer. Please try again.");
    } finally {
      setLoading(false);
    }
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
              value={searchParams.get("client") || ""}
              onChange={(e) => setSearchParams({ client: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${
                  selectedChat?.id === chat.id ? "bg-gray-50" : ""
                } ${loadingChat && selectedChat?.id === chat.id ? "opacity-70 pointer-events-none" : ""}`}
                onClick={() => selectChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {chat.customerName} {chat.companyName ? `(${chat.companyName})` : ''}
                    </h3>
                    <p className="text-sm text-green-600">
                      {chat.customerPhone}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(chat.lastMessageTime, chat.companyName)}
                </p>
              </div>
            ))}
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
                    <h2 className="font-bold group-hover:text-green-600 transition-colors">
                      {selectedChat.customerName} {selectedChat.companyName ? `(${selectedChat.companyName})` : ''}
                    </h2>
                    <Pencil className="h-4 w-4 ml-2 text-green-600 group-hover:text-green-700 transition-colors" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBlockDialog(true)}
                    className="hover:bg-orange-50"
                    title="Block Use (Coming Soon)"
                  >
                    <Ban className="h-4 w-4 text-orange-600 mr-1" />
                    <span className="text-orange-600 text-sm">Block user</span>
                  </Button>
                  <Button 
                    id="delete-chat-button"
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteChat}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-red-600 text-sm">Delete</span>
                  </Button>
                </div>
              </div>

              {/* Messages - Modificato lo stile per una scrollbar dedicata e auto-scroll al fondo */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 h-[calc(100%-115px)] border border-gray-100 rounded-md p-2 scrollbar-container">
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
                          className={`max-w-[45%] p-3 rounded-lg ${
                            message.sender === "user"
                              ? "bg-green-100 text-gray-900"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatTextWithLinks(message.content) }}
                            className="message-content break-words whitespace-pre-wrap"
                          />
                          <p className="text-xs mt-1 opacity-70 text-right">
                            {formatDate(message.timestamp, message.sender === "customer" ? message.agentName : undefined)}
                          </p>
                        </div>
                      </div>
                    ))}
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
                  className="min-h-[50px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  disabled={isInputDisabled}
                />
                <Button
                  onClick={(e) => handleSubmit(e)}
                  className="self-end"
                  size="icon"
                  disabled={isInputDisabled}
                >
                  <Send className="h-4 w-4" />
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