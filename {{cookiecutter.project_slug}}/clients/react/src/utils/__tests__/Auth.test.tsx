import React from 'react'
import { waitFor, fireEvent } from '@testing-library/react'
import { render } from '../../test-utils'
import { AuthProvider } from '../auth'
import { MockedProvider } from '@apollo/client/testing'
import { Route, Routes, MemoryRouter, Outlet, Link } from 'react-router-dom'

jest.mock('../routes') // check ../___mocks__/routes.tsx for mocked routes module constants

function Home() {
  return (
    <div data-testid="test-home">
      Test Home Component
      <Link to="test" data-testid="test-link">
        Test
      </Link>
      <Link to="private" data-testid="test-private-link">
        Private Page
      </Link>
      <Outlet />
    </div>
  )
}

function Test() {
  return <div data-testid="test-component">Test Component</div>
}

function LogIn() {
  return <div data-testid="test-login">Test Login Component</div>
}

function Private() {
  return <div data-testid="private-page">Test Private Page</div>
}

const TEST_ROUTES = (
  <MemoryRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="test" element={<Test />} />
          <Route path="private" element={<Private />} />
        </Route>
        <Route path="log-in" element={<LogIn />} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
)

const TestProvider = <MockedProvider>{TEST_ROUTES}</MockedProvider>

const mockedUseNavigate = jest.fn()

// mock useNavigate
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockedUseNavigate,
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('logged out user', () => {
  test('home route redirects to log-in', async () => {
    render(TestProvider)

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledTimes(1)
      expect(mockedUseNavigate).toHaveBeenCalledWith('/log-in')
    })
  })

  test('private route redirects to log-in', async () => {
    const { getByTestId } = render(TestProvider)

    await fireEvent.click(getByTestId('test-private-link'))

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledTimes(2)
      expect(mockedUseNavigate).toHaveBeenCalledWith('/log-in')
    })
  })

  test('public route renders component', async () => {
    const { getByTestId } = render(TestProvider)

    await fireEvent.click(getByTestId('test-link'))

    await waitFor(() => {
      expect(mockedUseNavigate).toHaveBeenCalledTimes(1)
      expect(getByTestId('test-component')).toBeInTheDocument()
    })
  })
})
