import Logger from './logger'
import { BACKEND_SERVER_URL, ROLLBAR_ACCESS_TOKEN, SENTRY_DSN } from '@env'
import { Platform } from 'react-native'
import Constants from 'expo-constants'


const { backendServerUrl, buildEnv, rollbarAccessToken, sentryDSN } = Constants?.expoConfig?.extra

const isAndroid = Platform.OS === 'android'
let rollbarToken = isAndroid ? undefined : ROLLBAR_ACCESS_TOKEN

const ENV = () => {
  if (buildEnv) {
    rollbarToken = rollbarAccessToken
    return {
      backendServerUrl: backendServerUrl,
      logger: new Logger(rollbarToken).logger,
      sentryDSN: sentryDSN,
    }
  }
  return {
    backendServerUrl: BACKEND_SERVER_URL,
    logger: new Logger(rollbarToken).logger,
    sentryDSN: SENTRY_DSN,
  }
}

Config = { ...ENV() }

export default Config
