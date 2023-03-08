import Logger from './logger'
import { BACKEND_SERVER_URL, ROLLBAR_ACCESS_TOKEN } from '@env'
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

const isAndroid = Platform.OS === 'android'
//! we found out that adding rollbar crashes Android apps
const rollbarToken = isAndroid ? undefined : '<rollbar-token>' //ROLLBAR_ACCESS_TOKEN

const ENV = {
  apiUrl: getEnvOrDefaultURL(STAGING_URL),
  logger: new Logger(rollbarToken).logger,
}
Config = { ...ENV }
Config.logger('envvars form consts', JSON.stringify(Constants?.expoConfig?.extra))
export default Config
