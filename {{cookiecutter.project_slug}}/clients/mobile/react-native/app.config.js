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
      'sentry-expo',

      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '13.0',
          },
        },
      ],
    ],
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
    },
    runtimeVersion: {
      policy: 'sdkVersion',
    },
  },
}
