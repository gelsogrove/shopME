import { X } from "lucide-react"
import React from "react"

interface CartIframePopupProps {
  isOpen: boolean
  onClose: () => void
  iframeSrc: string
  customerName?: string
}

export const CartIframePopup: React.FC<CartIframePopupProps> = ({
  isOpen,
  onClose,
  iframeSrc,
  customerName,
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Popup Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-2xl w-full flex flex-col relative"
          style={{
            maxWidth: "calc(56rem - 40px)",
            height: "calc(80vh + 20px)",
          }}
        >
          {/* Close Button - Half outside, half inside */}
          <button
            onClick={onClose}
            className="absolute -top-5 -right-5 flex items-center justify-center w-10 h-10 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors shadow-xl border-2 border-white"
            style={{ zIndex: 10000 }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Iframe Container */}
          <div className="flex-1 p-4 overflow-auto rounded-lg">
            <iframe
              src={iframeSrc}
              className="w-full h-full border border-gray-200 rounded-md"
              style={{
                minHeight: "600px",
                aspectRatio: "3/4", // Height longer than width
              }}
              title="Customer Cart"
              sandbox="allow-scripts allow-same-origin allow-forms"
              scrolling="auto"
            />
          </div>
        </div>
      </div>
    </>
  )
}
