import { useWorkspace } from "@/hooks/use-workspace"
import { api } from "@/services/api"
import { useState } from "react"

export function ChatTestPage() {
  const { workspace } = useWorkspace()
  const [testMessage, setTestMessage] = useState("")
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult("")
    
    try {
      console.log("🧪 TEST: Starting chat send test")
      
      // Test 1: Check workspace
      console.log("🧪 TEST 1: Workspace check", {
        workspace: workspace,
        workspaceId: workspace?.id,
        sessionStorage: sessionStorage.getItem("currentWorkspace")
      })
      
      if (!workspace?.id) {
        setTestResult("❌ FAIL: No workspace ID found")
        return
      }
      
      // Test 2: Check sessionStorage
      const storedWorkspace = sessionStorage.getItem("currentWorkspace")
      console.log("🧪 TEST 2: SessionStorage check", storedWorkspace)
      
      // Test 3: Manual API call with detailed logging
      const sessionId = "test-session-123"
      const headers = {
        'Content-Type': 'application/json',
        'x-workspace-id': workspace.id
      }
      
      console.log("🧪 TEST 3: Making API call", {
        url: `/chat/${sessionId}/send`,
        method: 'POST',
        headers,
        data: {
          content: testMessage || "Test message from debug page",
          sender: "user"
        }
      })
      
      const response = await api.post(`/chat/${sessionId}/send`, {
        content: testMessage || "Test message from debug page",
        sender: "user"
      }, { headers })
      
      console.log("🧪 TEST 3: Success!", response)
      setTestResult(`✅ SUCCESS: ${JSON.stringify(response.data, null, 2)}`)
      
    } catch (error: any) {
      console.error("🧪 TEST: Error", error)
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      }
      setTestResult(`❌ ERROR: ${JSON.stringify(errorDetails, null, 2)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chat API Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Message:</label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message (optional)"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div>
          <button
            onClick={runTest}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? "Testing..." : "Run API Test"}
          </button>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Current Workspace Info:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              workspace: workspace,
              sessionStorage: sessionStorage.getItem("currentWorkspace")
            }, null, 2)}
          </pre>
        </div>
        
        {testResult && (
          <div>
            <h3 className="font-medium mb-2">Test Result:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
