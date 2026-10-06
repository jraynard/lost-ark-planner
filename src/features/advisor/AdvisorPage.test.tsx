import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useRoster } from '../../store/roster'
import { AdvisorPage } from './AdvisorPage'

beforeEach(() => {
  localStorage.clear()
  useRoster.getState().clear()
})

describe('AdvisorPage', () => {
  it('ranks the example roster like the plan doc and advises questing alts', () => {
    useRoster.getState().loadExample()
    const { container } = render(
      <MemoryRouter>
        <AdvisorPage />
      </MemoryRouter>,
    )
    const ranked = [...container.querySelectorAll('ol > li')]
    const names = ranked.map((li) => li.querySelector('.font-semibold:not(.rounded-full)')?.textContent)
    expect(names).toEqual(['Smokesensi', 'Miriya', 'Vismunde', 'Miriyanah'])
    expect(screen.getAllByText(/\+15,500 \/ week/)).toHaveLength(2)
    expect(screen.getAllByText(/Quest through South Kurzan/)).toHaveLength(2)
  })

  it('shows what a cost estimate still needs, and the best special honing piece', () => {
    useRoster.getState().loadExample()
    render(
      <MemoryRouter>
        <AdvisorPage />
      </MemoryRouter>,
    )
    // Bundled data has no XP or base rates yet, so cost ranking is unavailable.
    expect(screen.getAllByText(/Cost estimate needs/).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Gold per gold spent' })).toBeDisabled()
    expect(screen.getAllByText(/Special honing: best on Helmet \(\+18 → \+19, 3.0% per 20 stones/).length).toBeGreaterThan(0)
  })
})
