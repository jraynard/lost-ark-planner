import { useAppUpdate } from '../store/appUpdate'
import { Button } from './ui'

export function UpdateBanner() {
  const { available, dismissed, dismiss } = useAppUpdate()
  if (!available || available === dismissed) return null

  return (
    <div role="alert" className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
      <span className="flex-1">
        <span className="font-semibold text-accent-strong">A new version of the planner is available.</span>{' '}
        <span className="text-muted">Reload to get the latest app and game data. Your roster and checklist are kept.</span>
      </span>
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => location.reload()}>
          Reload
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          Later
        </Button>
      </div>
    </div>
  )
}
