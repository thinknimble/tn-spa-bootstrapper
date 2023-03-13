<p align="center">
  <img src="https://xxx-files.ggc.team/oss/expo-starter/cover.png" width="80%" title="Logo">
</p>

This starter is a collection of libraries and approaches needed for fast start and productive maintainance of Expo (React Native) App.

## Getting Started

## Environments

Build environments are different from the typical environments we think of

When running locally NODE_ENV='development'
When a version is published or updated NODE_ENV='production'

### Configuration and env variables

All config variables for the various environments come from .env file in mobile directory
Env variables defined in eas.json are not available to npx run start (local)
When using environment variables that need to be initialized as part of the app.config.js you must add them to the .env file and the run command in the package.json (see sentry for an example)

#### Quick start with [cli-rn](https://github.com/kanzitelli/cli-rn)

```bash
npx cli-rn new app
```

In order to change app's name, please make necessary changes in `app.json`.

<details>
<summary>Manual setup</summary>

1. Clone the repo

```bash
npx degit kanzitelli/expo-starter app
```

2. Install packages

```bash
cd app && yarn
```

3. Run it!

```bash
yarn start
```

</details>

## What's inside

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

## Advantages

#### Describe app layout in one place (w/ [Navio](https://github.com/kanzitelli/rn-navio))

All setup for your screens, tabs and modals take place in one file `src/screens/index.ts`.

```tsx
import { Navio } from 'rn-navio'

// importing screen components
import { Main } from './main'
import { Playground } from './playground'
import { Settings } from './settings'
import { Example } from './_screen-sample'

// building layout
export const navio = Navio.build({
  screens: {
    Main,
    Settings,
    Example,
    Playground: {
      component: Playground,
      options: () => ({
        title: 'Playground',
      }),
    },
  },
  stacks: {
    MainStack: ['Main', 'Example'],
    ExampleStack: ['Example'],
  },
  tabs: {
    MainTab: {
      stack: 'MainStack',
      options: {
        title: 'Home',
      },
    },
    PlaygroundTab: {
      stack: ['Playground'],
      options: () => ({
        title: 'Playground',
      }),
    },
    SettingsTab: {
      stack: ['Settings'],
      options: () => ({
        title: 'Settings',
      }),
    },
  },
  modals: {
    ExampleModal: 'ExampleStack',
  },
  root: 'Tabs',
  hooks: [useAppearance],
  options: {
    stack: screenDefaultOptions,
    tab: tabDefaultOptions,
  },
})

export const AppRoot = navio.Root
```

#### Navigate with predictability

```tsx
export const Screen = () => {
  const { navio } = useServices()

  return (
    <View>
      <Button
        label="Push Settings"
        onPress={() => {
          // Typescript and IDE will help with autocompletion
          navio.push('Settings')
        }}
      />
    </View>
  )
}
```
