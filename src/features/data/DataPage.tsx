import type { ReactNode } from 'react'
import { PageHeader } from '../../app/PageHeader'
import { GameDataSection } from './GameDataSection'

export function DataPage() {
  return (
    <>
      <PageHeader title="Data">Game data updates, and sharing your roster with another device.</PageHeader>
      <Section title="Game data">
        <GameDataSection />
      </Section>
    </>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-medium tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  )
}
