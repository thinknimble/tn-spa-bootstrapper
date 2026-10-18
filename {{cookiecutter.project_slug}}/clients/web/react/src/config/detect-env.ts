// Resolves the current environment at runtime from the browser hostname.
//
// Django serves one static bundle per environment, and a project may promote a
// single Heroku slug across environments, so the environment must be detected at
// runtime rather than baked in with a `VITE_` build var (which would freeze one
// environment's value into a shared bundle).
//
// Hostnames follow the Heroku naming the bootstrapper deploys with (see
// `.env.local.example`). Set your real production domain below once the app has
// one; until then a project served from `<slug>.herokuapp.com` still resolves.
export type AppEnv = 'local' | 'review' | 'staging' | 'production' | 'unknown'

export function detectEnv(hostname: string): AppEnv {
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.localhost')
  ) {
    return 'local'
  }
  if (hostname === '{{ cookiecutter.project_slug }}-staging.herokuapp.com') {
    return 'staging'
  }
  // Heroku review apps: `<slug>-pr-<number>.herokuapp.com`.
  if (/^{{ cookiecutter.project_slug }}-pr-\d+\.herokuapp\.com$/.test(hostname)) {
    return 'review'
  }
  // TODO: replace with your production domain(s) once the app is live.
  if (hostname === '{{ cookiecutter.project_slug }}.herokuapp.com') {
    return 'production'
  }
  return 'unknown'
}

export const currentEnv: AppEnv = detectEnv(
  typeof window !== 'undefined' ? window.location.hostname : '',
)
