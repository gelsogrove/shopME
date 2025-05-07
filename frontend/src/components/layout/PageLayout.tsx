import { WhatsAppChatModal } from "@/components/shared/WhatsAppChatModal"
import { Button } from "@/components/ui/button"
import { Chat } from "@/types/chat"
import { MessageCircle } from "lucide-react"
import { ReactNode, useState } from "react"

interface PageLayoutProps {
  children: ReactNode
  selectedChat?: Chat | null
}

/**
 * Standard layout wrapper for all main pages in the application
 * Ensures consistent page structure and spacing
 */
export function PageLayout({ children, selectedChat }: PageLayoutProps) {
  const [showPlaygroundDialog, setShowPlaygroundDialog] = useState<boolean>(false)

  const handlePlaygroundClick = () => {
    setShowPlaygroundDialog(true)
  }
  
  const handleClosePlayground = () => {
    setShowPlaygroundDialog(false)
    // Reload the page after a short delay to allow the modal to close
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4 relative">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          {children}
        </div>
      </div>

      {/* Fixed WhatsApp-style Button with text - visible on all pages */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={handlePlaygroundClick}
          className="bg-[#25D366] hover:bg-[#22c35e] text-white rounded-full shadow-lg h-14 px-6 flex items-center justify-center gap-2"
          title="WhatsApp Playground"
        >
          <MessageCircle className="h-6 w-6 fill-white" />
          <span className="font-medium text-sm">Playground</span>
        </Button>
      </div>

      {/* Playground Chat Modal */}
      <WhatsAppChatModal
        isOpen={showPlaygroundDialog}
        onClose={handleClosePlayground}
        channelName="WhatsApp Chat"
        phoneNumber={selectedChat?.customerPhone || ""}
        selectedChat={selectedChat}
      />
    </div>
  )
} 