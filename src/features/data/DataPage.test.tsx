import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { useChecklist } from '../../store/checklist'
import { useRoster } from '../../store/roster'
import { DataPage } from './DataPage'
import { ImportPage } from './ImportPage'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/data" element={<DataPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Routes>
    </MemoryRouter>,
  )

beforeEach(() => {
  localStorage.clear()
  useChecklist.setState({ daily: { period: '', done: [] }, weekly: { period: '', done: [] } })
})

describe('sharing a roster', () => {
  it('exports a code that imports on an empty device through the share link', async () => {
    useRoster.getState().loadExample()
    const { unmount } = renderAt('/data')
    const code = (screen.getByLabelText('Share code') as HTMLTextAreaElement).value
    expect(code).toMatch(/^LAP1\./)
    unmount()

    useRoster.getState().clear()
    renderAt(`/import?d=${code}`)
    expect(screen.getByText('Smokesensi')).toBeInTheDocument()
    expect(screen.getByText('1705.66')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Import' }))
    expect(screen.getByText('Imported 6 characters.')).toBeInTheDocument()
    expect(useRoster.getState().characters).toHaveLength(6)
  })

  it('explains a bad code', async () => {
    renderAt('/data')
    await userEvent.type(screen.getByLabelText('Import code'), 'not a code')
    expect(screen.getByText('That isn’t a Lost Ark Planner share code.')).toBeInTheDocument()
  })
})
