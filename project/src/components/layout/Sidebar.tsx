import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Blocks,
  ChevronLeft,
  ChevronRight,
  Globe2,
  LayoutDashboard,
  MessagesSquare,
  Package2,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { pathname } = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        "relative flex h-full flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-md"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <TooltipProvider>
        <div className="flex flex-col flex-1 py-6">
          {/* Main Navigation */}
          <nav className="space-y-1 px-3">
            {mainRoutes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href

              return (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={route.href}
                      className={cn(
                        "flex h-11 w-full items-center rounded-md px-4 transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 text-base font-medium">
                          {route.label}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{route.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>

          {/* Settings Navigation */}
          <nav className="mt-auto space-y-1 px-3">
            {!isCollapsed && (
              <div className="mb-2 px-4 py-2">
                <h2 className="text-xs font-semibold uppercase text-muted-foreground">
                  Settings
                </h2>
              </div>
            )}
            {settingsRoutes.map((route) => {
              const Icon = route.icon
              const isActive = pathname === route.href

              return (
                <Tooltip key={route.href}>
                  <TooltipTrigger asChild>
                    <Link
                      to={route.href}
                      className={cn(
                        "flex h-11 w-full items-center rounded-md px-4 transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="ml-3 text-base font-medium">
                          {route.label}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{route.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </nav>
        </div>
      </TooltipProvider>
    </div>
  )
}
