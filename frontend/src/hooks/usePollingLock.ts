import { logger } from "@/lib/logger"
import { useEffect, useRef, useState } from "react"

/**
 * Hook to detect and BLOCK multiple tabs
 * Only ONE tab can use the chat page at a time
 * Returns { isBlocked: boolean, hasLock: boolean }
 */
export function useTabBlock(lockKey: string = "chat-tab-lock") {
  // Start as true - optimistic, assume we have lock until proven otherwise
  const [hasLock, setHasLock] = useState(true)
  const tabId = useRef(`tab-${Date.now()}-${Math.random()}`)
  const lockCheckInterval = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const checkAndBlock = () => {
      const currentLock = localStorage.getItem(lockKey)
      const now = Date.now()

      if (!currentLock) {
        // No lock exists, we're the first tab
        const lockData = JSON.stringify({
          tabId: tabId.current,
          timestamp: now,
        })
        localStorage.setItem(lockKey, lockData)
        setHasLock(true)
        logger.info("✅ First tab - acquired lock", { tabId: tabId.current })
        return
      }

      try {
        const lock = JSON.parse(currentLock)

        // If we own the lock, just refresh timestamp
        if (lock.tabId === tabId.current) {
          const lockData = JSON.stringify({
            tabId: tabId.current,
            timestamp: now,
          })
          localStorage.setItem(lockKey, lockData)
          setHasLock(true)
          return
        }

        // Check if lock is stale (tab closed without cleanup) - reduced to 5 seconds
        if (now - lock.timestamp > 5000) {
          logger.info("🔓 Stale lock detected, taking over", {
            oldTabId: lock.tabId,
            tabId: tabId.current,
          })
          const lockData = JSON.stringify({
            tabId: tabId.current,
            timestamp: now,
          })
          localStorage.setItem(lockKey, lockData)
          setHasLock(true)
          return
        }

        // Another active tab exists - BLOCK THIS TAB
        logger.error("🚫 TAB BLOCKED - Another tab is active", {
          thisTab: tabId.current,
          activeTab: lock.tabId,
        })
        setHasLock(false)
      } catch (e) {
        logger.error("Error parsing lock", e)
        // On error, clear the lock and take control
        localStorage.removeItem(lockKey)
        setHasLock(true)
      }
    }

    // Check immediately
    checkAndBlock()

    // Check every 3 seconds (aligned with polling interval)
    lockCheckInterval.current = setInterval(checkAndBlock, 3000)

    // Cleanup on unmount
    return () => {
      if (lockCheckInterval.current) {
        clearInterval(lockCheckInterval.current)
      }
      // Release our lock if we have it
      const currentLock = localStorage.getItem(lockKey)
      if (currentLock) {
        try {
          const lock = JSON.parse(currentLock)
          if (lock.tabId === tabId.current) {
            localStorage.removeItem(lockKey)
            logger.info("🔓 Released tab lock", { tabId: tabId.current })
          }
        } catch (e) {
          logger.error("Error releasing lock", e)
        }
      }
    }
  }, [lockKey])

  return { isBlocked: !hasLock, hasLock }
}
