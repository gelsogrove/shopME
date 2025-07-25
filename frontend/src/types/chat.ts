export interface Message {
  id: string
  content: string
  sender: "user" | "customer"
  timestamp: string
  agentName?: string
  metadata?: {
    isOperatorMessage?: boolean
    isOperatorControl?: boolean
    agentSelected?: string
    sentBy?: string
    operatorId?: string
  }
}

export interface ShippingAddress {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  discount?: number
  language?: string
  notes?: string
  shippingAddress?: ShippingAddress
  activeChatbot?: boolean
}

export interface Chat {
  id: string
  sessionId: string
  customerId: string
  customerName: string
  customerPhone: string
  companyName?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isActive: boolean
  isFavorite: boolean
  messages?: Message[]
} 