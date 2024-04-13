import Logger from './logger'

declare const Config: {
  backendServerUrl: string
  logger: Logger['logger']
  sentryDSN: string
  isExpoGo?: boolean
}

export default Config
