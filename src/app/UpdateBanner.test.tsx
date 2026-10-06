import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppUpdate } from '../store/appUpdate'
import { UpdateBanner } from './UpdateBanner'

const state = () => useAppUpdate.getState()

beforeEach(() => useAppUpdate.setState({ available: null, dismissed: null, status: 'idle', lastChecked: null }))

describe('new version check', () => {
  it('stays quiet when the deployed build matches this one', async () => {
    await state().check(async () => ({ buildId: __BUILD_ID__ }))
    expect(state().available).toBeNull()
    render(<UpdateBanner />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('offers a reload when a different build is deployed', async () => {
    await state().check(async () => ({ buildId: 'abc1234' }))
    render(<UpdateBanner />)
    expect(screen.getByRole('alert')).toHaveTextContent('A new version of the planner is available.')
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('Later hides it until an even newer build appears', async () => {
    await state().check(async () => ({ buildId: 'abc1234' }))
    render(<UpdateBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Later' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await state().check(async () => ({ buildId: 'abc1234' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await state().check(async () => ({ buildId: 'def5678' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('treats a failed or malformed response as an error, not an update', async () => {
    await state().check(async () => {
      throw new Error('offline')
    })
    expect(state()).toMatchObject({ status: 'error', available: null })
    await state().check(async () => '<html>404</html>')
    expect(state()).toMatchObject({ status: 'error', available: null })
  })
})
