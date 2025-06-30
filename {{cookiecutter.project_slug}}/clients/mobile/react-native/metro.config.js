const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withNativeWind } = require('nativewind/metro')
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getSentryExpoConfig(__dirname, { isCSSEnabled: true })


module.exports = wrapWithReanimatedMetroConfig(withNativeWind(config, { input: './global.css' }))

