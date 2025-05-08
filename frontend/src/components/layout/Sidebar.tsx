import { useWorkspace } from "@/hooks/use-workspace"
import { useRecentChats } from '@/hooks/useRecentChats'
import { cn } from "@/lib/utils"
import {
  Bell,
  Bot,
  Calendar,
  LayoutGrid,
  LucideIcon,
  MessageSquare,
  Package2,
  ShoppingCart,
  Tag,
  Users,
  Wrench
} from "lucide-react"
import { NavLink } from "react-router-dom"

interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
  className?: string
}

export function Sidebar() {
  const { data: allChats = [] } = useRecentChats()
  const totalUnreadMessages = allChats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0)
  const { workspace } = useWorkspace();

  const mainLinks: SidebarLink[] = [
    {
      href: "/chat",
      label: "Chat History",
      icon: MessageSquare,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users
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
      href: "/events",
      label: "Events",
      icon: Calendar,
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
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-24 px-8 border-b">
          <span className="text-2xl font-bold text-green-600">ShopME</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6">
          {mainLinks.map(({ href, label, icon: Icon, badge, className }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/products"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors relative",
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                  className
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
