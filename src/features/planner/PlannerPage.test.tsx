import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useRoster } from '../../store/roster'
import { PlannerPage } from './PlannerPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <PlannerPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  localStorage.clear()
  useRoster.getState().clear()
})

describe('PlannerPage', () => {
  it('points to the roster when there are no gold earners', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /Roster page/ })).toBeInTheDocument()
  })

  it('shows the example roster total and each lineup', () => {
    useRoster.getState().loadExample()
    renderPage()
    // 64,500 + 64,500 + 24,000 + 12,500
    expect(screen.getByText('165,500')).toBeInTheDocument()
    const main = screen.getByText('Smokesensi').closest('div.rounded-lg') as HTMLElement
    expect(within(main).getByText('Act 4 Solo')).toBeInTheDocument()
    expect(within(main).getByText('64,500')).toBeInTheDocument()
  })

  it('adopting a group upgrade updates the lineup', async () => {
    useRoster.getState().loadExample()
    renderPage()
    const main = screen.getByText('Smokesensi').closest('div.rounded-lg') as HTMLElement
    const row = within(main).getByText('Horizon Cathedral Stage 1').closest('li')!
    await userEvent.click(within(row).getByRole('button', { name: 'I’ll run this' }))
    expect(within(main).getByText('78,000')).toBeInTheDocument()
    expect(useRoster.getState().characters[0].learnedRaids).toContain('horizon-1')
  })
})
