import Constants, { ExecutionEnvironment } from 'expo-constants'
import { Platform } from 'react-native'
import Logger from './logger'

const BACKEND_SERVER_URL = process.env.EXPO_PUBLIC_BACKEND_SERVER_URL
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN
const ROLLBAR_ACCESS_TOKEN = process.env.EXPO_PUBLIC_ROLLBAR_ACCESS_TOKEN

const { backendServerUrl, rollbarAccessToken, sentryDSN } = Constants?.expoConfig?.extra

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
const isAndroid = Platform.OS === 'android'

const ENV = () => {
  if (!isExpoGo) {
    let rollbarToken = isAndroid ? undefined : rollbarAccessToken
    const logger = new Logger(rollbarToken).logger
    return {
      backendServerUrl,
      logger,
      sentryDSN,
    }
  }

  let rollbarToken = isAndroid ? undefined : ROLLBAR_ACCESS_TOKEN
  const logger = new Logger(rollbarToken).logger
  return {
    backendServerUrl: BACKEND_SERVER_URL,
    logger,
    sentryDSN: SENTRY_DSN,
    isExpoGo,
  }
}

const Config = { ...ENV() }
export default Config