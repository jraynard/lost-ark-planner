import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TriagePage } from './TriagePage'

describe('TriagePage', () => {
  it('updates the verdict as the drop changes', async () => {
    render(<TriagePage />)
    const status = screen.getByRole('status')
    // Default: ancient accessory, 70 quality.
    expect(status).toHaveTextContent('Check the Auction House')

    const quality = screen.getByLabelText('Quality')
    await userEvent.clear(quality)
    await userEvent.type(quality, '50')
    expect(status).toHaveTextContent('Dismantle')

    await userEvent.click(screen.getByLabelText('Has support (ally buff) effects'))
    expect(status).toHaveTextContent('Keep')

    await userEvent.click(screen.getByRole('button', { name: 'Ability stone' }))
    expect(status).toHaveTextContent('Check the Auction House before faceting')
    await userEvent.click(screen.getByLabelText('Still uncut'))
    expect(status).toHaveTextContent('Dismantle')
  })
})
