import { cn } from "@/lib/utils"
import {
  Bell,
  Box,
  Cog,
  Globe,
  LayoutGrid,
  MessageSquare,
  Package,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react"
import { NavLink } from "react-router-dom"

const mainLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    href: "/chat",
    label: "Chat History",
    icon: MessageSquare,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ShoppingCart,
  },
  {
    href: "/products",
    label: "Products",
    icon: Box,
  },
  {
    href: "/products/categories",
    label: "Categories",
    icon: Package,
  },
  {
    href: "/services",
    label: "Services",
    icon: Wrench,
  },
  {
    href: "/notifications",
    label: "Push Notifications",
    icon: Bell,
  },
  {
    href: "/prompts",
    label: "Prompts",
    icon: MessageSquare,
  },
]

const settingsLinks = [
  {
    href: "/settings/languages",
    label: "Languages",
    icon: Globe,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Cog,
  },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-24 px-8 border-b">
          <span className="text-2xl font-bold text-green-600">ShopME</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6">
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/products"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <Icon className="h-6 w-6" />
              {label}
            </NavLink>
          ))}

          <div className="mt-8">
            <div className="px-4 mb-2">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Settings
              </h2>
            </div>
            {settingsLinks.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === "/settings"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                      ? "bg-green-50 text-green-600"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )
                }
              >
                <Icon className="h-6 w-6" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  )
}
