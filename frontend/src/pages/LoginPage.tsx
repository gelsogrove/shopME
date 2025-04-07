import { Lock, Mail, MessageCircle } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"

export function LoginPage() {
  const [email, setEmail] = useState("admin@shop.me")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [isResetMode, setIsResetMode] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isResetMode) {
      // In a real app, this would trigger a password reset email
      alert("Password reset link has been sent to your email")
      setIsResetMode(false)
      return
    }

    // Make API call to /api/auth/login
    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid credentials")
        }
        return response.json()
      })
      .then((data) => {
        // Store the token
        localStorage.setItem("token", data.token)
        // Redirect to workspace selection
        navigate("/workspace-selection")
      })
      .catch((error) => {
        setError("Invalid email or password")
      })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="p-8 w-full max-w-md bg-white shadow-xl rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isResetMode ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-gray-600">
              {isResetMode
                ? "Enter your email to reset your password"
                : "Sign in to your account or create a new one"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10"
                  required
                />
              </div>

              {!isResetMode && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    required
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              >
                Login
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full border-input hover:bg-accent py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetMode(!isResetMode)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {isResetMode ? "Back to Login" : "Forgot Password?"}
              </button>
            </div>
          </form>
        </Card>
      </div>

      {/* Right side - Chat Illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-50 to-blue-50 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2">
            <div className="bg-blue-500 rounded-2xl p-4 shadow-xl max-w-[240px] animate-float-slow backdrop-blur-sm border border-blue-400">
              <p className="text-white font-medium">
                Welcome to our WhatsApp Business Platform! How can we help grow
                your business today?
              </p>
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 mt-8">
            <div className="bg-green-600 rounded-2xl p-4 shadow-xl max-w-[280px] animate-float backdrop-blur-sm border border-input">
              <p className="text-white font-medium">
                I'm interested in automating my customer service and increasing
                sales through WhatsApp.
              </p>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 mt-12">
            <div className="bg-white rounded-2xl p-4 shadow-xl max-w-[260px] animate-float-slow backdrop-blur-sm border border-gray-100">
              <p className="text-gray-700 font-medium">
                Perfect! Our platform offers automated responses, sales
                tracking, and customer engagement tools. Let me show you how it
                works 🚀
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Communicate with WhatsApp
                </h2>
                <p className="text-green-600 font-medium">NEW</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg font-medium">
              Talk to your customers, manage chats, and boost sales with ease!
            </p>
            <div className="mt-6">
              <p className="text-2xl font-bold text-green-600">FREE</p>
              <p className="text-gray-700">for 6 months</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center font-medium">
            Limited time offer, terms and conditions apply
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
          <div className="absolute top-20 right-12 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-75" />
          <div className="absolute bottom-10 left-1/4 w-3 h-3 bg-green-300 rounded-full animate-pulse delay-150" />
          <div className="absolute bottom-20 right-1/4 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-300" />
        </div>
      </div>
    </div>
  )
}
