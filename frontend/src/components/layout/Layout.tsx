import { TooltipProvider } from "@/components/ui/tooltip"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function Layout() {
  return (
    <TooltipProvider>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex w-full flex-col pl-72">
          <Header />
          <main className="flex-1 p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
