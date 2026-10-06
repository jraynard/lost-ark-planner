import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { bundledGameData } from '../data/game'
import { PlannerPage } from '../features/planner/PlannerPage'
import { useGameDataStore } from '../store/gameData'
import { useRoster } from '../store/roster'
import { Layout } from './Layout'

const remote = () => {
  const d = structuredClone(bundledGameData)
  d.version += 1
  d.changelog.push({ version: d.version, notes: ['Act 4 gold reduced'] })
  d.raids.find((r) => r.id === 'act4-solo')!.gold = 25000
  return d
}

beforeEach(() => {
  localStorage.clear()
  useRoster.getState().loadExample()
  useGameDataStore.setState({ accepted: null, skippedVersion: null, lastChecked: null, pending: null, status: 'idle' })
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(remote()))))
})

afterEach(() => vi.unstubAllGlobals())

const renderApp = () =>
  render(
    <MemoryRouter initialEntries={['/planner']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="planner" element={<PlannerPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )

describe('game data update banner', () => {
  it('asks before switching, then updates the plan', async () => {
    renderApp()
    const banner = await screen.findByRole('alert')
    expect(banner).toHaveTextContent(`Game data update available (v${bundledGameData.version + 1}`)
    expect(banner).toHaveTextContent('Act 4 gold reduced')
    // Not applied until the user says so.
    expect(screen.getByText('165,500')).toBeInTheDocument()

    await userEvent.click(within(banner).getByRole('button', { name: 'Update' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    // Smokesensi and Miriya each lose 2,000 on Act 4 Solo.
    expect(screen.getByText('161,500')).toBeInTheDocument()
  })

  it('skip hides the version for good', async () => {
    renderApp()
    await userEvent.click(within(await screen.findByRole('alert')).getByRole('button', { name: 'Skip this version' }))
    expect(useGameDataStore.getState().skippedVersion).toBe(bundledGameData.version + 1)
    await useGameDataStore.getState().check()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
