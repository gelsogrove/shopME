import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../services/api"

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
      const response = await auth.login({ email, password })
      
      // Store user info in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user))

      // Navigate to workspace selection or dashboard
      navigate("/workspace-selection")
    } catch (err: any) {
      console.error('Login error:', err.response?.data)
      setError(err.response?.data?.error || err.response?.data?.message || "Login failed. Please check your credentials.")
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
                placeholder="admin@shopme.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
                disabled={isLoading}
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-green-500 py-2 text-white hover:bg-green-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
