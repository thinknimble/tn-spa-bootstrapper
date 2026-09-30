import Rollbar, { type Configuration } from 'rollbar'
import { currentEnv } from './detect-env'

// Django serves a single static build per environment, and a project may promote
// one slug across environments, so config is resolved at runtime by hostname (via
// currentEnv) rather than a VITE_ build var, which would bake one environment's
// value into a shared bundle.
//
// The token here is a Rollbar post_client_item token: it can only *create* items,
// so it is not a secret and is safe to embed in the public bundle. Paste the
// per-env tokens below; `local` and `unknown` have none, so they stay silent.
const envTokens: Record<string, string> = {
  staging: '',
  production: '',
}

const accessToken = envTokens[currentEnv] ?? ''

// Baked at build time from Heroku's SOURCE_VERSION (git SHA); see vite.config.ts.
// Identifies the build, not the environment, so a single value across envs is
// correct. Must match the code_version used when uploading source maps to Rollbar.
const codeVersion = __APP_VERSION__

export const isRollbarEnabled = Boolean(accessToken)

export const rollbarConfig: Configuration = {
  accessToken,
  environment: currentEnv,
  enabled: isRollbarEnabled,
  // Global handlers catch what React's ErrorBoundary can't (async, event handlers).
  captureUncaught: true,
  captureUnhandledRejections: true,
  // Collapse identical errors fired in a tight loop into one item.
  ignoreDuplicateErrors: true,
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: codeVersion,
        // Let Rollbar reconstruct frames for errors missing a stack.
        guess_uncaught_frames: true,
      },
    },
  },
}

// Single shared instance. The @rollbar/react Provider and the axios interceptor
// both use this one — two instances would each own the global uncaught/
// unhandledrejection handlers and double-report every such error.
export const rollbar = new Rollbar(rollbarConfig)
