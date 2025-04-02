import { ChevronRight, Phone } from "lucide-react"
import React from "react"
import { Link, useLocation } from "react-router-dom"

export function Breadcrumb() {
  const location = useLocation()
  const paths = location.pathname.split("/").filter(Boolean)

  const getBreadcrumbItems = () => {
    if (paths.length === 0) return [{ label: "Dashboard", href: "/dashboard" }]

    const items = [{ label: "Dashboard", href: "/dashboard" }]

    if (paths[0] === "settings") {
      items[0] = { label: "Settings", href: "/settings/users" }
    }

    let currentPath = ""
    paths.forEach((path) => {
      currentPath += `/${path}`
      if (path === "settings") return // Skip "settings" from breadcrumb
      items.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        href: currentPath,
      })
    })

    return items
  }

  const items = getBreadcrumbItems()

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      <Link
        to="/workspace"
        className="flex items-center gap-1 hover:text-gray-900"
      >
        <Phone className="h-4 w-4" />
        {items[0].label}
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          {index === items.length - 1 ? (
            <span className="text-gray-900">{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className={
                index === items.length - 1
                  ? "font-medium text-foreground"
                  : "hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
