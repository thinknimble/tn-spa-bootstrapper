import { MockedProvider } from '@apollo/client/testing'
import { screen } from '@testing-library/react'
import { App } from './app.rest'
import { render } from './test-utils'
import './utils/__tests__/mediaMock'

describe('App test', () => {
  test('Renders login', () => {
    /**
     * Although this actually logs "function". Whenever we get into the test, still fails with `env.window.matchMedia is undefined
     */
    console.log('hello there?', typeof window.matchMedia)
    render(
      <MockedProvider>
        <App />
      </MockedProvider>,
    )
    const linkElement = screen.getByText(/Enter your login credentials below/i)
    expect(linkElement).toBeInTheDocument()
  })
})
