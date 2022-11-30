import React from 'react'
import { vi } from 'vitest'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { render } from 'src/test-utils'
import { AuthProvider } from '../auth'

vi.mock('../routes') // check ../___mocks__/routes.tsx for mocked routes module constants

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

const mockedUseNavigate = vi.fn()

// mock useNavigate
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
}))

beforeEach(() => {
  vi.clearAllMocks()
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
