import { useWorkspace } from "@/hooks/use-workspace"
import { useRecentChats } from "@/hooks/useRecentChats"
import { cn } from "@/lib/utils"
import {
  Bell,
  Calendar,
  ClipboardList,
  HelpCircle,
  LayoutGrid,
  LucideIcon,
  MessageSquare,
  Package2,
  ShoppingCart,
  Tag,
  Users,
  Wrench
} from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"

interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
  badge?: number
  className?: string
  children?: SidebarLink[]
  isOpen?: boolean
}

export function Sidebar() {
  const { data: allChats = [] } = useRecentChats()
  const totalUnreadMessages = allChats.reduce(
    (acc, chat) => acc + (chat.unreadCount || 0),
    0
  )
  const { workspace } = useWorkspace()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    products: true // Inizialmente espanso
  })

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const mainLinks: SidebarLink[] = [
    {
      href: "/chat",
      label: "Chat History",
      icon: MessageSquare,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users,
    },
    {
      href: "/products",
      label: "Products",
      icon: Package2,
    },
    {
      href: "/categories",
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
      href: "/faq",
      label: "FAQ",
      icon: HelpCircle,
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
      href: "/surveys",
      label: "Surveys (WIP)",
      icon: ClipboardList,
    },
    {
      href: "/analytics",
      label: "Dashboard (WIP)",
      icon: LayoutGrid,
    },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-24 px-8 border-b">
          <span className="text-2xl font-bold text-green-600">ShopME</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6">
          {mainLinks.map((link) => (
            <div key={link.href}>
              {link.children ? (
                <div className="mb-1">
                  <button
                    onClick={() => toggleExpand('products')}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                      expandedItems.products
                        ? "bg-green-50 text-green-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className="h-6 w-6" />
                      {link.label}
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        expandedItems.products ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {expandedItems.products && (
                    <div className="ml-6 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <NavLink
                          key={child.href}
                          to={child.href}
                          end={child.href === "/products"}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-green-50 text-green-600"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )
                          }
                        >
                          <child.icon className="h-5 w-5" />
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors relative",
                      isActive
                        ? "bg-green-50 text-green-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                      link.className
                    )
                  }
                >
                  <link.icon className="h-6 w-6" />
                  {link.label}
                  {link.badge !== undefined && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
