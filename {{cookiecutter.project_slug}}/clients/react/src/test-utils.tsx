import * as React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { screen } from '@testing-library/dom'

const AllProviders = ({ children }: { children?: React.ReactNode }) => <>{children}</>

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options })

export { customRender as render, screen }
