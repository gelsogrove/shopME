import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AuthLogo from "@/components/ui/auth-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, MessageSquare, ShoppingCart, Zap, Globe } from "lucide-react"
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
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center py-12 px-4 lg:px-8">
        <div className="mx-auto w-full max-w-[400px] space-y-6">
          <div className="space-y-4 text-center">
            <AuthLogo />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
              <p className="text-balance text-muted-foreground">
                Enter your credentials to access your workspace
              </p>
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            
            {/* Forgot Password Link - Better positioned */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Enhanced Visual Design */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800"></div>
        
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white/15 rounded-lg rotate-12"></div>
            <div className="absolute bottom-32 left-16 w-40 h-40 border border-white/10 rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-28 h-28 border border-white/20 rounded-lg -rotate-12"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-white p-12">
          {/* Main Logo/Icon */}
          <div className="mb-8 p-4 bg-white/10 rounded-full backdrop-blur-sm">
            <MessageSquare className="w-16 h-16 text-white" />
          </div>
          
          {/* Main Heading */}
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-center mb-6">
            Conversational E-commerce,
            <span className="block text-blue-200">Reimagined</span>
          </h2>
          
          {/* Description */}
          <p className="text-lg text-blue-100 max-w-xl text-center mb-12 leading-relaxed">
            Power your business with an AI-driven sales agent that understands, assists, and sells, directly on WhatsApp.
          </p>
          
          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-8 max-w-sm">
            <div className="flex flex-col items-center space-y-3 group">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-100 text-center">Smart Sales</span>
            </div>
            <div className="flex flex-col items-center space-y-3 group">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-100 text-center">AI Powered</span>
            </div>
            <div className="flex flex-col items-center space-y-3 group">
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-100 text-center">Global Reach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
