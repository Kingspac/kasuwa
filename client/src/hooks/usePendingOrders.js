import { useEffect, useState } from 'react'
import { api } from '../api'

// Counts pending orders for the admin badge. It checks when the page changes,
// every 30 seconds, and when you come back to the tab.
export default function usePendingOrders(enabled, pathname) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    const check = () => {
      if (document.hidden) return
      api
        .adminStats()
        .then((s) => !cancelled && setCount(s.statusCounts.pending))
        .catch(() => {})
    }

    check()
    const id = setInterval(check, 30000)
    document.addEventListener('visibilitychange', check)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [enabled, pathname])

  return enabled ? count : 0
}
