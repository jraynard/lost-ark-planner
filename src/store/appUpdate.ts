import { create } from 'zustand'

export type CheckStatus = 'idle' | 'checking' | 'up-to-date' | 'error'

interface AppUpdateState {
  /** Build id of a newer deploy, once one is spotted. */
  available: string | null
  /** Build id the user chose not to reload for; asked again only for a later one. */
  dismissed: string | null
  status: CheckStatus
  lastChecked: number | null
  check: (fetcher?: () => Promise<unknown>) => Promise<void>
  dismiss: () => void
}

const fetchVersion = async (): Promise<unknown> => {
  // Relative to the page, so it works on the custom domain and the github.io sub-path.
  const res = await fetch('./version.json', { cache: 'no-store' })
  if (!res.ok) throw new Error(`version.json: ${res.status}`)
  return res.json()
}

export const useAppUpdate = create<AppUpdateState>()((set, get) => ({
  available: null,
  dismissed: null,
  status: 'idle',
  lastChecked: null,
  check: async (fetcher = fetchVersion) => {
    if (get().status === 'checking') return
    set({ status: 'checking' })
    try {
      const json = (await fetcher()) as { buildId?: unknown }
      const remote = typeof json?.buildId === 'string' ? json.buildId : null
      if (!remote) throw new Error('No buildId')
      set({ status: 'up-to-date', lastChecked: Date.now(), available: remote !== __BUILD_ID__ ? remote : null })
    } catch {
      set({ status: 'error', lastChecked: Date.now() })
    }
  },
  dismiss: () => set((s) => ({ dismissed: s.available })),
}))
