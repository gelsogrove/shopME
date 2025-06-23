import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AuthLogo from "@/components/ui/auth-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { auth } from "../services/api"

export function LoginPage() {
  // Prefill credentials only in development
  const isDev = import.meta.env.MODE === "development"
  const [email, setEmail] = useState(isDev ? "admin@shopme.com" : "")
  const [password, setPassword] = useState(isDev ? "Venezia44" : "")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Pulisci la sessionStorage prima del login
    sessionStorage.removeItem("currentWorkspace")
    localStorage.removeItem("user")

    try {
      // Usa await esplicitamente e salva la risposta
      const response = await auth.login({ email, password })

      if (response.data && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user))
        toast.success("Login successful!")

        setTimeout(() => {
          navigate("/workspace-selection")
        }, 300)
      } else {
        throw new Error("Invalid response format from the server.")
      }
    } catch (err: any) {
      console.error("Login error:", err)

      // Mostra messaggio di errore dettagliato
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials."

      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <AuthLogo />
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your workspace
            </p>
          </div>

            {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-white p-12">
          <h2 className="mt-6 text-4xl font-bold tracking-tight">Conversational E-commerce, Reimagined</h2>
          <p className="mt-4 text-lg text-gray-300 max-w-xl text-center">
            Power your business with an AI-driven sales agent that understands, assists, and sells, directly on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
