## Getting Started

This app is bootstrapped with the TN-Bootsrapper, it uses Expo as a wrapper framework around React Native. Install and run with **Node v20**.

## Installing and Running

FIRST: You must follow ALL of the "Configuration" steps below. Once configured, you can install the NodeJS dependencies and run the app.

```bash
cd mobile
node install --include=dev  # Install NodeJS dependencies
npm run start  # Source env variables and run dev server
```

Alternatively, if you want to use expo run command:

```bash
source .env && npx expo start
```

## Configuration

After running the bootsrapper a mobile directory is created the following steps are needed to run and deploy the app

### First, set up an Expo account

Go to [expo.dev](https://expo.dev/), and set up an Expo organization.

Select "Access Tokens" from the left sidebar:

1. Create an Expo Robot named, e.g. `CI/CD`
2. Click "+ Creat Token" to create an API key for the robot named e.g. `GH_ACTIONS`
3. Now go to your GitHub repo settings. Create a Repository Secret with the name `EXPO_TOKEN`, paste the API key you generated as the value, and save it.
4. **Create an EAS Project**

Back in Expo, click on "Projects" in the sidebar and create a new project. Give it the same name as your app.

You will then be presented with these commands. Copy and run them in the `./mobile` directory:

```bash
npm install --global eas-cli
eas init --id {eas_uuid}
```

NOTE: This may require setting up Rollbar and Sentry first. If so, follow the instructions below and then come back to this.

### Set Up Error Logging and Crash Analytics

Set up a [Rollbar](https://rollbar.com/) instance. We recommend setting up a single Heroku Rollbar add-on instance that is attached to the production environment.

In your Rollbar account, create a project for each environment and retrieve the `post_client_token`.

Set up [Sentry](https://sentry.io/) for crash analytics and additional error logs. We use Sentry because it is pre-built to integrate with Expo.

Create a Sentry account and set up the projects for the various environments. This can also be attached to the prod instance on Heroku.

Then go to `Settings` > `Developer Settings` > `Auth Tokens` and create a new token that you'll use in `Expo`

Retrieve:

1. API Key
2. Sentry DSN for each project
3. project-name

You should set the `SENTRY_AUTH_TOKEN` in Expo under `Secrets`.

### Set Environment Variables

For local run set environment variables in .env file (from [.env.example](./.env.example))

For builds, environment variables should be set in [eas.json](./eas.json)

#### Use the helper script to enter variables

You can fill in `eas.json` and `app.config.js` by hand, but we have also written a script to make it easier to quickly update those files with your variable values.

Fill in [eas.vars.template.txt](./resources/eas.vars.template.txt) and [app.config.vars.template.txt](./resources/app.config.vars.template.txt).

Then run these commands using the `setup_mobile_config.sh` helper script:

```bash
. scripts/setup_mobile_config.sh eas.json <FULL_PATH>/resources/eas.vars.txt

. scripts/setup_mobile_config.sh app.config.js <FULL_PATH>/resources/app.config.vars.txt
```

### EAS Project Configuration

In [app.config.js](./app.config.js) set the configuration variables

- owner: this should match the organization in expo
- slug: this should match the slug in expo
- add expo id to the extras obj
- updates: the url should contain the id of the expo app
- ios: bundleIdentifier: this should be created in the apple developer account
- android: package: this should be created in the google play developer console

To configure non-interactive builds for the CI/CD pipeline you must run BUT you will be doing that after the next step:

`eas credentials`

The recommended approach for managing credentials is through Expo, in the selections you should see this as an option

| Build Credentials: Manage everything needed to build your project
| All: Set up all the required credentials to build your project

### Connecting to a Backend in Development

Since Expo runs on a separate device, it cannot reach localhost on your computer, so you must use your computer's LAN **IP address** instead of localhost.

OR, you can use a web proxy like [ngrok](https://ngrok.com/):

1. Download and install ngrok
2. Set up ngrok auth token (request an account from William Huster)
3. run ngrok `~/.ngrok http 8000 --subdomain <a domain>`
4. add your new subomain to the `.env` IN MOBILE DIR as BACKEND_DEV_SERVER
5. append your new subdomain to the `.env` in ROOT DIR to ALLOW_HOSTS e.g `ALLOW_HOSTS=[localhost:8080,<your domain>.ngrok.io]`

## Set Up for the Apple App Store

Head over to the (apple developer account)[https://developer.apple.com/account/resources/identifiers/bundleId/add/bundle] and set up a new bundle identifier <-- Only set up the bundle identifier not a complete app yet

`eas credentials`

| Build Credentials: Manage everything needed to build your project
| All: Set up all the required credentials to build your project

Return to the menu and also set up AppStore Connect API Key

| App Store Connect: Manage your API Key

If you need Push Notifications as well

| Push Notifications: Manage your Apple Push Notifications Key

Configure the submit environment in the [eas.json](./eas.json)

- ascAppId: this is a random uid that you will set when creating the app

For internal builds to pass you must first register at least one testing device using

`eas device:create`

Select the option for URL and send the URL to each user who wants to test a build.

Recreate the provisioning profile <- **this step is required in order for the user to be able to install the app**

`eas credentials`

Rebuild the app <- **this step is required in order for the user to be able to install the app**

You must run a first time production build to set up appstore connect keys to be managed by Expo

## Set Up for the Google Play Store

There is no required configuration for google in the eas.json however you must build and upload the apk for the first time before being able to automate.

### Deployments, Environments & Submissions

- Each PR will create a new _review_ app both in **expo** & **heroku**
- Mobile _review_ app will automatically have the backend url set to its own backend-url in the form of `https://app-name-prnumber.herokuapp.com`
- Each merge into main will trigger a release in the staging channel of expo & automatically deploy a new staging backend to heroku.

#### Setting Env Vars

**Local**

_expo go_
To set env variables locally you may use the .env file and import the variables using `@env` eg in [Config.js](./Config.js), these variables are sourced in the npm run script
If you need to use environment variables in the app.config.js you must declare the variables in the npm run script as well as the expo run occurs in a separate process

_development build_
the variables for this environment are set up in the eas.json under the development profile

**Staging**

To set env variables you should use the [eas.json](./eas.json) and [app.config.js](./app.config.js) although it is possible to define variables in a .env (eg in the CI yaml files) due to inconsistencies while testing I consider this to be the best approach.
Staging builds are created automatically when merging into the main branch you can also build manually

`eas build --platform all --profile staging --non-interactive`

**Prod**

Prod includes testflight and teststore testing on these should not pollute the prod environment and should not be treated as an internal testing env.

To deploy to the test stores you can use the two GH actions:
You must remember to update the version number in [app.config.js](./app.config.js)

[expo-teststore-build-android.yml](/{{ cookiecutter.project_slug }}/.github/workflows/expo-teststore-build-android.yml)
[expo-teststore-build-ios.yml](/{{ cookiecutter.project_slug }}/.github/workflows/expo-teststore-build-ios.yml)

In case of a bug you can also use expo-updates to quickly push a temporary fix using:

[expo-teststore-build-ios.yml](/{{ cookiecutter.project_slug }}/.github/workflows/expo-teststore-build-ios.yml)

This is only temporary and should be resolved as soon as possible, the update is only available to users with the app already any new downloads will need another push to update (users will also have to close and reopen the app).

#### Native Builds VS Expo Runs

##### Expo Runs

There are two types of expo runs, the first is during local development, when we start our app with `npm run start` this will run the app in expo go, the second is when we release an update with `eas update`.

We currently use `expo update` when building our staging app to get a quick and easy to use link for testing _review apps_

There are certain situations when this may not be possible for example we are installing a package that does not currently have an expo extension (revenue cat for in-app purchases) or we are using a native package that expo does not have access to (face id)

When merging into main we deploy a new staging version that can be run in expo we also build a staging version of the app as a stand-alone native build that can be ran on a device. Staging versions will point to he staging backend defined in the [eas.json](./eas.json)

Most internal testing should be sufficient on the expo staging build however you can also provide the link for testing with the native build. When installed this build will replace the version on your device.

To test on expo users must be invited to the expo organization
To test a native staging build users will have to install a developer profile that registers their device UUID (this is only for apple devices)

Expo makes it easy to register UUID's by following this step:

`eas device:create`

Select the option for URL and send the URL to each user who wants to test a staging build. Because the UUID is stored in the staging build the user must register before the build, otherwise you will have to rebuild the staging env.

Lastly you can test any of the internal distribution builds (in other words development, staging) directly on browserstack

### Update certificates (IOS yearly)

This needs to be done yearly or builds will fail (live apps would be fine).
We should get an email from Apple when this is coming up

From the `mobile/` folder run:

`eas credentials`

1. select platform (probably IOS)
1. select `production`
1. log in
1. `Build Credentials`
1. `Distribution Certificate: Add a new one to your account`
1. New? `yes`
1. Use? `yes`
1. New Profile? Optional, but `yes`
1. visit the project dashboard at `https://expo.dev/`
1. Go to `Credentials` in the nav and see that you now have two, the old and the new.
1. Download the old one before deleting
1. Once you verify that builds are still working, you can delete your backup copy

#### Design system

Use `tailwind.config.js` to define the styles you're going to use in the app.

#### Important info & resources

- iOS Appstore connect api key, signing cert and provisioning profiles are managed via expo (with fastlane)

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

#### Process Testing & Development

- Each PR will create a new _review_ app both in **expo** & **heroku**
- Mobile _review_ app will automatically have the backend url set to its own backend-url in the form of `https://app-name-prnumber.herokuapp.com`
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

_expo-teststore-build-android.yml_
_expo-teststore-build-ios.yml_

Run this workflow to deploy an emergency code related bugfix

expo-emergency-prod-update.yml

#### Important note about custom native modules and expo eject

We can easily use our own native or non supported RN pacakges by checking if we are running an expo build or not, these will only work in expo builds not expo go.
When building for local testing/development we use the alternative builds in our eas.json
Recently Expo has changed the `expo eject` command for `expo pre-build` this will create the iOS and Android folders and allow you to run your project in xcode or android studio as well you will need to activate your .env file since some vars are supplied from there.

You can accomplish this with `npm run prebuild:local` this will ensure that your `.env` file is sourced!

Expo will automatically change your package.json and add/remove/change the following

- `"main"` entry will be removed
- `"start"`: `"expo start --dev-client"` will change to this <----

therefore when running prebuild ensure not to commit these changes!
