## Getting Started

This app is bootstrapped with the TN-Bootsrapper and uses Expo as a wrapper framework around React Native. Install and run with **Node v20**.

## Installing and Running

**First:** Follow all "Configuration" steps below. Once configured, install NodeJS dependencies and run the app.

```bash
cd mobile
npm install  # Install NodeJS dependencies
npm run start  # Source env variables and run dev server
```

Alternatively, to use the Expo run command:

```bash
source .env && npx expo start
```

## Configuration

After running the bootsrapper, a `mobile` directory is created. The following steps are needed to run and deploy the app.

### 1. Set up an Expo account

Go to [expo.dev](https://expo.dev/) and set up an Expo organization.

- Create an Expo Robot (e.g., `CI/CD`)
- Create an API key for the robot (e.g., `GH_ACTIONS`)
- In your GitHub repo, add a Repository Secret named `EXPO_TOKEN` with the API key as the value
- Create an EAS Project in Expo and initialize it in the `./mobile` directory:

```bash
npm install --global eas-cli
eas init --id {eas_uuid}
```

### 2. Set Up Error Logging and Crash Analytics

- Set up [Rollbar](https://rollbar.com/) and [Sentry](https://sentry.io/) for error/crash analytics.
- Retrieve API keys and DSNs for each environment.
- Set the `SENTRY_AUTH_TOKEN` in Expo under `Secrets`.

### 3. Set Environment Variables

- For local runs, set environment variables in the `.env` file (see `.env.example`).
- For builds, set environment variables in [eas.json](./eas.json).

#### Helper Script

Fill in the provided templates and run:

```bash
. scripts/setup_mobile_config.sh eas.json <FULL_PATH>/resources/eas.vars.txt
. scripts/setup_mobile_config.sh app.config.js <FULL_PATH>/resources/app.config.vars.txt
```

### 4. EAS Project Configuration

Edit [app.config.js](./app.config.js) with your Expo organization, slug, app IDs, and bundle identifiers.

### 5. Apple App Store & Google Play Store Setup

- Follow Expo and EAS documentation for credentials and provisioning profiles.
- Use `eas device:create` to register testing devices for internal builds.

### 6. Connecting to a Backend in Development

- Use your computer's LAN IP address in `.env` for `EXPO_PUBLIC_BACKEND_SERVER_URL`.
- Or use a tool like [ngrok](https://ngrok.com/) to expose your backend.

---

## Running the Mobile App in Docker

When running the Expo mobile app inside Docker, the Metro bundler and development server will be started for you by Docker. However, **starting the iOS Simulator or Android Emulator is a separate step** and must be done on your host machine.

### iOS Simulator

1. **Start the iOS Simulator**  
   Open Xcode, or run:
   ```sh
   open -a Simulator
   ```

2. **Install the app**  
   If you are using a custom dev client, run:
   ```sh
   npx expo run:ios
   ```
   This will build and install the app on the simulator.

### Android Emulator

1. **Start the Android Emulator**  
   Open Android Studio and start an emulator, or run:
   ```sh
   emulator -avd <your_avd_name>
   ```

2. **Install the app**  
   If you are using a custom dev client, run:
   ```sh
   npx expo run:android
   ```
   This will build and install the app on the emulator.

### Connecting to the Metro Bundler

- The Metro bundler runs inside Docker and is exposed on port `8081`.
- The simulator/emulator must be able to access your host's IP address on port `8081`.
- When prompted for a Metro server address in Expo Go or your dev client, use your host machine's IP address (e.g., `http://<host-ip>:8081`).

**Notes:**
- Expo cannot start the simulator/emulator for you when running in Docker. You must start it manually as described above.
- If you encounter connection issues, ensure your firewall allows traffic on port `8081` and that you are using the correct network mode (LAN or Tunnel) for your development setup.

---

## Tech Stack

- [Expo SDK](https://github.com/expo/expo)
- [React Navigation (v6)](https://github.com/react-navigation/react-navigation)
- [Navio](https://github.com/kanzitelli/rn-navio)
- [NativeWind](https://www.nativewind.dev/)
- [Reanimated 2](https://github.com/software-mansion/react-native-reanimated)
- [Zustand](https://github.com/pmndrs/zustand)
- [Flash List](https://github.com/Shopify/flash-list)
- [React Native Gesture Handler](https://github.com/kmagiera/react-native-gesture-handler)
- [TN Models FP](https://github.com/thinknimble/tn-models-fp)
- [Tanstack Query](https://github.com/TanStack/query)

---

## Additional Notes

- Use `tailwind.config.js` to define app styles.
- iOS Appstore connect API key, signing cert, and provisioning profiles are managed via Expo.
- All config variables for the various environments come from the `.env` file in the mobile directory.
- For native builds, use `npm run prebuild:local` to ensure your `.env` file is sourced.

---