import { logger } from "@/lib/logger"
import { useEffect, useState } from "react"

interface ApiCallStats {
  recentCallsCount: number
  lastCallTime: string | null
  isRateLimited: boolean
  timeToReset: number
}

/**
 * Debug component to monitor API call frequency
 * Shows stats about /chat/recent endpoint calls
 */
export function ApiCallMonitor() {
  const [stats, setStats] = useState<ApiCallStats>({
    recentCallsCount: 0,
    lastCallTime: null,
    isRateLimited: false,
    timeToReset: 0,
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if we're in development mode
    const isDev =
      import.meta.env.DEV || window.location.hostname === "localhost"
    if (!isDev) return

    let callCount = 0
    let lastCall: Date | null = null
    const startTime = Date.now()

    // Intercept fetch calls to monitor API usage
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const [url] = args

      if (typeof url === "string" && url.includes("/chat/recent")) {
        callCount++
        lastCall = new Date()

        logger.info(`📊 API Monitor: /chat/recent call #${callCount}`)

        setStats((prev) => ({
          ...prev,
          recentCallsCount: callCount,
          lastCallTime: lastCall?.toLocaleTimeString() || null,
        }))
      }

      try {
        const response = await originalFetch(...args)

        // Check for rate limit response
        if (
          response.status === 429 &&
          typeof url === "string" &&
          url.includes("/chat/recent")
        ) {
          const data = await response.clone().json()
          setStats((prev) => ({
            ...prev,
            isRateLimited: true,
            timeToReset: data.retryAfter || 0,
          }))
        }

        return response
      } catch (error) {
        return originalFetch(...args)
      }
    }

    // Update stats every second
    const interval = setInterval(() => {
      const now = Date.now()
      const minutesRunning = (now - startTime) / 60000
      const callsPerMinute = minutesRunning > 0 ? callCount / minutesRunning : 0

      setStats((prev) => ({
        ...prev,
        timeToReset: Math.max(0, prev.timeToReset - 1),
      }))

      // Log warning if too many calls
      if (callsPerMinute > 10) {
        logger.warn(
          `⚠️ High API call frequency: ${callsPerMinute.toFixed(
            1
          )} calls/min to /chat/recent`
        )
      }
    }, 1000)

    // Cleanup
    return () => {
      clearInterval(interval)
      window.fetch = originalFetch
    }
  }, [])

  // Show only in development
  if (!import.meta.env.DEV && window.location.hostname !== "localhost") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs shadow-lg hover:bg-blue-600"
        >
          📊 API Stats
        </button>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">API Call Monitor</h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-1">
            <div>
              <span className="font-medium">Recent calls:</span>{" "}
              {stats.recentCallsCount}
            </div>
            <div>
              <span className="font-medium">Last call:</span>{" "}
              {stats.lastCallTime || "None"}
            </div>
            {stats.isRateLimited && (
              <div className="text-red-600">
                <span className="font-medium">⚠️ Rate limited!</span>
                <br />
                Reset in: {stats.timeToReset}s
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200 text-gray-600">
            Monitoring /chat/recent calls
          </div>
        </div>
      )}
    </div>
  )
}
