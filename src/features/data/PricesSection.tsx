import { materialLabels } from '../../app/format'
import { Card, inputClass } from '../../app/ui'
import { useGameData } from '../../app/useGameData'
import type { MaterialId } from '../../data/schema'
import { useSettings } from '../../store/settings'

export function PricesSection() {
  const defaults = useGameData().materialPrices
  const { materialPrices, setMaterialPrice } = useSettings()

  return (
    <Card className="flex flex-col gap-3 text-sm">
      <p className="text-muted">
        Gold per single unit, from the Auction House. The Advisor uses these to compare honing steps that use
        different materials. Leave a box empty to use the default.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(materialLabels) as MaterialId[]).map((id) => (
          <label key={id} className="flex flex-col gap-1">
            <span className="text-muted">{materialLabels[id]}</span>
            <input type="number" min={0} step="0.01" className={inputClass}
              value={materialPrices[id] ?? ''}
              placeholder={defaults[id] == null ? 'No default; please set' : `Default ${defaults[id]}`}
              onChange={(e) => setMaterialPrice(id, e.target.value === '' ? null : e.target.valueAsNumber)} />
          </label>
        ))}
      </div>
    </Card>
  )
}
