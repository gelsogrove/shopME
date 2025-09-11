import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageRendererProps {
  content: string
  className?: string
  variant?: "modal" | "chat" | "compact"
}

export function MessageRenderer({ 
  content, 
  className = "", 
  variant = "chat" 
}: MessageRendererProps) {
  // Base classes for consistent formatting
  const baseClasses = "break-words text-sm"
  
  // Variant-specific classes
  const variantClasses = {
    modal: "whitespace-pre-line block leading-relaxed overflow-wrap-anywhere hyphens-auto",
    chat: "whitespace-pre-line leading-normal",
    compact: "whitespace-pre-line leading-tight"
  }
  
  // Inline styles for complex text wrapping (especially for WhatsApp-like formatting)
  const textStyle = {
    wordWrap: 'break-word' as const,
    overflowWrap: 'anywhere' as const,
    hyphens: 'auto' as const,
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    maxWidth: '100%'
  }

  return (
    <span 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={textStyle}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml={false}
        components={{
          // Consistent link styling
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            />
          ),
          // Preserve WhatsApp-style formatting
          p: ({ children }) => <div className="mb-2 last:mb-0">{children}</div>,
          // Handle bullet points consistently
          ul: ({ children }) => <ul className="space-y-1">{children}</ul>,
          li: ({ children }) => <li className="flex items-start gap-1">{children}</li>,
          // Preserve bold/italic formatting with stronger styling
          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  )
}
