import {
  Box,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Terminal,
  User,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, Outlet, useLocation, useParams } from "react-router-dom"
import { cn } from "../../lib/utils"

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center text-sm">
      <Link
        to="/workspace"
        className="text-[#25D366] font-medium hover:text-[#128C7E]"
      >
        +3465757575
      </Link>
      {items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <Link
            to={item.path}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            {item.label}
          </Link>
        </div>
      ))}
    </div>
  )
}

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef(null)
  const location = useLocation()
  const params = useParams()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Mock data for chats - in a real app this would come from an API or context
  const chats = [
    {
      id: 1,
      customer: "Mario Rossi",
      orderId: "ORD001",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      orderId: "ORD002",
    },
  ]

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Prompts", href: "/prompts", icon: Terminal },
    { name: "Chat History", href: "/chat-history", icon: MessageSquare },
  ]

  const settingsMenu = [
    { name: "Users", href: "/users", icon: User },
    { name: "Languages", href: "/languages", icon: Box },
    { name: "Categories", href: "/categories", icon: Box },
    { name: "Channel", href: "/channel-settings", icon: Settings },
  ]

  const getBreadcrumbItems = () => {
    const path = location.pathname
    const allRoutes = [...navigation, ...settingsMenu]
    const items = [{ label: "Dashboard", path: "/dashboard" }]

    if (path.startsWith("/orders")) {
      items.push({ label: "Orders", path: "/orders" })
      if (path !== "/orders") {
        const orderId = path.split("/").pop()
        items.push({ label: orderId, path: path })
      }
      return items
    }

    const currentRoute = allRoutes.find((route) => path.startsWith(route.href))
    if (currentRoute && currentRoute.href !== "/") {
      items.push({ label: currentRoute.name, path: currentRoute.href })
    }

    return items
  }

  // If we are on the workspace page, show only cards without menu
  if (location.pathname === "/workspace") {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[#25D366]"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            ShopMe
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1",
                  isActive
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className={cn("lg:pl-64 flex flex-col min-h-screen bg-white")}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="h-16 flex items-center justify-between px-4">
            <Breadcrumb items={getBreadcrumbItems()} />
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                JD
              </div>
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {settingsMenu.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsSettingsOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
