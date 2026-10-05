import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChecklist } from '../../store/checklist'
import { useRoster } from '../../store/roster'
import { ChecklistPage } from './ChecklistPage'

const renderPage = () =>
  render(
    <MemoryRouter>
      <ChecklistPage />
    </MemoryRouter>,
  )

const at = (iso: string) => vi.setSystemTime(new Date(iso))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  localStorage.clear()
  useRoster.getState().loadExample()
  useChecklist.setState({ daily: { period: '', done: [] }, weekly: { period: '', done: [] } })
})

afterEach(() => vi.useRealTimers())

describe('ChecklistPage', () => {
  it('lists raids for gold earners and dailies for 1640+ characters', () => {
    at('2026-10-05T12:00:00Z') // Monday
    renderPage()
    expect(screen.getByText('0 / 11 done · 0 / 165,500 gold')).toBeInTheDocument()
    // Four characters at 1640+ get Kurzan Front; the two questing ones don't.
    expect(screen.getAllByLabelText('Kurzan Front')).toHaveLength(4)
    expect(screen.getByText(/Weekly reset in 1d 22h/)).toBeInTheDocument()
  })

  it('clears daily ticks at daily reset and raid ticks at weekly reset', async () => {
    at('2026-10-06T12:00:00Z') // Tuesday
    const { unmount } = renderPage()
    await userEvent.click(screen.getAllByLabelText('Act 4 Solo')[0])
    await userEvent.click(screen.getAllByLabelText('Kurzan Front')[0])
    expect(screen.getByText('1 / 11 done · 27,000 / 165,500 gold')).toBeInTheDocument()
    unmount()

    at('2026-10-07T09:00:00Z') // Wednesday, before reset: both kept
    const second = renderPage()
    expect(screen.getAllByLabelText('Act 4 Solo')[0]).toBeChecked()
    expect(screen.getAllByLabelText('Kurzan Front')[0]).toBeChecked()
    second.unmount()

    at('2026-10-07T10:00:00Z') // Wednesday reset: both cleared
    renderPage()
    expect(screen.getAllByLabelText('Act 4 Solo')[0]).not.toBeChecked()
    expect(screen.getAllByLabelText('Kurzan Front')[0]).not.toBeChecked()
  })
})
