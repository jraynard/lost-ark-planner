import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { formatGold } from '../../app/format'
import { PageHeader } from '../../app/PageHeader'
import { useNow } from '../../app/useNow'
import { Card } from '../../app/ui'
import { useGameData } from '../../app/useGameData'
import { raidLabel } from '../../data/game'
import type { Task } from '../../data/schema'
import { formatIlvl } from '../../engine/ilvl'
import { bestLineup } from '../../engine/lineup'
import {
  dailyPeriodStart,
  formatCountdown,
  nextDailyReset,
  nextWeeklyReset,
  weeklyPeriodStart,
} from '../../engine/reset'
import { doneKeys, useChecklist, type Cadence } from '../../store/checklist'
import { useRoster } from '../../store/roster'

export function ChecklistPage() {
  const now = useNow()
  const characters = useRoster((s) => s.characters)
  const { daily, weekly, toggle } = useChecklist()
  const data = useGameData()
  const characterTasks = data.tasks.filter((t) => t.scope === 'character')
  const rosterTasks = data.tasks.filter((t) => t.scope === 'roster')

  const weekPeriod = weeklyPeriodStart(now)
  const dayPeriod = dailyPeriodStart(now)
  const weekDone = doneKeys(weekly, weekPeriod)
  const dayDone = doneKeys(daily, dayPeriod)
  const tick = (cadence: Cadence, key: string) =>
    toggle(cadence, cadence === 'weekly' ? weekPeriod : dayPeriod, key)

  if (characters.length === 0) {
    return (
      <>
        <PageHeader title="Checklist" />
        <Card className="text-center text-muted">
          <Link to="/roster" className="text-accent hover:underline">
            Add characters on the Roster page
          </Link>{' '}
          to get a checklist.
        </Card>
      </>
    )
  }

  const sorted = [...characters].sort((a, b) => b.ilvl - a.ilvl)
  const raidPlans = sorted
    .filter((c) => c.goldEarner)
    .map((c) => ({ character: c, raids: bestLineup(c, data).raids }))
    .filter((p) => p.raids.length > 0)
  const allRaidKeys = raidPlans.flatMap((p) => p.raids.map((r) => ({ key: `${p.character.id}:${r.id}`, gold: r.gold ?? 0 })))
  const raidsDone = allRaidKeys.filter((r) => weekDone.has(r.key))
  const goldClaimed = raidsDone.reduce((sum, r) => sum + r.gold, 0)
  const goldTotal = allRaidKeys.reduce((sum, r) => sum + r.gold, 0)

  const dailyChars = sorted
    .map((c) => ({ character: c, tasks: characterTasks.filter((t) => c.ilvl >= t.minIlvl) }))
    .filter((c) => c.tasks.length > 0)

  return (
    <>
      <PageHeader title="Checklist">
        Ticks clear on their own at reset. Weekly reset in {formatCountdown(now, nextWeeklyReset(now))}, daily reset
        in {formatCountdown(now, nextDailyReset(now))}.
      </PageHeader>

      {raidPlans.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="This week's raids">
            {raidsDone.length} / {allRaidKeys.length} done · {formatGold(goldClaimed)} / {formatGold(goldTotal)} gold
          </SectionHeader>
          <div className="flex flex-col gap-3">
            {raidPlans.map(({ character, raids }) => (
              <Card key={character.id} className="p-3">
                <CharacterName name={character.name} ilvl={character.ilvl} />
                <div className="flex flex-wrap gap-2">
                  {raids.map((r) => {
                    const key = `${character.id}:${r.id}`
                    return (
                      <TickChip key={key} label={raidLabel(r)} checked={weekDone.has(key)} onChange={() => tick('weekly', key)} />
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Today" />
        <div className="flex flex-col gap-3">
          {dailyChars.map(({ character, tasks }) => (
            <Card key={character.id} className="p-3">
              <CharacterName name={character.name} ilvl={character.ilvl} />
              <div className="flex flex-wrap gap-2">
                {tasks.map((t) => {
                  const key = `${character.id}:${t.id}`
                  return <TickChip key={key} label={t.label} checked={dayDone.has(key)} onChange={() => tick('daily', key)} />
                })}
              </div>
            </Card>
          ))}
          <Card className="p-3">
            <div className="mb-2 text-sm font-medium">Roster</div>
            <ul className="flex flex-col gap-2">
              {rosterTasks.map((t) => (
                <RosterTask key={t.id} task={t} checked={dayDone.has(`roster:${t.id}`)} onChange={() => tick('daily', `roster:${t.id}`)} />
              ))}
            </ul>
          </Card>
          {characterTasks.some((t) => t.note) && (
            <ul className="list-disc pl-5 text-xs text-muted">
              {characterTasks.filter((t) => t.note).map((t) => (
                <li key={t.id}>
                  {t.label}: {t.note}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-sm font-medium tracking-wide text-muted uppercase">{title}</h2>
      {children && <span className="text-sm text-muted tabular-nums">{children}</span>}
    </div>
  )
}

function CharacterName({ name, ilvl }: { name: string; ilvl: number }) {
  return (
    <div className="mb-2 text-sm">
      <span className="font-medium">{name}</span> <span className="text-muted">{formatIlvl(ilvl)}</span>
    </div>
  )
}

function TickChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        checked ? 'border-good/40 bg-good/10 text-muted line-through' : 'border-border bg-surface-2 hover:border-muted'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-good" />
      {label}
    </label>
  )
}

function RosterTask({ task, checked, onChange }: { task: Task; checked: boolean; onChange: () => void }) {
  return (
    <li>
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input type="checkbox" checked={checked} onChange={onChange} className="mt-0.5 accent-good" />
        <span>
          <span className={checked ? 'text-muted line-through' : ''}>{task.label}</span>
          {task.note && <span className="block text-xs text-muted">{task.note}</span>}
        </span>
      </label>
    </li>
  )
}
