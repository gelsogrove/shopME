import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MarkdownEditor from "@/components/ui/markdown-editor"
import { Switch } from "@/components/ui/switch"

interface Agent {
  id: string
  name: string
  content: string
  isRouter?: boolean
  department?: string
  temperature?: number
  top_p?: number
  top_k?: number
}

interface AgentSheetProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  departments: Array<{ value: string; label: string }>
}

export function AgentSheet({
  agent,
  open,
  onOpenChange,
  onSubmit,
  departments,
}: AgentSheetProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(e)
    onOpenChange(false)
  }

  const isEdit = !!agent
  const isRouterDefault = isEdit ? agent.isRouter : false
  const departmentDefault = isEdit ? agent.department : ""

  if (!open) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full inset-y-0 right-0 absolute w-[70%] flex flex-col p-0">
        <DrawerHeader className="px-6 pt-6 pb-2">
          <DrawerTitle>{agent ? "Edit Agent" : "Add Agent"}</DrawerTitle>
          <DrawerDescription>
            {agent
              ? "Make changes to your agent here"
              : "Add a new agent to your workspace"}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="overflow-y-auto px-6 flex-grow">
            <div className="space-y-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={agent?.name}
                    placeholder="Agent name"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    defaultValue={departmentDefault}
                    disabled={isRouterDefault}
                    placeholder="e.g. ORDERS, PRODUCTS, TRANSPORT, etc."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border rounded-md p-3">
                <div className="flex flex-col">
                  <Label htmlFor="isRouter">Router Agent</Label>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    A router agent dispatches requests to other specialized
                    agents. Only one router can be active at a time.
                  </p>
                </div>
                <Switch
                  id="isRouter"
                  name="isRouter"
                  defaultChecked={isRouterDefault}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Temperature:{" "}
                    <span className="font-bold">
                      {agent?.temperature || 0.3}
                    </span>
                    <InfoTooltip content={
                      <div>
                        <p><strong>Temperature</strong> controls the randomness of the AI's responses.</p>
                        <p className="mt-1"><strong>Lower values (0.1-0.3):</strong> More focused, deterministic, and consistent responses.</p>
                        <p className="mt-1"><strong>Higher values (0.7-1.0):</strong> More creative, diverse, and unpredictable responses.</p>
                        <p className="mt-1"><strong>Example:</strong> Use low temperature for factual responses and higher for creative writing.</p>
                      </div>
                    } />
                  </Label>
                  <Input
                    type="range"
                    id="temperature"
                    name="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue={agent?.temperature || 0.3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls creativity (0-2)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top_p">
                    Top P:{" "}
                    <span className="font-bold">{agent?.top_p || 0.95}</span>
                    <InfoTooltip content={
                      <div>
                        <p><strong>Top P (Nucleus Sampling)</strong> controls diversity by selecting from tokens whose cumulative probability exceeds the top_p value.</p>
                        <p className="mt-1"><strong>Lower values (0.1-0.5):</strong> More focused on highly probable tokens.</p>
                        <p className="mt-1"><strong>Higher values (0.7-1.0):</strong> Considers a wider range of tokens, increasing diversity.</p>
                        <p className="mt-1"><strong>Example:</strong> A value of 0.9 means the AI will only consider tokens that make up the top 90% of probability mass.</p>
                      </div>
                    } />
                  </Label>
                  <Input
                    type="range"
                    id="top_p"
                    name="top_p"
                    min="0"
                    max="1"
                    step="0.05"
                    defaultValue={agent?.top_p || 0.95}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls diversity (0-1)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top_k">
                    Top K:{" "}
                    <span className="font-bold">{agent?.top_k || 40}</span>
                    <InfoTooltip content={
                      <div>
                        <p><strong>Top K</strong> limits the model to consider only the top K most likely tokens at each step.</p>
                        <p className="mt-1"><strong>Lower values (5-20):</strong> More focused and conservative responses.</p>
                        <p className="mt-1"><strong>Higher values (40-100):</strong> Considers more options, potentially more creative.</p>
                        <p className="mt-1"><strong>Example:</strong> A value of 40 means the AI will only consider the 40 most likely next tokens at each step.</p>
                      </div>
                    } />
                  </Label>
                  <Input
                    type="range"
                    id="top_k"
                    name="top_k"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={agent?.top_k || 40}
                  />
                  <p className="text-xs text-muted-foreground">
                    Limits word selection (0-100)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Instructions</Label>
                <div className="min-h-[300px]">
                  <MarkdownEditor
                    value={agent?.content || ""}
                    onChange={(value) => {
                      const hiddenInput = document.getElementById(
                        "content-input"
                      ) as HTMLInputElement
                      if (hiddenInput) {
                        hiddenInput.value = value
                      }
                    }}
                    name="content"
                    minHeight="300px"
                  />
                  <input type="hidden" name="content" id="content-input" />
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-input hover:bg-accent"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {agent ? "Save Changes" : "Create Agent"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
