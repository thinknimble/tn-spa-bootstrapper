import { Client } from 'rollbar-react-native'

const [PROD, STAGING, DEV, REVIEW] = ['production', 'staging', 'development', 'review']

export default class Logger {
  constructor(token = null) {
    this.token = token
  }
  static create(token = null) {
    return new Logger(token)
  }
  get client() {
    if (this.token) {
      return new Client(this.token)
    }
    return null
  }
  get logger() {
    const logger = {}
    logger.info = this.client ? this.client.info : console.log
    logger.warn = this.client ? this.client.warning : console.warn
    logger.error = this.client ? this.client.error : console.error
    logger.critical = this.client ? this.client.critical : console.error
    logger.debug = this.client ? this.client.debug : console.debug
    return logger
  }
}
