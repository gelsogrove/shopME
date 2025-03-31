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
    <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
      {items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          <Link
            to={item.path}
            className="hover:text-gray-900 dark:hover:text-white"
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
    { name: "Dashboard", href: "/dashboard", icon: Home },
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

  // Helper function to get breadcrumb structure based on current path
  const getBreadcrumbItems = () => {
    const path = location.pathname
    const allRoutes = [...navigation, ...settingsMenu]

    // Always start with Dashboard
    const items = [{ label: "Dashboard", path: "/dashboard" }]

    // Find the current route
    const currentRoute = allRoutes.find((route) => path.startsWith(route.href))

    if (currentRoute) {
      items.push({ label: currentRoute.name, path: currentRoute.href })

      // Add third level for detail pages
      if (path !== currentRoute.href) {
        const segments = path.split("/")
        const lastSegment = segments[segments.length - 1]

        // Format the last segment based on the page type
        let detailLabel = lastSegment
        if (path.includes("/orders/")) {
          detailLabel = `Order #${lastSegment}`
        } else if (path.includes("/chat-history/")) {
          // Find the chat to get the customer name
          const chat = chats.find((c) => c.id === parseInt(lastSegment))
          detailLabel = chat ? chat.customer : `Chat #${lastSegment}`
        } else if (path.includes("/categories/")) {
          detailLabel = `Category ${lastSegment}`
        }

        items.push({ label: detailLabel, path: null }) // null path means it's the current page
      }
    }

    return items
  }

  // If we are on the workspace page, show only cards without menu
  if (location.pathname === "/workspace") {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="flex justify-between items-center px-4 py-4">
          <div className="text-gray-600 dark:text-gray-400">
            +39 333 444 5555
          </div>
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

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ShopMe
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              if (item.children) {
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className={cn(
                        "flex items-center w-full px-4 py-2 text-sm font-medium rounded-md",
                        isSettingsOpen
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "ml-auto h-4 w-4 transition-transform",
                          isSettingsOpen ? "transform rotate-180" : ""
                        )}
                      />
                    </button>
                    {isSettingsOpen && (
                      <div className="space-y-1 pl-11">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                                isActive
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                              )}
                            >
                              <child.icon className="mr-3 h-5 w-5" />
                              {child.name}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("lg:pl-64", isSidebarOpen ? "pl-64" : "pl-0")}>
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                {getBreadcrumbItems().map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                    {item.path ? (
                      <Link
                        to={item.path}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
