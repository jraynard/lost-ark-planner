import { formatGold, formatMaterials, materialLabels, slotLabels } from '../../app/format'
import type { HoningMove, HoningPlan, SpecialHoningOption } from '../../engine/honing-cost'
import { Link } from 'react-router'

const moveLabel = (m: HoningMove) =>
  `${slotLabels[m.slot]} ${m.kind === 'normal' ? `+${m.from} → +${m.to}` : `advanced ${m.from} → ${m.to}`}`

/** Cost estimate to the next breakpoint, or what data it still needs. */
export function HoningCost({ plan }: { plan: HoningPlan }) {
  if (!plan.reachesTarget) {
    return (
      <details className="mt-1 text-sm text-muted">
        <summary className="cursor-pointer hover:text-text">
          Cost estimate needs {plan.missing.length} more game data value{plan.missing.length === 1 ? '' : 's'}
        </summary>
        <ul className="mt-1 list-disc pl-5 text-xs">
          {plan.missing.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <p className="mt-1 text-xs">Record these in docs/in-game-checks.md (round 2) and publish them in the game data file.</p>
      </details>
    )
  }

  const next = plan.moves[0]
  return (
    <div className="mt-1 text-sm">
      <div>
        Estimated cost: <span className="text-text">{formatMaterials(plan.total.materials)}</span> ·{' '}
        <span className="text-text">{formatGold(plan.total.gold)} gold</span>
        {plan.unpriced.length === 0 && (
          <span className="text-muted"> (≈{formatGold(plan.totalGoldEquivalent)} gold in total)</span>
        )}
      </div>
      {next && <div className="text-muted">Cheapest next: {moveLabel(next)}</div>}
      {plan.unpriced.length > 0 && (
        <div className="text-xs text-warn">
          Set prices for {plan.unpriced.map((id) => materialLabels[id]).join(', ')} on the{' '}
          <Link to="/data" className="underline">
            Data page
          </Link>{' '}
          to compare steps fully; until then the order ignores their cost.
        </div>
      )}
    </div>
  )
}

export function SpecialHoningTip({ options }: { options: SpecialHoningOption[] }) {
  const best = options[0]
  if (!best) return null
  return (
    <div className="mt-1 text-sm text-muted">
      Special honing: best on {slotLabels[best.slot]} (+{best.targetLevel - 1} → +{best.targetLevel},{' '}
      {(best.chance * 100).toFixed(1)}% per {best.stonesPerAttempt} stones, ≈{formatGold(best.expectedStonesPerSuccess)} stones
      per success). Skip pieces with a lot of Artisan’s Energy built up.
    </div>
  )
}
