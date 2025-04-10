import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../services/api"
import type { Workspace } from "../services/workspaceApi"
import { createWorkspace } from "../services/workspaceApi"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await api.post("/api/auth/login", { email, password })
      const data = response.data

      // Store only the user info, token is in HTTP-only cookie
      localStorage.setItem("user", JSON.stringify(data.user))

      try {
        // Try to fetch user's workspaces
        const workspacesResponse = await api.get("/api/workspaces")
        const workspaces = workspacesResponse.data
        
        if (workspaces && workspaces.length > 0) {
          // Set the first workspace as the default one
          const defaultWorkspace = workspaces.find((w: Workspace) => !w.isDelete) || workspaces[0]
          sessionStorage.setItem("currentWorkspaceId", defaultWorkspace.id)
          sessionStorage.setItem("currentWorkspaceName", defaultWorkspace.name)
          
          // Redirect to dashboard
          navigate("/dashboard")
        } else {
          // No workspaces found, create a default one
          console.log("No workspaces found, creating a default one...")
          try {
            const newWorkspace = await createWorkspace({
              name: "My Shop",
              description: "Default shop",
              language: "en",
              currency: "EUR",
              isActive: true
            })
            
            console.log("Default workspace created:", newWorkspace)
            
            // Set the new workspace as current
            sessionStorage.setItem("currentWorkspaceId", newWorkspace.id)
            sessionStorage.setItem("currentWorkspaceName", newWorkspace.name)
            
            // Redirect to dashboard
            navigate("/dashboard")
          } catch (createError) {
            console.error("Could not create default workspace:", createError)
            navigate("/workspace-selection")
          }
        }
      } catch (workspaceError) {
        console.error("Could not fetch workspaces:", workspaceError)
        // In case of error, redirect to workspace selection
        navigate("/workspace-selection")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shop.me"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-green-500 py-2 text-white hover:bg-green-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
            <div className="flex justify-between text-sm">
              <a
                href="/auth/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </a>
              <a href="/auth/signup" className="text-blue-500 hover:underline">
                Create Account
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
