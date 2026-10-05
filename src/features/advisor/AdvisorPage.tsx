import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { formatGold } from '../../app/format'
import { PageHeader } from '../../app/PageHeader'
import { Badge, Card } from '../../app/ui'
import { QUEST_ILVL } from '../../data/progression'
import { raidLabel } from '../../data/raids'
import { eventMilestones } from '../../data/tasks'
import { breakpointLadder, upcomingMilestones, type Breakpoint } from '../../engine/breakpoints'
import type { HoningEstimate } from '../../engine/honing'
import { formatIlvl } from '../../engine/ilvl'
import { bestLineup } from '../../engine/lineup'
import type { Character } from '../../engine/types'
import { useRoster } from '../../store/roster'

export function AdvisorPage() {
  const characters = useRoster((s) => s.characters)

  if (characters.length === 0) {
    return (
      <>
        <PageHeader title="Advisor" />
        <Card className="text-center text-muted">
          <Link to="/roster" className="text-accent hover:underline">
            Add characters on the Roster page
          </Link>{' '}
          to see where to push next.
        </Card>
      </>
    )
  }

  const earners = characters.filter((c) => c.goldEarner)
  const withLadder = earners.map((character) => ({ character, ladder: breakpointLadder(character) }))
  const ranked = withLadder
    .filter((c) => c.ladder.length > 0)
    .sort((a, b) => b.ladder[0].goldPerIlvl - a.ladder[0].goldPerIlvl)
  const capped = withLadder.filter((c) => c.ladder.length === 0)
  const others = characters.filter((c) => !c.goldEarner).sort((a, b) => b.ilvl - a.ilvl)

  return (
    <>
      <PageHeader title="Advisor">
        Where to push item level next, ranked by weekly gold gained per item level. Honing is the
        rule of thumb: 1 normal success = 5 advanced levels = 5 piece levels; 6 piece levels = 1 item level.
      </PageHeader>

      <ol className="flex flex-col gap-4">
        {ranked.map(({ character, ladder }, i) => (
          <li key={character.id}>
            <PriorityCard rank={i + 1} character={character} ladder={ladder} />
          </li>
        ))}
      </ol>

      {capped.length > 0 && (
        <Section title="Solo gold maxed">
          {capped.map((c) => (
            <Card key={c.character.id} className="text-sm">
              <span className="font-medium">{c.character.name}</span>{' '}
              <span className="text-muted">
                {formatIlvl(c.character.ilvl)}: no higher item level pays more with the content this character runs.
                Group content is the next step; see the{' '}
                <Link to="/planner" className="text-accent hover:underline">
                  Planner
                </Link>
                .
              </span>
              <Milestones ilvl={c.character.ilvl} />
            </Card>
          ))}
        </Section>
      )}

      {others.length > 0 && (
        <Section title="Not earning gold">
          {others.map((c) => (
            <OtherCard key={c.id} character={c} />
          ))}
        </Section>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function PriorityCard({ rank, character, ladder }: { rank: number; character: Character; ladder: Breakpoint[] }) {
  const next = ladder[0]
  return (
    <Card>
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent-strong">
          {rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold">{character.name}</span>
            <span className="text-muted tabular-nums">
              {formatIlvl(character.ilvl)} → <span className="font-semibold text-text">{next.targetIlvl}</span>
            </span>
          </div>
          <div className="mt-1 text-sm">
            Unlocks {next.unlocks.map(raidLabel).join(', ')}:{' '}
            <span className="font-medium text-good">+{formatGold(next.goldGain)} / week</span>{' '}
            <span className="text-muted">
              ({formatGold(next.current.total)} → {formatGold(next.next.total)})
            </span>
          </div>
          <div className="mt-1 text-sm text-muted">
            <HoningText honing={next.honing} />
          </div>
          <Milestones ilvl={character.ilvl} />
        </div>
      </div>

      {ladder.length > 1 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted hover:text-text">Full ladder ({ladder.length} steps)</summary>
          <Ladder ladder={ladder} />
        </details>
      )}
    </Card>
  )
}

function Ladder({ ladder }: { ladder: Breakpoint[] }) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-left tabular-nums">
        <thead className="text-xs text-muted">
          <tr>
            <th className="py-1 pr-4 font-normal">Item level</th>
            <th className="py-1 pr-4 font-normal">Unlocks</th>
            <th className="py-1 pr-4 text-right font-normal">Weekly gold</th>
            <th className="py-1 text-right font-normal">Normal successes from now</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {ladder.map((step) => (
            <tr key={step.targetIlvl}>
              <td className="py-1.5 pr-4">{step.targetIlvl}</td>
              <td className="py-1.5 pr-4">{step.unlocks.map(raidLabel).join(', ')}</td>
              <td className="py-1.5 pr-4 text-right">
                {formatGold(step.next.total)} <span className="text-good">+{formatGold(step.goldGain)}</span>
              </td>
              <td className="py-1.5 text-right">≈{step.honing.normalSuccesses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HoningText({ honing }: { honing: HoningEstimate }) {
  return (
    <>
      Needs {Math.ceil(honing.pieceLevels - 1e-9)} piece levels: {honing.advancedLevels} advanced levels, or about{' '}
      {honing.normalSuccesses} normal successes.
    </>
  )
}

function Milestones({ ilvl }: { ilvl: number }) {
  if (ilvl < 1700) return null
  const ahead = upcomingMilestones(ilvl, eventMilestones)
  if (ahead.length === 0) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      Event milestones ahead:
      {ahead.map((m) => (
        <Badge key={m} tone="accent">
          {m}
        </Badge>
      ))}
      <span>(unconfirmed; events end Jan 20, 2027)</span>
    </div>
  )
}

function OtherCard({ character }: { character: Character }) {
  const questing = character.ilvl < QUEST_ILVL
  const lineupAtQuest = bestLineup({ ...character, ilvl: Math.max(character.ilvl, QUEST_ILVL) })
  return (
    <Card className="text-sm">
      <span className="font-medium">{character.name}</span>{' '}
      <span className="text-muted">{formatIlvl(character.ilvl)}</span>
      <p className="mt-1 text-muted">
        {questing ? (
          <>
            Quest through South Kurzan (1600 set) and North Kurzan (1640 set) to reach {QUEST_ILVL} for free. At {QUEST_ILVL}{' '}
            it could earn{' '}
          </>
        ) : (
          <>As a gold earner it could earn </>
        )}
        <span className="text-good">{formatGold(lineupAtQuest.total)} / week</span> from solo raids.
      </p>
    </Card>
  )
}
