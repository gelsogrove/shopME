import { Edit, Eye } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Textarea } from "./textarea"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  minHeight?: string
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  minHeight = "400px",
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("edit")

  return (
    <div className={`rounded-md border ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Modifica</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>Anteprima</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="p-0 mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-0 rounded-none focus-visible:ring-0 min-h-[400px] resize-none"
            style={{ minHeight }}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="p-4 mt-0 prose max-w-none markdown-content" style={{ minHeight }}>
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nessun contenuto da visualizzare...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface MarkdownViewProps {
  content: string
  className?: string
}

export function MarkdownView({ content, className = "" }: MarkdownViewProps) {
  return (
    <div className={`prose max-w-none markdown-content ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
} 