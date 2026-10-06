import { Button, Card } from '../../app/ui'
import { useGameData } from '../../app/useGameData'
import { useAppUpdate, type CheckStatus } from '../../store/appUpdate'

const statusText: Record<CheckStatus, string> = {
  idle: '',
  checking: 'Checking…',
  'up-to-date': 'You have the latest version.',
  error: 'Couldn’t check for a new version.',
}

export function AboutSection() {
  const data = useGameData()
  const { status, available, check } = useAppUpdate()
  const notes = data.changelog.find((c) => c.version === data.version)?.notes ?? []

  return (
    <Card className="flex flex-col gap-3 text-sm">
      <div>
        <div className="font-medium">
          App build <code>{__BUILD_ID__}</code>{' '}
          <span className="font-normal text-muted">{new Date(__BUILT_AT__).toLocaleString()}</span>
        </div>
        <div className="text-xs text-muted">
          Game data v{data.version}, published {data.publishedAt}
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
          Check for a new version
        </Button>
        <span className={status === 'error' ? 'text-warn' : 'text-muted'}>
          {available ? 'A new version is available; reload the page to get it.' : statusText[status]}
        </span>
      </div>
    </Card>
  )
}
