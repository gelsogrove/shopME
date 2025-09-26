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
    chat: "leading-tight compact-message", // 🎯 AGGIUNTA classe per debug
    compact: "whitespace-pre-line leading-normal",
  }

  // 🎯 COMPACT SPACING FOR CHAT (seguendo il prompt: NO spazi extra)
  const isCompactChat = variant === "chat"

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
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
          // Clean paragraph rendering - ULTRA COMPATTO per chat
          p: ({ children }) => (
            <p className={isCompactChat ? "mb-0 last:mb-0" : "mb-2 last:mb-0"}>
              {children}
            </p>
          ),
          // Proper list rendering - ULTRA COMPATTO per chat
          ul: ({ children }) => (
            <ul
              className={`list-none ${
                isCompactChat ? "space-y-0 my-0" : "space-y-1 my-2"
              }`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal ${
                isCompactChat ? "space-y-0 my-0 pl-4" : "space-y-1 my-2 pl-6"
              }`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-left">{children}</li>,
          // Headers - ULTRA COMPATTI per chat
          h1: ({ children }) => (
            <h1
              className={`text-lg font-bold ${
                isCompactChat ? "mb-0 mt-1" : "mb-2"
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-base font-bold ${
                isCompactChat ? "mb-0 mt-1" : "mb-2"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-sm font-bold ${
                isCompactChat ? "mb-0 mt-0.5" : "mb-1"
              }`}
            >
              {children}
            </h3>
          ),
          // Text formatting
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
