import { Chat } from "@/types/chat"
import { createContext, ReactNode, useContext, useState } from "react"

interface ChatContextType {
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  return (
    <ChatContext.Provider value={{ selectedChat, setSelectedChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
