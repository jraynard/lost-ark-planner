import { useState, type FormEvent } from 'react'
import { Button, Field, inputClass } from '../../app/ui'
import { classNames } from '../../data/classes'
import { raidLabel, raids } from '../../data/raids'
import { formatIlvl, GEAR_SLOTS, ilvlFromGear, uniformGear } from '../../engine/ilvl'
import type { CharacterRole, GearLevel, GearSlot } from '../../engine/types'
import type { CharacterDraft } from '../../store/roster'
import { roleLabels } from './roles'

const groupRaids = raids.filter((r) => r.groupOnly)

const emptyDraft: CharacterDraft = {
  name: '',
  className: '',
  ilvl: 0,
  role: 'alt',
  goldEarner: true,
  learnedRaids: [],
}

const clamp = (n: number, max: number) => (Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : 0)

export function CharacterForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: CharacterDraft
  onSave: (draft: CharacterDraft) => void
  onCancel: () => void
}) {
  const start = initial ?? emptyDraft
  const [draft, setDraft] = useState(start)
  const [ilvlText, setIlvlText] = useState(start.ilvl ? String(start.ilvl) : '')
  const [useGear, setUseGear] = useState(Boolean(start.gear))
  const [gear, setGear] = useState<Record<GearSlot, GearLevel>>(start.gear ?? uniformGear(10, 0))

  const patch = (p: Partial<CharacterDraft>) => setDraft((d) => ({ ...d, ...p }))
  const setPiece = (slot: GearSlot, key: keyof GearLevel, value: number) =>
    setGear((g) => ({ ...g, [slot]: { ...g[slot], [key]: clamp(value, key === 'normal' ? 25 : 40) } }))
  const toggleRaid = (id: string) =>
    patch({
      learnedRaids: draft.learnedRaids.includes(id)
        ? draft.learnedRaids.filter((r) => r !== id)
        : [...draft.learnedRaids, id],
    })

  const manualIlvl = Number(ilvlText)
  const ilvl = useGear ? ilvlFromGear(gear) : manualIlvl
  const valid = draft.name.trim() !== '' && Number.isFinite(ilvl) && ilvl > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    onSave({ ...draft, ilvl, gear: useGear ? gear : undefined })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" aria-label="Character">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input className={inputClass} value={draft.name} onChange={(e) => patch({ name: e.target.value })} required autoFocus />
        </Field>
        <Field label="Class">
          <input className={inputClass} list="class-names" value={draft.className} onChange={(e) => patch({ className: e.target.value })} />
          <datalist id="class-names">
            {classNames.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Role">
          <select className={inputClass} value={draft.role} onChange={(e) => patch({ role: e.target.value as CharacterRole })}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-1.5 text-sm">
          <input type="checkbox" checked={draft.goldEarner} onChange={(e) => patch({ goldEarner: e.target.checked })} className="accent-accent" />
          Earns raid gold this week
        </label>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm text-muted">Item level</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={!useGear} onChange={() => setUseGear(false)} className="accent-accent" />
            Enter item level
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={useGear} onChange={() => setUseGear(true)} className="accent-accent" />
            Enter T4 gear per piece
          </label>
        </div>

        {useGear ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[6rem_1fr_1fr] gap-2 text-xs text-muted">
              <span />
              <span>Normal (+)</span>
              <span>Advanced</span>
            </div>
            {GEAR_SLOTS.map((slot) => (
              <div key={slot} className="grid grid-cols-[6rem_1fr_1fr] items-center gap-2">
                <span className="text-sm capitalize">{slot}</span>
                <input aria-label={`${slot} normal`} type="number" min={0} max={25} className={inputClass} value={gear[slot].normal}
                  onChange={(e) => setPiece(slot, 'normal', e.target.valueAsNumber)} />
                <input aria-label={`${slot} advanced`} type="number" min={0} max={40} className={inputClass} value={gear[slot].advanced}
                  onChange={(e) => setPiece(slot, 'advanced', e.target.valueAsNumber)} />
              </div>
            ))}
            <p className="text-sm">
              Item level: <span className="font-semibold text-accent-strong">{formatIlvl(ilvl)}</span>
            </p>
          </div>
        ) : (
          <div className="max-w-40">
            <input aria-label="Item level" type="number" step="0.01" min={0} className={inputClass} value={ilvlText}
              onChange={(e) => setIlvlText(e.target.value)} placeholder="e.g. 1660" />
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm text-muted">Group content you're willing to run (solo modes are always included)</legend>
        <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {groupRaids.map((r) => (
            <label key={r.id} className={`flex items-center gap-2 text-sm ${r.minIlvl > ilvl ? 'text-muted' : ''}`}>
              <input type="checkbox" checked={draft.learnedRaids.includes(r.id)} onChange={() => toggleRaid(r.id)} className="accent-accent" />
              {raidLabel(r)} <span className="text-xs text-muted">{r.minIlvl}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={!valid}>
          Save
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
