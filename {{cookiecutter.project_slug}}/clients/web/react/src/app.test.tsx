import { screen } from '@testing-library/react'
import { App } from './app'
import { render } from './test-utils'
import './utils/__tests__/mediaMock'
{% if cookiecutter.use_graphql == 'y' -%}
import { MockedProvider } from '@apollo/client/testing'
{% endif -%}

describe('App test', () => {
  test('Renders login', () => {
    render(
{% if cookiecutter.use_graphql == 'y' -%}
      <MockedProvider>
        <App />
      </MockedProvider>
{% else -%}
      <App/>
{% endif -%}
    )
    expect(screen.getByText('PORTAL LOG IN')).toBeTruthy()
  })
})
