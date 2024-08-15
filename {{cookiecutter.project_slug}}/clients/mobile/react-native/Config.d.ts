import Logger from './logger'

declare const Config: {
  backendServerUrl: string
  logger: Logger['logger']
  sentryDSN: string
  isExpoGo?: boolean
}
declare const vars :{
  [key:string]: any
}
export default Config
export { vars }
