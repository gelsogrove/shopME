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

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
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
          // Clean paragraph rendering
          p: ({ children }) => (
            <p className="mb-2 last:mb-0">
              {children}
            </p>
          ),
          // Proper list rendering
          ul: ({ children }) => (
            <ul className="list-none space-y-1 my-2">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-left">
              {children}
            </li>
          ),
          // Headers
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mb-1">{children}</h3>
          ),
          // Text formatting
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
