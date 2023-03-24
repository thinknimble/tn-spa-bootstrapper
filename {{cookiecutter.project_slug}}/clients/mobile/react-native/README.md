## Getting Started

## Environments

Build environments are different from the typical environments we think of

When running locally NODE_ENV='development'
When a version is published or updated NODE_ENV='production'

### Configuration and env variables

All config variables for the various environments come from .env file in mobile directory
Env variables defined in eas.json are not available to npx run start (local)
When using environment variables that need to be initialized as part of the app.config.js you must add them to the .env file and the run command in the package.json (see sentry for an example)

### Running the project

1. Install deps with `yarn`

```bash
cd app && yarn
```

3. Run the project and pick your platform from the console options

```bash
yarn start
```

## Tech Stack

- [Expo SDK](https://github.com/expo/expo) - a set of tools and services built around React Native and native platforms.
- [React Navigation (v6)](https://github.com/react-navigation/react-navigation) - routing and navigation for React Native apps.
- [Navio](https://github.com/kanzitelli/rn-navio) - universal navigation library for React Native. Built on top of [React Navigation](https://github.com/react-navigation/react-navigation).
- [NativeWind](https://www.nativewind.dev/) - Bring Tailwindcss syntax to React Native
- [Reanimated 2](https://github.com/software-mansion/react-native-reanimated) - React Native's Animated library reimplemented.
- [Zustand](https://github.com/pmndrs/zustand) - Bear necessities for state management in React
- [Flash List](https://github.com/Shopify/flash-list) - a better list for React Native (by Shopify).
- [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler) - native touches and gesture system for React Native.
- [TN Models FP](https://github.com/thinknimble/tn-models-fp) - package developed specially to work with TN python backends from a client.
- [Tanstack Query](https://github.com/TanStack/query) - server state management

#### Useful services/methods

- `navio` - a service that exposes all navigation methods of [Navio](https://github.com/kanzitelli/rn-navio) instance.
- `translate` - a service that brings an easy integration of localization for an app by using [i18n-js](https://github.com/fnando/i18n-js) and [expo-localization](https://github.com/expo/expo/tree/master/packages/expo-localization).
- `api` - a service where API-related methods are located.
- `onStart` - a service where you can write your own logic when app is launched. For example, you can increment number of `appLaunches` there.

#### Design system

Use `tailwind.config.js` to define the styles you're going to use in the app.


#### Important info & resources
- iOS Appstore connect api key, signing cert and provisioning profiles are managed via expo (with fastlane)
- Android store certificates are managed via expo (with fastlane) the service json file is in the shared googledrive folder

#### Process Testing & Development

- Each PR will create a new *review* app both in **expo** & **heroku**
- Mobile *review* app will automatically have the backend url set to its own backend-url in the form of `https://app-name-prnumber.herokuapp.com`
- Each merge into main will trigger a release in the staging channel of expo & automatically deploy a new staging backend to heroku. 

#### Installing the staging build 

Each merge to main builds a new staging app that you may install, to do so you must make sure all testing devices are registerted

`eas device:create` 

will create a new link to register a device

#### Appstores

At the moment we only have one application in the future we will add a separate staging application

- To deploy to each store you have to manually run the GH release action (for each platform)
- Each deploy to test flight and android test store will auto increment the version (patch version for iOS) we can decide how that will work later. 

Run these workflow's manually to deploy and submit the app to the appstore

*expo-teststore-build-android.yml*
*expo-teststore-build-ios.yml*

Run this workflow to deploy an emergency code related bugfix

expo-emergency-prod-update.yml

