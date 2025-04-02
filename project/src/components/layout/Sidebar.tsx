import { cn } from "@/lib/utils"
import {
  Blocks,
  Globe2,
  LayoutDashboard,
  MessagesSquare,
  Package2,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function Sidebar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { pathname } = useLocation()

  const mainRoutes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/prompts",
      label: "Prompts",
      icon: MessagesSquare,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: ShoppingCart,
    },
    {
      href: "/products",
      label: "Products",
      icon: Package2,
    },
    {
      href: "/services",
      label: "Services",
      icon: Wrench,
    },
  ]

  const settingsRoutes = [
    {
      href: "/settings/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/settings/categories",
      label: "Categories",
      icon: Blocks,
    },
    {
      href: "/settings/languages",
      label: "Languages",
      icon: Globe2,
    },
  ]

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-white",
        "w-[360px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col flex-1 py-10">
        {/* Project Name */}
        <div className="px-10 mb-12">
          <h1 className="text-5xl font-bold text-[#25D366]">ShopMe</h1>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-4 px-6">
          {mainRoutes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href

            return (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex h-16 w-full items-center rounded-md px-8 transition-colors",
                  isActive
                    ? "bg-[#25D366] text-white"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-8 w-8 shrink-0" />
                <span className="ml-4 text-xl font-medium">{route.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Settings Navigation */}
        <nav className="mt-auto space-y-4 px-6">
          <div className="mb-4 px-8 py-4">
            <h2 className="text-lg font-semibold uppercase text-muted-foreground">
              Settings
            </h2>
          </div>
          {settingsRoutes.map((route) => {
            const Icon = route.icon
            const isActive = pathname === route.href

            return (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex h-16 w-full items-center rounded-md px-8 transition-colors",
                  isActive
                    ? "bg-[#25D366] text-white"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-8 w-8 shrink-0" />
                <span className="ml-4 text-xl font-medium">{route.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
