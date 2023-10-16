module.exports = {
  expo: {
    name: '<REPLACE_WITH_EXPO_APP_NAME>',
    slug: '<REPLACE_WITH_EXPO_APP_SLUG>',
    owner: '<REPLACE_WITH_EXPO_OWNER>',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logo-sq.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },
    assetBundlePatterns: ['**/*'],
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/<REPLACE_WITH_EXPO_APP_ID>', // uuid of app
    },
    plugins: ['sentry-expo', 'expo-build-properties', 'expo-localization'],
    hooks: {
      postPublish: [
        {
          // this set up assumes you are using one application with multiple projects in sentry
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: '<REPLACE_WITH_SENTRY_ORG>', // replace with org in sentry
            project: process.env.SENTRY_PROJECT_NAME, // see readme for this variables
            authToken: process.env.SENTRY_AUTH_TOKEN, // defined in GH Secrets
          },
        },
      ],
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: '<REPLACE_WITH_IOS_BUNDLE_ID>', // CHANGE TO BUNDLE ID
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo-sq.png',
        backgroundColor: '#FFFFFF',
      },
      package: '<REPLACE_WITH_ANDROID_PACKAGE_ID>', // CHANGE TO PACKAGE ID
    },
    web: {
      favicon: './assets/logo-sq.png',
    },
    extra: {
      eas: {
        projectId: '<REPLACE_WITH_EXPO_APP_ID>', // uuid of app
      },
      // these values are hardcoded and provided in eas.json
      backendServerUrl: process.env.BACKEND_SERVER_URL,
      buildEnv: process.env.BUILD_ENV,
      rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      sentryDSN: process.env.SENTRY_DSN,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
    experiments: { tsconfigPaths: true },
  },
}
