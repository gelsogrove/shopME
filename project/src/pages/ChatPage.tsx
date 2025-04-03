import { useState } from "react"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"

interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
}

interface Chat {
  id: string
  customerName: string
  customerPhone: string
  lastMessage: string
  unreadCount: number
  lastActive: string
  messages: Message[]
}

const mockChats: Chat[] = [
  {
    id: "1",
    customerName: "Giovanni Rossi",
    customerPhone: "+39123456789",
    lastMessage: "Vorrei sapere quando arriva il mio ordine",
    unreadCount: 2,
    lastActive: "2024-04-01T10:30:00",
    messages: [
      {
        id: "1",
        content: "Buongiorno, ho fatto un ordine ieri, numero #12345.",
        sender: "customer",
        timestamp: "2024-04-01T10:25:00",
      },
      {
        id: "2",
        content: "Vorrei sapere quando arriverà la spedizione.",
        sender: "customer",
        timestamp: "2024-04-01T10:26:00",
      },
      {
        id: "3",
        content:
          "Buongiorno Sig. Rossi, grazie per averci contattato. Controllo subito il suo ordine.",
        sender: "user",
        timestamp: "2024-04-01T10:28:00",
      },
      {
        id: "4",
        content:
          "Ho verificato l'ordine #12345. La spedizione è stata elaborata e partirà oggi pomeriggio.",
        sender: "user",
        timestamp: "2024-04-01T10:29:00",
      },
      {
        id: "5",
        content: "Riceverà il suo pacco entro 24-48 ore lavorative.",
        sender: "user",
        timestamp: "2024-04-01T10:29:30",
      },
      {
        id: "6",
        content: "Perfetto, grazie mille per l'informazione!",
        sender: "customer",
        timestamp: "2024-04-01T10:30:00",
      },
      {
        id: "7",
        content: "Vorrei sapere se è possibile tracciare la spedizione?",
        sender: "customer",
        timestamp: "2024-04-01T10:30:30",
      },
    ],
  },
  {
    id: "2",
    customerName: "Maria Bianchi",
    customerPhone: "+39987654321",
    lastMessage: "Grazie per le informazioni, ora è tutto chiaro",
    unreadCount: 0,
    lastActive: "2024-04-01T09:15:00",
    messages: [
      {
        id: "1",
        content:
          "Salve, vorrei informazioni sul Parmigiano Reggiano DOP 24 mesi.",
        sender: "customer",
        timestamp: "2024-04-01T09:00:00",
      },
      {
        id: "2",
        content: "Buongiorno Sig.ra Bianchi, cosa vorrebbe sapere esattamente?",
        sender: "user",
        timestamp: "2024-04-01T09:05:00",
      },
      {
        id: "3",
        content:
          "Vorrei sapere la disponibilità e se fate consegne nella mia zona (Milano centro).",
        sender: "customer",
        timestamp: "2024-04-01T09:07:00",
      },
      {
        id: "4",
        content:
          "Il Parmigiano Reggiano DOP 24 mesi è disponibile in varie pezzature: 250g, 500g e 1kg.",
        sender: "user",
        timestamp: "2024-04-01T09:09:00",
      },
      {
        id: "5",
        content:
          "Per quanto riguarda le consegne, copriamo tutta l'area di Milano con consegne gratuite per ordini superiori a 50€.",
        sender: "user",
        timestamp: "2024-04-01T09:10:00",
      },
      {
        id: "6",
        content: "Perfetto! Vorrei ordinare 500g. Come posso procedere?",
        sender: "customer",
        timestamp: "2024-04-01T09:12:00",
      },
      {
        id: "7",
        content:
          "Può effettuare l'ordine direttamente sul nostro sito nella sezione 'Formaggi' o posso registrare io l'ordine per lei ora.",
        sender: "user",
        timestamp: "2024-04-01T09:14:00",
      },
      {
        id: "8",
        content:
          "Grazie per le informazioni, ora è tutto chiaro. Procederò con l'ordine sul sito!",
        sender: "customer",
        timestamp: "2024-04-01T09:15:00",
      },
    ],
  },
]

export function ChatPage() {
  const [chats] = useState<Chat[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.customerPhone.includes(searchTerm)
  )

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
        {/* Chat List */}
        <Card className="col-span-4 p-4 overflow-hidden flex flex-col">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 rounded-lg mb-2 ${
                  selectedChat?.id === chat.id ? "bg-gray-50" : ""
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{chat.customerName}</h3>
                    <p className="text-sm text-gray-500">
                      {chat.customerPhone}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(chat.lastActive).toLocaleTimeString()}
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
                  <h2 className="font-bold">{selectedChat.customerName}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedChat.customerPhone}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to view message history
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
