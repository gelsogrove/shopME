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
  variant = "chat",
}: MessageRendererProps) {
  // Base classes for consistent formatting
  const baseClasses = "break-words text-sm text-left"

  // Variant-specific classes
  const variantClasses = {
    modal: "whitespace-pre-line block leading-relaxed",
    chat: "whitespace-pre-line leading-relaxed",
    compact: "whitespace-pre-line leading-normal",
  }

  // Inline styles for text formatting without hyphenation issues
  const textStyle = {
    textAlign: "left" as const,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "normal" as const,
    textJustify: "none" as const,
    maxWidth: "100%",
    direction: "ltr" as const,
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
          // Preserve WhatsApp-style formatting with better spacing
          p: ({ children }) => (
            <div
              className="mb-3 last:mb-0 leading-relaxed"
              style={{ textAlign: "left", direction: "ltr" }}
            >
              {children}
            </div>
          ),
          // Handle bullet points consistently with better emoji spacing
          ul: ({ children }) => <ul className="space-y-2 my-2">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-center gap-2 leading-relaxed py-1">
              {children}
            </li>
          ),
          // Preserve bold/italic formatting with stronger styling
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  )
}
