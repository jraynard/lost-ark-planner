import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRoster } from '../../store/roster'
import { RosterPage } from './RosterPage'

beforeEach(() => {
  localStorage.clear()
  useRoster.getState().clear()
})

describe('RosterPage', () => {
  it('starts empty and can load the example roster', async () => {
    render(<RosterPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Load example roster' }))
    expect(screen.getByText('Smokesensi')).toBeInTheDocument()
    expect(screen.getByText('1705.66')).toBeInTheDocument()
    expect(screen.getByText('4 / 6 gold earners')).toBeInTheDocument()
  })

  it('adds a character with a manual item level', async () => {
    render(<RosterPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Add character' }))
    await userEvent.type(screen.getByLabelText('Name'), 'Newalt')
    await userEvent.type(screen.getByLabelText('Item level'), '1665')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Newalt')).toBeInTheDocument()
    expect(screen.getByText('1665.00')).toBeInTheDocument()
    expect(useRoster.getState().characters[0]).toMatchObject({ name: 'Newalt', ilvl: 1665 })
  })

  it('computes item level from gear while editing', async () => {
    render(<RosterPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Add character' }))
    await userEvent.type(screen.getByLabelText('Name'), 'Gearalt')
    await userEvent.click(screen.getByLabelText('Enter T4 gear per piece'))
    // Default gear is +10 / 0 on every piece = 1640.
    expect(within(screen.getByRole('form')).getByText('1640.00')).toBeInTheDocument()

    const weapon = screen.getByLabelText('weapon normal')
    await userEvent.clear(weapon)
    await userEvent.type(weapon, '16')
    expect(within(screen.getByRole('form')).getByText('1645.00')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(useRoster.getState().characters[0].ilvl).toBe(1645)
  })

  it('edits and deletes a character', async () => {
    useRoster.getState().loadExample()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<RosterPage />)

    const row = screen.getByText('Vedinah').closest('li')!
    await userEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    const ilvl = screen.getByLabelText('Item level')
    await userEvent.clear(ilvl)
    await userEvent.type(ilvl, '1640')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(useRoster.getState().characters.find((c) => c.name === 'Vedinah')!.ilvl).toBe(1640)

    await userEvent.click(within(screen.getByText('Cygnus').closest('li')!).getByRole('button', { name: 'Delete' }))
    expect(screen.queryByText('Cygnus')).not.toBeInTheDocument()
  })
})
