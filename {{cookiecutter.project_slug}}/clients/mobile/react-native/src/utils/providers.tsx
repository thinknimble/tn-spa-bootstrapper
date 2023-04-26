import React, { PropsWithChildren } from 'react'

import { ServicesProvider } from '../services'

export const SSProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return <ServicesProvider>{children}</ServicesProvider>
}
