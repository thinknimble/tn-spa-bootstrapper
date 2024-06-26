module.exports = {
    expo: {
      name: 'tn mobile bootstrapper',
      slug: 'tn-sample-app', // should match expo
      owner: 'thinknimble-bootstrapper', // should match expo
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
        url: 'https://u.expo.dev/ec1b86e2-2582-48cf-8a7a-c6d2772ba4f2', // uuid of app
      },
      plugins: [
        [
          '@sentry/react-native/expo',
          {
            organization: 'tn-bootstrapper', // replace with org in sentry
            project: process.env.SENTRY_PROJECT_NAME, // see readme for these variables
          }
        ],
        'expo-build-properties',
        'expo-localization',
        'expo-font',  
      ],
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'org.thinknimble.expo.bootstrapper',
        config: {
          usesNonExemptEncryption: false,
        },
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/logo-sq.png',
          backgroundColor: '#FFFFFF',
        },
        package: 'com.example.app',
      },
      web: {
        favicon: './assets/logo-sq.png',
      },
      extra: {
        // these values are hardcoded and provided in eas.json
        eas: {
          projectId: 'ec1b86e2-2582-48cf-8a7a-c6d2772ba4f2',
        },
        backendServerUrl: process.env.BACKEND_SERVER_URL,
        buildEnv: process.env.BUILD_ENV,
        rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
        sentryDSN: process.env.SENTRY_DSN,
      },
      runtimeVersion: {
        policy: 'sdkVersion',
      },
    },
  }
  