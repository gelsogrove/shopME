import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api } from "@/services/api"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
      const response = await api.post("/auth/login", { email, password })
      const data = response.data

      // Store the token and user info
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect to workspace selection page after successful login
      navigate("/workspace-selection")
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
