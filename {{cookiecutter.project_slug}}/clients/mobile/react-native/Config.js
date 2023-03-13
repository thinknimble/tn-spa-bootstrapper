import Logger from './logger'
import { BACKEND_SERVER_URL, ROLLBAR_ACCESS_TOKEN, SENTRY_DSN } from '@env'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

const [PROD_URL, STAGING_URL, DEV_URL] = [
  'https://api.example.app',
  'https://example.herokuapp.com',
  'http://localhost:8000',
]
const [PROD, STAGING, DEV, REVIEW] = ['production', 'staging', 'development', 'review']

function getEnvOrDefaultURL(defaultUrl) {
  /**
   * TEMP set prod url and vars
   * return BACKEND_SERVER_URL || defaultUrl
   */
  return PROD_URL
}
// Check if this is a build defined by EAS Build

const { apiUrl, buildEnv, rollbarAccessToken, sentryDSN } = Constants?.expoConfig?.extra

const isAndroid = Platform.OS === 'android'
let rollbarToken = isAndroid ? undefined : ROLLBAR_ACCESS_TOKEN

const ENV = () => {
  if (buildEnv) {
    rollbarToken = rollbarAccessToken
    return {
      apiUrl: apiUrl,
      logger: new Logger(rollbarToken).logger,
      sentryDSN: sentryDSN,
    }
  }
  return {
    apiUrl: getEnvOrDefaultURL(STAGING_URL),
    logger: new Logger(rollbarToken).logger,
    sentryDSN: SENTRY_DSN,
  }
}
console.log(ENV())
Config = { ...ENV() }

export default Config