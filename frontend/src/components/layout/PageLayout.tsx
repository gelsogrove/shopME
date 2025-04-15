import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
}

/**
 * Standard layout wrapper for all main pages in the application
 * Ensures consistent page structure and spacing
 */
export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          {children}
        </div>
      </div>
    </div>
  )
} 