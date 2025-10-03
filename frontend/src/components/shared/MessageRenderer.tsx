import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageRendererProps {
  content: string
  className?: string
  variant?: "chat" | "compact"
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
    chat: "leading-tight",
    compact: "leading-normal",
  }

  // 🚀 SOLUZIONE SEMPLICE: Converti \n in <br> per rispettare gli a capo
  const formatContent = (text: string): string => {
    const result = text
      .replace(/\n/g, "<br />") // Converti tutti i \n in <br />
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Converti **text** in <strong>
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Converti *text* in <em>
      .replace(/~~(.*?)~~/g, '<s style="text-decoration: line-through;">$1</s>') // Converti ~~text~~ in testo barrato
      .replace(/→\s*(€[\d.,]+)/g, "→ <strong>$1</strong>") // Converti prezzo finale dopo → in grassetto
      // 🔧 FIX: Rimuovi punteggiatura dai link prima di convertirli
      .replace(/(https?:\/\/[^\s.,!?;:]+)[.,!?;:]+(\s|$)/g, "$1$2") // Rimuovi punteggiatura HTTPS/HTTP
      .replace(
        /(http:\/\/localhost:300[01]\/s\/[a-zA-Z0-9]+)[.,!?;:]+(\s|$)/g,
        "$1$2"
      ) // Rimuovi punteggiatura localhost
      // 🎯 CONVERSIONE LINK MARKDOWN [testo](url) → HTML <a>
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      )
      // 🎯 CONVERSIONE SPECIFICA per i nostri short URLs localhost
      .replace(
        /(http:\/\/localhost:300[01]\/s\/[a-zA-Z0-9]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      )
      // 🔧 CONVERSIONE GENERALE per tutti gli altri URL (ESCLUSI localhost che sono già processati)
      .replace(
        /(https?:\/\/(?!localhost)[^\s.,!?;:]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      )

    // Debug: mostra il risultato della conversione

    return result
  }

  // Se è chat, usa HTML diretto invece di markdown per rispettare gli a capo
  if (variant === "chat") {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    )
  }

  // Per altre varianti, usa ReactMarkdown
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
          // Clean paragraph rendering
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          // Text formatting
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          // Strikethrough support for ~~text~~
          del: ({ children }) => (
            <s style={{ textDecoration: "line-through" }}>{children}</s>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
