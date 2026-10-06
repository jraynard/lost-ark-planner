import { useState } from 'react'
import { PageHeader } from '../../app/PageHeader'
import { Badge, Button, Card } from '../../app/ui'
import { useGameData } from '../../app/useGameData'
import { formatIlvl } from '../../engine/ilvl'
import type { Character } from '../../engine/types'
import { useRoster } from '../../store/roster'
import { CharacterForm } from './CharacterForm'
import { roleLabels } from './roles'

export function RosterPage() {
  const { characters, add, update, remove, setGoldEarner, loadExample } = useRoster()
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const { goldRules } = useGameData()

  const sorted = [...characters].sort((a, b) => b.ilvl - a.ilvl)
  const earners = characters.filter((c) => c.goldEarner).length
  const overCap = earners > goldRules.goldEarnersPerRoster

  return (
    <>
      <PageHeader title="Roster">Your characters. Gold earners get a weekly raid plan.</PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={() => setEditing('new')} disabled={editing === 'new'}>
          Add character
        </Button>
        {characters.length > 0 && (
          <span className={`text-sm ${overCap ? 'text-warn' : 'text-muted'}`}>
            {earners} / {goldRules.goldEarnersPerRoster} gold earners
            {overCap && `: only ${goldRules.goldEarnersPerRoster} characters per roster can earn raid gold`}
          </span>
        )}
      </div>

      {editing === 'new' && (
        <Card className="mb-4">
          <CharacterForm
            onSave={(draft) => {
              add(draft)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        </Card>
      )}

      {characters.length === 0 && editing !== 'new' && (
        <Card className="text-center">
          <p className="mb-3 text-muted">No characters yet. Add your first one, or load an example roster to look around.</p>
          <Button onClick={loadExample}>Load example roster</Button>
        </Card>
      )}

      <ul className="flex flex-col gap-3">
        {sorted.map((c) =>
          editing === c.id ? (
            <li key={c.id}>
              <Card>
                <CharacterForm
                  initial={c}
                  onSave={(draft) => {
                    update(c.id, draft)
                    setEditing(null)
                  }}
                  onCancel={() => setEditing(null)}
                />
              </Card>
            </li>
          ) : (
            <li key={c.id}>
              <CharacterRow
                character={c}
                onEdit={() => setEditing(c.id)}
                onDelete={() => {
                  if (confirm(`Delete ${c.name}?`)) remove(c.id)
                }}
                onGoldEarner={(v) => setGoldEarner(c.id, v)}
              />
            </li>
          ),
        )}
      </ul>
    </>
  )
}

function CharacterRow({
  character: c,
  onEdit,
  onDelete,
  onGoldEarner,
}: {
  character: Character
  onEdit: () => void
  onDelete: () => void
  onGoldEarner: (v: boolean) => void
}) {
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="min-w-40 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{c.name}</span>
          <Badge tone={c.role === 'main' ? 'accent' : 'muted'}>{roleLabels[c.role]}</Badge>
        </div>
        <div className="text-sm text-muted">{c.className || 'No class set'}</div>
      </div>
      <div className="w-24">
        <div className="text-lg font-semibold tabular-nums text-accent-strong">{formatIlvl(c.ilvl)}</div>
        <div className="text-xs text-muted">{c.gear ? 'from gear' : 'item level'}</div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={c.goldEarner} onChange={(e) => onGoldEarner(e.target.checked)} className="accent-accent" />
        Gold earner
      </label>
      <div className="flex gap-1">
        <Button variant="ghost" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  )
}
