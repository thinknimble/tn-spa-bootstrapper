import React, { useEffect } from 'react'
import './utils/__tests__/mediaMock'
import { screen } from '@testing-library/react'
import { render } from './test-utils'
import { App, AppRoot } from './App'
import { MockedProvider } from '@apollo/client/testing'

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
