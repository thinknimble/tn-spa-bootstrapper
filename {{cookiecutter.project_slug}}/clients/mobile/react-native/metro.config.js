const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withNativeWind } = require('nativewind/metro')

// Use Sentry's Expo-specific config which wraps getDefaultConfig
const sentryConfig = getSentryExpoConfig(__dirname, {
  isCSSEnabled: true,
})
sentryConfig.resolver.sourceExts.push('sql')

// Apply NativeWind on top
const config = withNativeWind(sentryConfig, { input: './global.css' })

module.exports = config
