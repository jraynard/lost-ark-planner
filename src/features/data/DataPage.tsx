import type { ReactNode } from 'react'
import { PageHeader } from '../../app/PageHeader'
import { ExportSection } from './ExportSection'
import { GameDataSection } from './GameDataSection'
import { ImportPanel } from './ImportPanel'
import { PricesSection } from './PricesSection'

export function DataPage() {
  return (
    <>
      <PageHeader title="Data">Sharing your roster with another device, material prices and game data updates.</PageHeader>
      <Section title="Share to another device">
        <ExportSection />
      </Section>
      <Section title="Import">
        <ImportPanel />
      </Section>
      <Section title="Material prices">
        <PricesSection />
      </Section>
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
