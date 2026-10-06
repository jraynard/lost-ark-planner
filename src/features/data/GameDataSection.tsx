import { Button, Card } from '../../app/ui'
import { useGameData } from '../../app/useGameData'
import { bundledGameData } from '../../data/game'
import { useGameDataStore, type CheckStatus } from '../../store/gameData'

const statusText: Record<CheckStatus, string> = {
  idle: '',
  checking: 'Checking…',
  'up-to-date': 'Up to date.',
  error: 'Couldn’t reach the published data. Using the copy you have.',
  'needs-app-update': 'A newer data version needs a newer app version.',
}

export function GameDataSection() {
  const data = useGameData()
  const { status, lastChecked, pending, check } = useGameDataStore()
  const notes = data.changelog.find((c) => c.version === data.version)?.notes ?? []

  return (
    <Card className="flex flex-col gap-3 text-sm">
      <div>
        <div className="font-medium">
          Game data v{data.version} <span className="font-normal text-muted">published {data.publishedAt}</span>
        </div>
        <div className="text-xs text-muted">
          {data === bundledGameData ? 'Shipped with the app' : 'Updated from the published file'}
          {lastChecked && ` · last checked ${new Date(lastChecked).toLocaleString()}`}
        </div>
      </div>
      {notes.length > 0 && (
        <ul className="list-disc pl-5 text-muted">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void check()} disabled={status === 'checking'}>
          Check for updates
        </Button>
        <span className={status === 'error' || status === 'needs-app-update' ? 'text-warn' : 'text-muted'}>
          {pending ? `Version ${pending.version} is available; see the banner above.` : statusText[status]}
        </span>
      </div>
    </Card>
  )
}
