import { useState } from 'react'
import { PageHeader } from '../../app/PageHeader'
import { Card, inputClass } from '../../app/ui'
import { triage, type Drop, type DropGrade, type DropKind, type Verdict } from '../../engine/triage'

const kinds: { value: DropKind; label: string }[] = [
  { value: 'accessory', label: 'Accessory' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'ability-stone', label: 'Ability stone' },
  { value: 'other', label: 'Anything else' },
]

const grades: { value: DropGrade; label: string }[] = [
  { value: 'ancient', label: 'Ancient' },
  { value: 'relic', label: 'Relic' },
  { value: 'other', label: 'Lower' },
]

const verdictStyles: Record<Verdict, { label: string; className: string }> = {
  keep: { label: 'Keep', className: 'border-good/40 bg-good/10 text-good' },
  sell: { label: 'Sell', className: 'border-accent/40 bg-accent/10 text-accent-strong' },
  check: { label: 'Check the Auction House', className: 'border-warn/40 bg-warn/10 text-warn' },
  dismantle: { label: 'Dismantle', className: 'border-border bg-surface-2 text-muted' },
}

const rules: [string, string][] = [
  ['Accessory below 67 quality', 'Dismantle'],
  ['Ancient accessory, 67+ quality', 'Check the Auction House; equip it if it beats what you wear, otherwise sell'],
  ['Relic accessory, 67+ quality', 'Send to an alt that needs Enlightenment points; sell if none do'],
  ['Accessory with support (ally buff) effects', 'Keep the good ones for your support; sell the rest'],
  ['Ancient bracelet', 'Check the Auction House before dismantling; don’t reroll one you might sell (rerolling binds it)'],
  ['Uncut Relic or Ancient ability stone', 'Check the Auction House before faceting; a faceted stone usually can’t be sold'],
  ['Everything else', 'Dismantle'],
]

export function TriagePage() {
  const [drop, setDrop] = useState<Drop>({ kind: 'accessory', grade: 'ancient', quality: 70, supportEffects: false, uncut: true })
  const patch = (p: Partial<Drop>) => setDrop((d) => ({ ...d, ...p }))
  const result = triage(drop)
  const style = verdictStyles[result.verdict]

  return (
    <>
      <PageHeader title="Triage">Keep, sell or dismantle? Describe the drop.</PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <Segmented label="Type" options={kinds} value={drop.kind} onChange={(kind) => patch({ kind })} />
          {drop.kind !== 'other' && (
            <Segmented label="Grade" options={grades} value={drop.grade} onChange={(grade) => patch({ grade })} />
          )}
          {drop.kind === 'accessory' && (
            <>
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted">Quality</span>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={100} value={drop.quality ?? 0} onChange={(e) => patch({ quality: e.target.valueAsNumber })}
                    className="flex-1 accent-accent" aria-label="Quality slider" />
                  <input type="number" min={0} max={100} value={drop.quality ?? 0} aria-label="Quality"
                    onChange={(e) => patch({ quality: Math.min(100, Math.max(0, e.target.valueAsNumber || 0)) })} className={inputClass} style={{ width: '5rem' }} />
                </div>
              </div>
              <Check label="Has support (ally buff) effects" checked={!!drop.supportEffects} onChange={(supportEffects) => patch({ supportEffects })} />
            </>
          )}
          {drop.kind === 'ability-stone' && <Check label="Still uncut" checked={!!drop.uncut} onChange={(uncut) => patch({ uncut })} />}
        </Card>

        <div role="status" aria-live="polite" className={`flex flex-col justify-center gap-2 rounded-lg border p-5 ${style.className}`}>
          <div className="text-2xl font-semibold">{style.label}</div>
          <div className="text-text">{result.action}</div>
          <div className="text-sm text-muted">{result.reason}</div>
        </div>
      </div>

      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-muted hover:text-text">All rules</summary>
        <Card className="mt-2 p-0">
          <table className="w-full text-left">
            <tbody className="divide-y divide-border">
              {rules.map(([drop, action]) => (
                <tr key={drop}>
                  <td className="p-3 align-top font-medium">{drop}</td>
                  <td className="p-3 text-muted">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-xs text-muted">
          Before dismantling anything good-looking, check its Auction House price. Accessories can only be traded 3 times.
        </p>
      </details>
    </>
  )
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <fieldset className="flex flex-col gap-1 text-sm">
      <legend className="mb-1 text-muted">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-md border px-3 py-1.5 transition-colors ${
              value === o.value ? 'border-accent bg-accent/15 text-accent-strong' : 'border-border bg-surface-2 text-muted hover:text-text'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-accent" />
      {label}
    </label>
  )
}
