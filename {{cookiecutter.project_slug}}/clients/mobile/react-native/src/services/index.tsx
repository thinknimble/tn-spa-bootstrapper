import React, { ReactNode } from 'react'

import { OnStartService } from '@services/onStart'
import { TranslateService } from '@services/translate'
import { getNavio } from '@screens/index'

class Services {
  t = new TranslateService()
  onStart = new OnStartService()

  // -- adding navio as a service
  get navio() {
    return getNavio()
  }
}
export const services = new Services()

const servicesContext = React.createContext<Services>(services)
export const ServicesProvider = ({ children }: { children: ReactNode }) => (
  <servicesContext.Provider value={services}>{children}</servicesContext.Provider>
)
export const useServices = (): Services => React.useContext(servicesContext)

export const initServices = async (): PVoid => {
  for (const key in services) {
    if (Object.prototype.hasOwnProperty.call(services, key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = (services as any)[key] as IService

      if (s.init) {
        await s.init()
      }
    }
  }
}
