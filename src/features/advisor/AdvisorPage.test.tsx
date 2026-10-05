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
    render(
      <MemoryRouter>
        <AdvisorPage />
      </MemoryRouter>,
    )
    const ranked = screen.getAllByRole('listitem').filter((li) => li.closest('ol'))
    const names = ranked.map((li) => li.querySelector('.font-semibold:not(.rounded-full)')?.textContent)
    expect(names).toEqual(['Smokesensi', 'Miriya', 'Vismunde', 'Miriyanah'])
    expect(screen.getAllByText(/\+15,500 \/ week/)).toHaveLength(2)
    expect(screen.getAllByText(/Quest through South Kurzan/)).toHaveLength(2)
  })
})
