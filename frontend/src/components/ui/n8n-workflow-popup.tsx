import { X } from "lucide-react"
import { Button } from "./button"

interface N8NWorkflowPopupProps {
  isOpen: boolean
  onClose: () => void
  workflowUrl: string
}

export function N8NWorkflowPopup({ isOpen, onClose, workflowUrl }: N8NWorkflowPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">N8N Workflow</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Iframe container */}
        <div className="flex-1 p-4">
          <iframe
            src={workflowUrl}
            className="w-full h-full border-0 rounded"
            title="N8N Workflow"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  )
} 