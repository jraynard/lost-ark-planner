import { diffGameData } from '../data/remote'
import { useGameDataStore } from '../store/gameData'
import { Button } from './ui'
import { useGameData } from './useGameData'

export function UpdateBanner() {
  const { pending, accept, later, skip } = useGameDataStore()
  const active = useGameData()
  if (!pending) return null

  const changes = diffGameData(active, pending)
  const notes = pending.changelog.filter((c) => c.version > active.version).flatMap((c) => c.notes)

  return (
    <div role="alert" className="mb-6 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
      <div className="font-semibold text-accent-strong">
        Game data update available (v{pending.version}, {pending.publishedAt})
      </div>
      {notes.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {changes.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-muted hover:text-text">{changes.length} changes</summary>
          <ul className="mt-1 list-disc pl-5 text-muted">
            {changes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={accept}>
          Update
        </Button>
        <Button onClick={later}>Later</Button>
        <Button variant="ghost" onClick={skip}>
          Skip this version
        </Button>
      </div>
    </div>
  )
}
