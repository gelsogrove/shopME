interface AuthLogoProps {
  className?: string
}

export function AuthLogo({ className = "" }: AuthLogoProps) {
  return (
    <div className="absolute right-8 top-8 z-50">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
        <img
          src="/logo.png"
          alt="Logo"
          className="w-full h-full relative z-10 opacity-90 hover:opacity-100 transition-all duration-300 hover:scale-110"
        />
      </div>
    </div>
  )
}
