import { useWorkspace } from "@/hooks/use-workspace"
import { cn } from "@/lib/utils"
import { api } from "@/services/api"
import {
    Bell,
    Bot,
    LayoutGrid,
    MessageSquare,
    Package2,
    ShieldCheck,
    ShoppingCart,
    Tag,
    Users,
    Wrench
} from "lucide-react"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"

export function Sidebar() {
  const [unknownCustomerCount, setUnknownCustomerCount] = useState<number>(0);
  const { workspace } = useWorkspace();
  
  useEffect(() => {
    // Fetch unknown customer count when workspace is available
    const fetchUnknownCustomerCount = async () => {
      if (!workspace?.id) return;
      
      try {
        const response = await api.get(`/api/workspaces/${workspace.id}/unknown-customers/count`);
        if (response.data && typeof response.data.count === 'number') {
          setUnknownCustomerCount(response.data.count);
        }
      } catch (error) {
        console.error("Error fetching unknown customer count:", error);
      }
    };
    
    fetchUnknownCustomerCount();
    // Set interval to refresh count every minute
    const intervalId = setInterval(fetchUnknownCustomerCount, 60000);
    
    return () => clearInterval(intervalId);
  }, [workspace]);

  const mainLinks = [
    {
      href: "/chat",
      label: "Chat History",
      icon: MessageSquare,
    },
    {
      href: "/clients",
      label: "Clients",
      icon: Users,
      badge: unknownCustomerCount > 0 ? unknownCustomerCount : undefined
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
    {
      href: "/gdpr",
      label: "GDPR",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-72 bg-white border-r">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-24 px-8 border-b">
          <span className="text-2xl font-bold text-green-600">ShopME</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-6">
          {mainLinks.map(({ href, label, icon: Icon, badge }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/products"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors relative",
                  isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
