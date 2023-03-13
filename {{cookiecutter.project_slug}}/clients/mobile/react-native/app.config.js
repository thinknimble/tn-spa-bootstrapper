module.exports = {
  expo: {
    name: '{{ cookiecutter.project_name }}',
    slug: '{{ cookiecutter.project_name }}',
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
            authToken: '',
          },
        },
      ],
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/logo-sq.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {
      favicon: './assets/logo-sq.png',
    },
    extra: {
      apiUrl: process.env.API_URL,
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
