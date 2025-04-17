import { PageLayout } from "@/components/layout/PageLayout"
import { api } from "@/services/api"
import { Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
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
  lastActive: string
  messages?: Message[]
}

export function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const sessionId = searchParams.get("sessionId")
  const initialLoadRef = useRef(true)

  // Carica le chat all'avvio
  useEffect(() => {
    fetchChats()
  }, [])

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

  // Funzione per caricare le chat recenti
  const fetchChats = async () => {
    setLoading(true)
    try {
      const response = await api.get("/api/chat/recent")
      if (response.data.success) {
        console.log("Chat data received:", response.data.data);
        setChats(response.data.data)
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

  // Funzione per selezionare una chat e caricare i messaggi
  const selectChat = async (chat: Chat, updateUrl = true) => {
    try {
      // Aggiorna i parametri URL solo se richiesto
      if (updateUrl) {
        setSearchParams({ sessionId: chat.sessionId })
      }
      
      if (!chat.messages) {
        // Carica i messaggi della chat selezionata
        const response = await api.get(`/api/chat/${chat.sessionId}/messages`)
        if (response.data.success) {
          // Formatta i messaggi per la visualizzazione
          const formattedMessages: Message[] = response.data.data.map((m: any) => ({
            id: m.id,
            content: m.content,
            sender: m.direction === "INBOUND" ? "customer" : "user",
            timestamp: m.createdAt
          }))
          
          chat.messages = formattedMessages
        }
      }
      
      // Aggiorna lo stato della chat selezionata
      setSelectedChat(chat)
      
      // Imposta il conteggio dei messaggi non letti a 0
      if (chat.unreadCount > 0) {
        setChats(prev => 
          prev.map(c => 
            c.id === chat.id ? { ...c, unreadCount: 0 } : c
          )
        )
        
        // Marca i messaggi come letti nel backend (una sola volta)
        try {
          await api.post(`/api/chat/${chat.sessionId}/mark-read`)
        } catch (err) {
          console.error("Errore nel marcare i messaggi come letti:", err)
        }
      }
      
    } catch (error) {
      console.error("Errore nel caricamento dei messaggi:", error)
      toast.error("Non è stato possibile caricare i messaggi")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !selectedChat) return
    
    try {
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
        lastActive: new Date().toISOString()
      }
      
      setSelectedChat(updatedChat)
      setMessageInput("")
      
      // Invia il messaggio al backend
      const response = await api.post('/api/messages', { 
        message: messageInput,
        phoneNumber: selectedChat.customerPhone,
        workspaceId: "42d4d042-9b85-424e-a7fc-7dc047f0c376"
      })
      
      if (response.data.success) {
        // Dopo aver ricevuto la risposta, aggiorniamo nuovamente le chat
        fetchChats()
        
        // Creiamo il messaggio di risposta dal sistema
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.data.processedMessage,
          sender: "customer" as const,
          timestamp: new Date().toISOString()
        }
        
        // Aggiorniamo la chat selezionata con la risposta del sistema
        setSelectedChat(prevChat => {
          if (!prevChat) return null
          return {
            ...prevChat,
            messages: [...(prevChat.messages || []), responseMessage],
            lastMessage: responseMessage.content,
            lastActive: new Date().toISOString()
          }
        })
      }
    } catch (error) {
      console.error("Errore nell'invio del messaggio:", error)
      toast.error("Non è stato possibile inviare il messaggio")
    }
  }

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
                }`}
                onClick={() => selectChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {chat.customerName} {chat.companyName && `(${chat.companyName})`}
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
                  {chat.lastActive ? (() => {
                    try {
                      const date = new Date(chat.lastActive);
                      return !isNaN(date.getTime()) 
                        ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                        : "Data non disponibile";
                    } catch (e) {
                      return "Data non disponibile";
                    }
                  })() : "Data non disponibile"}
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
                  <h2 className="font-bold">
                    {selectedChat.customerName} {selectedChat.companyName && `(${selectedChat.companyName})`}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-scroll py-4 space-y-4 h-[calc(100%-115px)] border border-gray-100 rounded-md p-2">
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
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
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
                />
                <Button
                  onClick={(e) => handleSubmit(e)}
                  className="self-end"
                  size="icon"
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
    </PageLayout>
  )
}
