## Getting Started

This app is bootstrapped with the TN Bootstrapper. It uses Expo as a wrapper framework around React Native. Install and run with **Node 22 or newer** (CI builds use Node 22).

## Installing and Running

FIRST: You must follow ALL of the "Configuration" steps below. Once configured, you can install the NodeJS dependencies and run the app:

```bash
cd mobile
npm install --include=dev  # Install NodeJS dependencies
npm run start              # Run the dev server in Expo Go
```

Expo loads the `.env` file automatically; variables prefixed with `EXPO_PUBLIC_` are available in the app (see [Config.js](./Config.js)).

## Configuration

After running the bootstrapper, a `mobile` directory is created. The following steps are needed to run and deploy the app.

### First, set up an Expo account

Go to [expo.dev](https://expo.dev/), and set up an Expo organization.

Select "Access Tokens" from the left sidebar:

1. Create an Expo Robot named, e.g. `CI/CD`
2. Click "+ Create Token" to create an API key for the robot named e.g. `GH_ACTIONS`
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

Set up a [Rollbar](https://rollbar.com/) instance and create a project for each environment. Retrieve the `post_client_token` for each project.

Set up [Sentry](https://sentry.io/) for crash analytics and additional error logs. We use Sentry because it is pre-built to integrate with Expo.

Create a Sentry account and set up the projects for the various environments.

Then go to `Settings` > `Developer Settings` > `Auth Tokens` and create a new token that you'll use in Expo.

Retrieve:

1. API Key
2. Sentry DSN for each project
3. project-name

Set `SENTRY_AUTH_TOKEN` in the Expo dashboard under "Environment variables".

### Set Environment Variables

For local runs, set environment variables in the `.env` file (copy [.env.example](./.env.example)).

For builds, environment variables should be set in [eas.json](./eas.json). The build profiles are `development`, `development_review`, `development_simulator`, `staging`, and `production`.

#### Use the helper script to enter variables

You can fill in `eas.json` and `app.config.js` by hand, but the project also ships a script to update those files with your variable values quickly.

Fill in `resources/eas.vars.template.txt` and `resources/app.config.vars.template.txt` (both live at the project root, one level above `mobile/`).

Then run the `setup_mobile_config.sh` helper from the project root:

```bash
. scripts/setup_mobile_config.sh mobile/eas.json resources/eas.vars.template.txt

. scripts/setup_mobile_config.sh mobile/app.config.js resources/app.config.vars.template.txt
```

The script replaces every `REPLACE_WITH_*` placeholder in the target file with the value from your vars file.

### EAS Project Configuration

In [app.config.js](./app.config.js) set the configuration variables:

- owner: this should match the organization in Expo
- slug: this should match the slug in Expo
- add the Expo id to the extras object
- updates: the url should contain the id of the Expo app
- ios: bundleIdentifier: this should be created in the Apple developer account
- android: package: this should be created in the Google Play developer console

To configure non-interactive builds for the CI/CD pipeline you must run (after the next step):

`eas credentials`

The recommended approach for managing credentials is through Expo. In the selections you should see this as an option:

| Build Credentials: Manage everything needed to build your project
| All: Set up all the required credentials to build your project

### Connecting to a Backend in Development

Since Expo runs on a separate device, it cannot reach localhost on your computer, so you must use your computer's LAN **IP address** instead of localhost.

OR, you can use a web proxy like [ngrok](https://ngrok.com/):

1. Download and install ngrok, and set up an ngrok auth token
2. Run ngrok: `ngrok http 8000 --url <your-domain>.ngrok-free.app`
3. Set your new domain in the mobile `.env` as `EXPO_PUBLIC_BACKEND_SERVER_URL`, e.g. `EXPO_PUBLIC_BACKEND_SERVER_URL="https://<your-domain>.ngrok-free.app"`
4. Append the domain to `ALLOWED_HOSTS` in the ROOT `.env` (a comma-separated list of hostnames), e.g. `ALLOWED_HOSTS=localhost,<your-domain>.ngrok-free.app`

## Set Up for the Apple App Store

Head over to the [Apple developer account](https://developer.apple.com/account/resources/identifiers/bundleId/add/bundle) and set up a new bundle identifier <-- Only set up the bundle identifier, not a complete app yet.

`eas credentials`

| Build Credentials: Manage everything needed to build your project
| All: Set up all the required credentials to build your project

Return to the menu and also set up the App Store Connect API Key:

| App Store Connect: Manage your API Key

If you need Push Notifications as well:

| Push Notifications: Manage your Apple Push Notifications Key

Configure the submit environment in [eas.json](./eas.json):

- ascAppId: this is a random uid that you will set when creating the app

For internal builds to pass you must first register at least one testing device using:

`eas device:create`

Select the option for URL and send the URL to each user who wants to test a build.

Recreate the provisioning profile <- **this step is required in order for the user to be able to install the app**

`eas credentials`

Rebuild the app <- **this step is required in order for the user to be able to install the app**

You must run a first-time production build to set up App Store Connect keys to be managed by Expo.

## Set Up for the Google Play Store

There is no required configuration for Google in the eas.json. However, you must build and upload the APK for the first time before being able to automate.

### Deployments, Environments & Submissions

- Each PR will create a new _review_ app both in **Expo** & **Heroku**
- The mobile _review_ app will automatically have the backend url set to its own backend url in the form of `https://app-name-prnumber.herokuapp.com`
- Each merge into main will trigger a release in the staging channel of Expo & automatically deploy a new staging backend to Heroku.

#### Setting Env Vars

**Local**

_Expo Go_
Set variables in the mobile `.env` file with the `EXPO_PUBLIC_` prefix; [Config.js](./Config.js) reads them from `process.env`. Expo loads the `.env` file itself — no sourcing is needed.
If you need an environment variable inside `app.config.js`, it must be available to the Expo process; see the `prebuild:local` script in [package.json](./package.json) for an example that sources `.env` first.

_development build_
The variables for this environment are set up in eas.json under the `development` profile.

**Staging**

To set env variables you should use [eas.json](./eas.json) and [app.config.js](./app.config.js). Staging builds are created automatically when merging into the main branch. You can also build manually:

`eas build --platform all --profile staging --non-interactive`

**Prod**

Prod includes TestFlight and test-store testing. Testing on these does not pollute the prod environment, but they should not be treated as an internal testing environment.

To deploy to the test stores you can use the two GitHub Actions below. You must remember to update the version number in [app.config.js](./app.config.js) first:

- [expo-teststore-build-android.yml](../.github/workflows/expo-teststore-build-android.yml)
- [expo-teststore-build-ios.yml](../.github/workflows/expo-teststore-build-ios.yml)

In case of a bug you can also use expo-updates to quickly push a temporary fix using:

- [expo-emergency-prod-update.yml](../.github/workflows/expo-emergency-prod-update.yml)

This is only temporary and should be resolved as soon as possible. The update is only available to users who already have the app; any new downloads will need another push to update (users will also have to close and reopen the app).

#### Native Builds VS Expo Runs

##### Expo Runs

There are two types of Expo runs. The first is during local development, when we start our app with `npm run start`, which runs the app in Expo Go. The second is when we release an update with `eas update`.

We currently use `eas update` when building our staging app to get a quick and easy-to-use link for testing _review apps_.

There are certain situations when this may not be possible. For example: we install a package that does not currently have an Expo extension (RevenueCat for in-app purchases), or we use a native package that Expo does not have access to (Face ID).

When merging into main we deploy a new staging version that can run in Expo, and we also build a staging version of the app as a stand-alone native build that can run on a device. Staging versions will point to the staging backend defined in [eas.json](./eas.json).

Most internal testing should be sufficient on the Expo staging build. However, you can also provide the link for testing with the native build. When installed, this build will replace the version on your device.

To test on Expo, users must be invited to the Expo organization.
To test a native staging build, users will have to install a developer profile that registers their device UUID (this is only for Apple devices).

Expo makes it easy to register UUIDs with:

`eas device:create`

Select the option for URL and send the URL to each user who wants to test a staging build. Because the UUID is stored in the staging build, the user must register before the build; otherwise you will have to rebuild the staging environment.

Lastly, you can test any of the internal distribution builds (in other words: development, staging) directly on BrowserStack.

### Update certificates (iOS, yearly)

This needs to be done yearly or builds will fail (live apps would be fine).
We should get an email from Apple when this is coming up.

From the `mobile/` folder run:

`eas credentials`

1. select platform (probably iOS)
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

- The iOS App Store Connect API key, signing cert, and provisioning profiles are managed via Expo (with fastlane)

When running locally, NODE_ENV='development'.
When a version is published or updated, NODE_ENV='production'.

### Configuration and env variables

All config variables for the various environments come from the `.env` file in the mobile directory.
Env variables defined in eas.json are not available to `npm run start` (local).
When an environment variable needs to be initialized as part of `app.config.js`, you must add it to the `.env` file and to the run command in package.json, because the Expo run occurs in a separate process (see `prebuild:local` for an example).

## Tech Stack

- [Expo SDK](https://github.com/expo/expo) - a set of tools and services built around React Native and native platforms.
- [React Navigation (v6)](https://github.com/react-navigation/react-navigation) - routing and navigation for React Native apps.
- [NativeWind](https://www.nativewind.dev/) - bring Tailwind CSS syntax to React Native
- [Reanimated](https://github.com/software-mansion/react-native-reanimated) - React Native's Animated library reimplemented.
- [Zustand](https://github.com/pmndrs/zustand) - bear necessities for state management in React
- [Flash List](https://github.com/Shopify/flash-list) - a better list for React Native (by Shopify).
- [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler) - native touches and gesture system for React Native.
- [TN Models](https://github.com/thinknimble/tn-models) - package developed specially to work with TN python backends from a client.
- [Tanstack Query](https://github.com/TanStack/query) - server state management

#### Installing the staging build

Each merge to main builds a new staging app that you may install. To do so, you must make sure all testing devices are registered:

`eas device:create`

will create a new link to register a device.

#### App stores

At the moment we only have one application; in the future we will add a separate staging application.

- To deploy to each store you have to manually run the GitHub release action (for each platform)
- Each deploy to TestFlight and the Android test store will auto-increment the version (patch version for iOS); we can decide how that will work later.

Run these workflows manually to deploy and submit the app to the app store:

- _expo-teststore-build-android.yml_
- _expo-teststore-build-ios.yml_

Run this workflow to deploy an emergency code-related bugfix:

- _expo-emergency-prod-update.yml_

#### Important note about custom native modules and Expo prebuild

We can easily use our own native or unsupported RN packages by checking if we are running an Expo build or not; these will only work in Expo builds, not Expo Go.
When building for local testing/development we use the alternative builds in our eas.json.
Expo replaced the old `expo eject` command with `npx expo prebuild`. Prebuild creates the iOS and Android folders and allows you to run your project in Xcode or Android Studio. You will also need to activate your `.env` file, since some vars are supplied from there.

You can accomplish this with `npm run prebuild:local`, which ensures that your `.env` file is sourced.

Expo will automatically change your package.json and add/remove/change the following:

- the `"main"` entry will be removed
- `"start"` will change to `"expo start --dev-client"`

Therefore, when running prebuild, ensure you do not commit these changes!
