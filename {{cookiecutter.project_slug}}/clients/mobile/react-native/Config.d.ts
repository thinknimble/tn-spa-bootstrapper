import Logger from './logger'

declare const Config: {
  backendServerUrl: string
  logger: Logger['logger']
  sentryDSN: string
}

export default Config
