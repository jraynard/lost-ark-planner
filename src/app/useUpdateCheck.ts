import { useEffect } from 'react'
import { useAppUpdate } from '../store/appUpdate'

const INTERVAL = 30 * 60 * 1000
const ON_FOCUS_AFTER = 5 * 60 * 1000

/**
 * Looks for a newer deploy every 30 minutes, and when the tab comes back into view after
 * 5 minutes away. Off in dev, where there's no version.json.
 */
export function useUpdateCheck(enabled = import.meta.env.PROD) {
  const check = useAppUpdate((s) => s.check)
  useEffect(() => {
    if (!enabled) return
    void check()
    const id = setInterval(() => void check(), INTERVAL)
    const onVisible = () => {
      const last = useAppUpdate.getState().lastChecked ?? 0
      if (document.visibilityState === 'visible' && Date.now() - last > ON_FOCUS_AFTER) void check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [check, enabled])
}
