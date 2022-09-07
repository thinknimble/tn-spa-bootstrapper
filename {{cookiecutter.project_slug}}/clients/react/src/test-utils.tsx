import * as React from "react"
import { render, RenderOptions } from "@testing-library/react"

const AllProviders = ({ children }: { children?: React.ReactNode }) => (
  // <ChakraProvider theme={theme}>{children}</ChakraProvider>
  <div></div>
)

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options })

export { customRender as render }
