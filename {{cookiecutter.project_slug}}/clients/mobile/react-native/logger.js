export default class Logger {
  constructor() {
  }
  static create() {
    return new Logger()
  }
  get client() {
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
