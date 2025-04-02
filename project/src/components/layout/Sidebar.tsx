import { cn } from "@/lib/utils"
import {
  BarChart,
  Box,
  CircleDollarSign,
  Cog,
  Globe,
  LayoutGrid,
  MessageSquare,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"
import { NavLink } from "react-router-dom"

const mainLinks = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart,
  },
  {
    href: "/chat",
    label: "Chat",
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
    href: "/services",
    label: "Services",
    icon: CircleDollarSign,
  },
  {
    href: "/prompts",
    label: "Prompts",
    icon: MessageSquare,
  },
]

const settingsLinks = [
  {
    href: "/settings/categories",
    label: "Categories",
    icon: Package,
  },
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
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-6">
          <span className="text-xl font-bold">ShopME</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {mainLinks.map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}

          <div className="mt-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Settings
              </h2>
            </div>
            {settingsLinks.map(({ href, label, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  )
}
