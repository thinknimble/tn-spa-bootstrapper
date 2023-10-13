import { screen } from '@testing-library/react'
import { App } from './app'
import { render } from './test-utils'
import './utils/__tests__/mediaMock'

describe('App test', () => {
  test('Renders login', () => {
    render(
      <App/>
    )
    expect(screen.getByText('PORTAL LOG IN')).toBeTruthy()
  })
})
