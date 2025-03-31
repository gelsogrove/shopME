import {
  ChevronDown,
  ChevronRight,
  History,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
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

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Package },
    { name: "Products", href: "/products", icon: Package },
    { name: "Categories", href: "/categories", icon: Tag },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Prompts", href: "/prompts", icon: MessageSquare },
    { name: "History", href: "/history", icon: History },
  ]

  const settingsMenu = [
    { name: "Channel", href: "/channel" },
    { name: "Users", href: "/users" },
    { name: "Languages", href: "/languages" },
  ]

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const path = location.pathname
    const items = [{ label: "+39 333 444 5555", path: "/workspace" }]

    const currentRoute = navigation.find((item) => item.href === path)
    if (currentRoute) {
      items.push({ label: currentRoute.name, path: currentRoute.href })
    }

    return items
  }

  // If we are on the workspace page, show only cards without menu
  if (location.pathname === "/workspace") {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4 py-8">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top header with settings */}
      <div className="bg-white dark:bg-gray-800 shadow-sm z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              +39 333 444 5555
            </div>
            <div className="relative">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium">
                  JD
                </div>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="h-5 w-5 mr-1" />
                  <span>Settings</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-1 transition-transform duration-200",
                      isSettingsOpen ? "transform rotate-180" : ""
                    )}
                  />
                </button>
              </div>

              {/* Settings dropdown */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 border dark:border-gray-700">
                  {settingsMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
            <Breadcrumb items={getBreadcrumbItems()} />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
