import * as Sentry from '@sentry/react-native'
import Config from '../../Config'

export const initSentry = () => {
  Sentry.init({
    dsn: Config.sentryDSN,
    debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  })

  Sentry.captureException('Sentry Exception')
}
