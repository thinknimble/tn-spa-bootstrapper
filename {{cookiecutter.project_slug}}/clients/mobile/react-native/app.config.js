module.exports = {
  expo: {
    name: '{{ cookiecutter.project_name }}', // THIS SHOULD MATCH EXPO APP NAME
    slug: '{{ cookiecutter.project_name }}', // THIS SHOULD MATCH EXPO APP SLUG
    owner: '<ORG NAME IN EXPO>', // THIS SHOULD MATCH EXPO APP OWNER ORG
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
      url: 'https://u.expo.dev/<APP_ID>', // uuid of app
    },
    plugins: [
      'sentry-expo'
    ],
    hooks: {
      postPublish: [
        { // this set up assumes you are using one application with multiple projects in sentry
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: '',
            project: process.env.SENTRY_PROJECT_NAME, // see readme for this variables
            authToken: process.env.SENTRY_AUTH_TOKEN, // defined in expo secrets
          },
        },
      ],
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: '<IOS APP BUNDLE ID>', // CHANGE TO BUNDLE ID
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo-sq.png',
        backgroundColor: '#FFFFFF',
      },
      package: '<ANDROID PACKAGE ID>', // CHANGE TO PACKAGE ID
    },
    web: {
      favicon: './assets/logo-sq.png',
    },
    extra: {

      eas: {
        projectId: '<APP-PROJECT-ID>', // uuid of app
      },
      // these values are hardcoded and provided in eas.json
      backendServerUrl: process.env.BACKEND_SERVER_URL,
      isBuild: process.env.IS_BUILD,
      buildEnv: process.env.BUILD_ENV,
      rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      sentryDSN: process.env.SENTRY_DSN,
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
}
