import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as Updates from 'expo-updates'
import { Platform } from 'react-native'
import Logger from './logger'

const BACKEND_SERVER_URL = process.env.EXPO_PUBLIC_BACKEND_SERVER_URL
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN

const { backendServerUrl, sentryDSN } = Constants?.expoConfig?.extra

// Named rather than written out at each use, so that the slug sits on one line
// instead of inside two longer expressions.
//
// The slug decides how long this line is, and prettier wraps on length, so it
// would ask for one shape in the template and another in a rendered project,
// and `format:check` could not pass for both. A slug past about 40 characters
// crosses printWidth on its own. Leave the line to the author.
// prettier-ignore
const STAGING_BACKEND_URL = 'https://{{ cookiecutter.project_slug }}-staging.herokuapp.com'

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
const isAndroid = Platform.OS === 'android'

const config = {
  'expo-go': {
    backendServerUrl: BACKEND_SERVER_URL,
    sentryDSN: SENTRY_DSN,
  },
  expo_build: {
    staging: {
      backendServerUrl: backendServerUrl || BACKEND_SERVER_URL || STAGING_BACKEND_URL,
      sentryDSN: sentryDSN || SENTRY_DSN || '<REPLACE_WITH_STAGING_SENTRY_DSN>',
    },
    production: {
      // This falls back to the staging host, which looks like a slip, but
      // changing it changes where a production build points, so it is left
      // as it was found.
      backendServerUrl: backendServerUrl || BACKEND_SERVER_URL || STAGING_BACKEND_URL,
      sentryDSN: sentryDSN || SENTRY_DSN || '<REPLACE_WITH_PROD_SENTRY_DSN>',
    },
  },
}

const ENV = () => {
  if (!isExpoGo) {
    /**
     *
     * Temporary manual hack to set variables, due to an issue we are facing with expo-updates
     * Pari Baker
     * 2024-05-08
     */
    if (Updates.channel === 'staging') {
      const logger = new Logger().logger
      return { ...config.expo_build.staging, logger }
    } else if (Updates.channel === 'production') {
      const logger = new Logger().logger
      return { ...config.expo_build.production, logger }
    }

    return {
      backendServerUrl,
      logger,
      sentryDSN,
      isExpoGo,
    }
  }

  const logger = new Logger().logger

  return {
    backendServerUrl: BACKEND_SERVER_URL,
    logger,
    sentryDSN: SENTRY_DSN,
    isExpoGo,
  }
}

const Config = { ...ENV() }
export default Config
