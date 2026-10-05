import { Link } from 'react-router'
import { formatGold, goldTypeLabels } from '../../app/format'
import { PageHeader } from '../../app/PageHeader'
import { Badge, Button, Card } from '../../app/ui'
import { goldRules, raidLabel, type Raid } from '../../data/raids'
import { formatIlvl } from '../../engine/ilvl'
import { groupUpgrades, rosterSummary, type GoldBreakdown, type Lineup } from '../../engine/lineup'
import type { Character } from '../../engine/types'
import { useRoster } from '../../store/roster'

export function PlannerPage() {
  const characters = useRoster((s) => s.characters)
  const summary = rosterSummary(characters)

  if (summary.goldEarnerCount === 0) {
    return (
      <>
        <PageHeader title="Planner" />
        <Card className="text-center text-muted">
          No gold earners yet.{' '}
          <Link to="/roster" className="text-accent hover:underline">
            Add characters on the Roster page
          </Link>{' '}
          and tick “Gold earner”.
        </Card>
      </>
    )
  }

  const unknown = summary.lineups.some((l) => l.lineup.hasUnknownGold)

  return (
    <>
      <PageHeader title="Planner">
        Best {goldRules.raidsPerCharacter} gold raids per character this week, one mode per raid.
      </PageHeader>

      <Totals total={summary.total} breakdown={summary.breakdown} approx={unknown} />
      {summary.overCap && (
        <p className="mb-4 text-sm text-warn">
          {summary.goldEarnerCount} gold earners ticked, but only {goldRules.goldEarnersPerRoster} can earn raid gold.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {summary.lineups
          .sort((a, b) => b.character.ilvl - a.character.ilvl)
          .map(({ character, lineup }) => (
            <CharacterPlan key={character.id} character={character} lineup={lineup} />
          ))}
      </div>
    </>
  )
}

function Totals({ total, breakdown, approx }: { total: number; breakdown: GoldBreakdown; approx: boolean }) {
  const tiles = [
    { label: 'Weekly raid gold', value: total, strong: true },
    { label: 'Tradable', value: breakdown.tradable },
    { label: 'Roster-bound', value: breakdown.roster },
    { label: 'Character-bound', value: breakdown.character },
  ]
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label} className="p-3">
          <div className="text-xs text-muted">{t.label}</div>
          <div className={`text-xl font-semibold tabular-nums ${t.strong ? 'text-accent-strong' : ''}`}>
            {formatGold(t.value)}
            {t.strong && approx && '+'}
          </div>
        </Card>
      ))}
    </div>
  )
}

function CharacterPlan({ character, lineup }: { character: Character; lineup: Lineup }) {
  const addLearnedRaid = useRoster((s) => s.addLearnedRaid)
  const upgrades = groupUpgrades(character)
  const freeSlots = goldRules.raidsPerCharacter - lineup.raids.length

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-semibold">{character.name}</span>{' '}
          <span className="text-sm text-muted">
            {formatIlvl(character.ilvl)} {character.className}
          </span>
        </div>
        <div className="text-lg font-semibold tabular-nums text-accent-strong">
          {formatGold(lineup.total)}
          {lineup.hasUnknownGold && '+'} <span className="text-xs font-normal text-muted">/ week</span>
        </div>
      </div>

      {lineup.raids.length === 0 ? (
        <p className="text-sm text-muted">No gold raids at this item level yet. The first solo raid opens at 1610.</p>
      ) : (
        <ul className="divide-y divide-border">
          {lineup.raids.map((raid) => (
            <RaidRow key={raid.id} raid={raid} />
          ))}
          {freeSlots > 0 && (
            <li className="py-2 text-sm text-muted">
              {freeSlots} gold slot{freeSlots > 1 ? 's' : ''} free: no other solo raid at this item level.
            </li>
          )}
        </ul>
      )}

      {upgrades.length > 0 && (
        <div className="mt-4 rounded-md bg-surface-2 p-3">
          <div className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Group content that pays more</div>
          <ul className="flex flex-col gap-2">
            {upgrades.map(({ raid, gain }) => (
              <li key={raid.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0">
                  {raidLabel(raid)} <span className="font-medium text-good">+{formatGold(gain)}</span>
                </span>
                <Button variant="ghost" className="shrink-0 text-xs whitespace-nowrap" onClick={() => addLearnedRaid(character.id, raid.id)}>
                  I’ll run this
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

function RaidRow({ raid }: { raid: Raid }) {
  return (
    <li className="flex items-center gap-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
        <span className="flex items-center gap-2 font-medium sm:flex-1">
          {raidLabel(raid)}
          {raid.groupOnly && <Badge tone="accent">Group</Badge>}
        </span>
        <span className="text-xs text-muted sm:w-40">{goldTypeLabels[raid.goldType]}</span>
      </div>
      <span className="shrink-0 text-right tabular-nums" title={raid.verified ? undefined : 'Not confirmed in game yet'}>
        {raid.gold === null ? '?' : formatGold(raid.gold)}
        {!raid.verified && <span className="text-warn">*</span>}
      </span>
    </li>
  )
}
