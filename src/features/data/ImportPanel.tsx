import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Button, Card, inputClass } from '../../app/ui'
import { useNow } from '../../app/useNow'
import { useGameData } from '../../app/useGameData'
import { formatIlvl } from '../../engine/ilvl'
import { decodeShare, ShareCodeError, type SharePayload } from '../../share/codec'
import { applyImport, currentTickCount } from '../../share/transfer'
import { useRoster } from '../../store/roster'

type Decoded = { payload: SharePayload } | { error: string } | null

export function ImportPanel({ initialCode = '' }: { initialCode?: string }) {
  const [input, setInput] = useState(initialCode)
  const [done, setDone] = useState<string | null>(null)
  const existing = useRoster((s) => s.characters.length)
  const data = useGameData()
  const now = useNow()

  const decoded = useMemo((): Decoded => {
    if (!input.trim()) return null
    try {
      return { payload: decodeShare(input) }
    } catch (e) {
      return { error: e instanceof ShareCodeError ? e.message : 'That code couldn’t be read.' }
    }
  }, [input])

  const run = (mode: 'replace' | 'merge') => {
    if (!decoded || !('payload' in decoded)) return
    if (mode === 'replace' && existing > 0 && !confirm(`Replace your ${existing} characters with the imported roster?`)) return
    applyImport(decoded.payload, mode, now, data)
    setDone(`Imported ${decoded.payload.characters.length} characters.`)
    setInput('')
  }

  if (done) {
    return (
      <Card className="text-sm">
        <p className="text-good">{done}</p>
        <p className="mt-1 text-muted">
          See them on the{' '}
          <Link to="/roster" className="text-accent hover:underline">
            Roster
          </Link>{' '}
          and{' '}
          <Link to="/planner" className="text-accent hover:underline">
            Planner
          </Link>
          .
        </p>
      </Card>
    )
  }

  const payload = decoded && 'payload' in decoded ? decoded.payload : null
  const ticks = payload ? currentTickCount(payload, now) : 0
  const staleTicks = payload?.checklist && ticks === 0

  return (
    <Card className="flex flex-col gap-3 text-sm">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="Paste a share code or link"
        className={`${inputClass} font-mono text-xs break-all`} aria-label="Import code" />
      {decoded && 'error' in decoded && <p className="text-warn">{decoded.error}</p>}

      {payload && (
        <>
          <ul className="divide-y divide-border rounded-md border border-border">
            {payload.characters.map((c, i) => (
              <li key={i} className="flex justify-between gap-2 px-3 py-1.5">
                <span>
                  {c.name} <span className="text-muted">{c.className}</span>
                </span>
                <span className="tabular-nums text-muted">{formatIlvl(c.ilvl)}</span>
              </li>
            ))}
          </ul>
          {ticks > 0 && <p className="text-muted">Includes {ticks} checklist ticks from the current reset.</p>}
          {staleTicks && <p className="text-muted">Its checklist ticks are from an earlier reset and won’t be imported.</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => run('replace')}>
              {existing ? 'Replace my roster' : 'Import'}
            </Button>
            {existing > 0 && (
              <Button onClick={() => run('merge')} title="Updates characters with the same name and adds the rest">
                Merge into my roster
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
