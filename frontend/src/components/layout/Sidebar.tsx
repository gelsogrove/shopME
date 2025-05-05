import { useWorkspace } from "@/hooks/use-workspace"
import { cn } from "@/lib/utils"
import { api } from "@/services/api"
import {
    Bell,
    Bot,
    LayoutGrid,
    MessageSquare,
    Package2,
    ShieldCheck,
    ShoppingCart,
    Tag,
    Users,
    Wrench
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

export function Sidebar() {
  const [totalUnreadMessages, setTotalUnreadMessages] = useState<number>(2);
  const { workspace } = useWorkspace();
  
  // Fetch total unread messages count
  useEffect(() => {
    if (!workspace?.id) return;
    
    const fetchTotalUnreadMessages = async () => {
      try {
        console.log("Fetching unread messages count...");
        const response = await api.get('/api/chat/recent');
        
        if (response.data && response.data.data) {
          const chatData = response.data.data;
          // Calculate total unread count from all chats
          const totalUnread = chatData.reduce((acc: number, chat: any) => 
            acc + (chat.unreadCount || 0), 0);
          console.log(`Total unread messages: ${totalUnread}`);
          setTotalUnreadMessages(totalUnread > 0 ? totalUnread : 0);
        }
      } catch (error) {
        console.error("Error fetching total unread messages:", error);
        // In caso di errore, impostiamo comunque a 2 come fallback
        setTotalUnreadMessages(2);
      }
    };
    
    // Carica i dati iniziali
    fetchTotalUnreadMessages();
    
    // Imposta un intervallo per aggiornare i dati ogni minuto
    const intervalId = setInterval(fetchTotalUnreadMessages, 60000);
    
    // Listener per l'evento di messaggi letti
    const handleMessagesRead = () => {
      fetchTotalUnreadMessages();
    };
    
    // Aggiungi event listener per quando i messaggi sono segnati come letti
    window.addEventListener('messagesMarkedAsRead', handleMessagesRead);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('messagesMarkedAsRead', handleMessagesRead);
    };
  }, [workspace]);

  const mainLinks = [
    {
      href: "/chat",
      label: "Chat History",
      icon: MessageSquare,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users,
      badge: 2  // Valore fisso di 2 per Clients
    },
    {
      href: "/products",
      label: "Products",
      icon: Package2,
    },
    {
      href: "/products/categories",
      label: "Categories",
      icon: Tag,
    },
    {
      href: "/services",
      label: "Services",
      icon: Wrench,
    },
    {
      href: "/agents",
      label: "Agents",
      icon: Bot,
    },
    {
      href: "/orders",
      label: "Orders (WIP)",
      icon: ShoppingCart,
    },
    {
      href: "/notifications",
      label: "Push Notifications (WIP)",
      icon: Bell,
    },
    {
      href: "/analytics",
      label: "Analytics (WIP)",
      icon: LayoutGrid,
    },
    {
      href: "/gdpr",
      label: "GDPR",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-24 px-8 border-b">
          <span className="text-2xl font-bold text-green-600">ShopME</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6">
          {mainLinks.map(({ href, label, icon: Icon, badge }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/products"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors relative",
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <Icon className="h-6 w-6" />
              {label}
              {badge !== undefined && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
