// Upload the production JS source maps to Rollbar, then delete them from dist/ so
// collectstatic/WhiteNoise never serve them publicly.
//
// Runs after `vite build` in every bundle-serving build path (the AWS Dockerfile
// and Heroku's heroku-postbuild). Reads two env vars:
//   SOURCE_VERSION            git SHA; must equal the client's code_version so the
//                             uploaded maps resolve (see src/config/rollbar.ts).
//   ROLLBAR_SOURCEMAP_TOKENS  one or more Rollbar post_server_item tokens (secret,
//                             NOT the public post_client_item tokens in the bundle),
//                             separated by commas/whitespace. One per Rollbar
//                             project this build can report to.
//
// Why a LIST of tokens: on Heroku a single slug is built once (at staging) and
// *promoted* unchanged to production. The bundle resolves its post_client_item
// token at runtime by hostname (src/config/detect-env.ts), so that one slug reports
// to the staging project on staging and the production project on production. Those
// are separate projects and source maps are stored per project, so the build must
// upload the maps — tagged with the one code_version baked into the slug — to
// *every* project it can report to, or production traces stay minified after a
// promote. (AWS rebuilds a fresh image per environment, so there it strictly only
// needs that environment's token; passing the full list simply also seeds the
// other projects, which is harmless.)
//
// If no token / SOURCE_VERSION is set (local builds, PRs) the upload is skipped,
// but the maps are deleted anyway — stripping them is the security fix and must
// happen regardless of whether the upload ran.
import { readdir, readFile, unlink } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DIST = 'dist'
// Must match `vite build --base=` in package.json: the public URL path of the
// assets, i.e. how the browser requests them (and thus how Rollbar keys maps).
const BASE = '/static/'
const ENDPOINT = 'https://api.rollbar.com/api/1/sourcemap'

const tokens = (process.env.ROLLBAR_SOURCEMAP_TOKENS ?? process.env.ROLLBAR_SOURCEMAP_TOKEN ?? '')
  .split(/[\s,]+/)
  .filter(Boolean)
const version = process.env.SOURCE_VERSION ?? ''

async function findMaps(dir) {
  const maps = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) maps.push(...(await findMaps(full)))
    else if (entry.name.endsWith('.js.map')) maps.push(full)
  }
  return maps
}

async function uploadToProject(token, projectLabel) {
  for (const mapPath of maps) {
    // dist/assets/index-abc.js.map -> assets/index-abc.js
    const minifiedRel = relative(DIST, mapPath).replace(/\.map$/, '')
    // "dynamichost" is Rollbar's wildcard host: one upload matches every domain the
    // same build is promoted to (review / staging / production / custom domain).
    const minifiedUrl = `https://dynamichost${BASE}${minifiedRel}`

    const form = new FormData()
    form.set('access_token', token)
    form.set('version', version)
    form.set('minified_url', minifiedUrl)
    form.set('source_map', new Blob([await readFile(mapPath)]), `${minifiedRel}.map`)

    const res = await fetch(ENDPOINT, { method: 'POST', body: form })
    if (!res.ok) {
      throw new Error(
        `[sourcemaps] Rollbar upload failed for ${minifiedUrl} (${projectLabel}): ${res.status} ${await res.text()}`,
      )
    }
  }
  console.log(`[sourcemaps] uploaded ${maps.length} map(s) to ${projectLabel} (version ${version})`)
}

const maps = await findMaps(DIST).catch(() => [])
if (maps.length === 0) {
  console.log('[sourcemaps] none found in dist/, nothing to do')
  process.exit(0)
}

if (tokens.length === 0 || !version) {
  const missing = tokens.length === 0 ? 'ROLLBAR_SOURCEMAP_TOKENS' : 'SOURCE_VERSION'
  console.warn(
    `[sourcemaps] ${missing} not set — skipping Rollbar upload; deleting ${maps.length} map(s) so they are not served`,
  )
} else {
  // Upload sequentially per project; one map set, N project stores.
  for (const [i, token] of tokens.entries()) {
    await uploadToProject(token, `project ${i + 1}/${tokens.length}`)
  }
}

// Always strip the maps so they never reach collectstatic / WhiteNoise.
await Promise.all(maps.map((m) => unlink(m)))
console.log(`[sourcemaps] removed ${maps.length} map file(s) from dist/`)
