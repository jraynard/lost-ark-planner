import { useEffect } from 'react'
import { useGameDataStore } from '../store/gameData'

const SIX_HOURS = 6 * 60 * 60 * 1000

/** Checks for published game data on start and every 6 hours while the app is open. */
export function useAutoUpdateCheck() {
  const check = useGameDataStore((s) => s.check)
  useEffect(() => {
    void check()
    const id = setInterval(() => void check(), SIX_HOURS)
    return () => clearInterval(id)
  }, [check])
}
