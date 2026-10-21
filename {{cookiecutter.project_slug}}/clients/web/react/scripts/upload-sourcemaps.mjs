// Upload the production JS source maps to Rollbar, then delete them from dist/ so
// collectstatic/WhiteNoise never serve them publicly.
//
// Runs after `vite build` in every bundle-serving build path (the AWS Dockerfile
// and Heroku's heroku-postbuild). Reads two env vars:
//   SOURCE_VERSION           git SHA; must equal the client's code_version so the
//                            uploaded maps resolve (see src/config/rollbar.ts).
//   ROLLBAR_SOURCEMAP_TOKEN  a Rollbar post_server_item token (server-side secret,
//                            NOT the public post_client_item token in the bundle).
//
// If either is missing (local builds, PRs with no token) the upload is skipped,
// but the maps are deleted anyway — stripping them is the security fix and must
// happen regardless of whether the upload ran.
import { readdir, readFile, unlink } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DIST = 'dist'
// Must match `vite build --base=` in package.json: the public URL path of the
// assets, i.e. how the browser requests them (and thus how Rollbar keys maps).
const BASE = '/static/'
const ENDPOINT = 'https://api.rollbar.com/api/1/sourcemap'

const token = process.env.ROLLBAR_SOURCEMAP_TOKEN ?? ''
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

const maps = await findMaps(DIST).catch(() => [])
if (maps.length === 0) {
  console.log('[sourcemaps] none found in dist/, nothing to do')
  process.exit(0)
}

if (!token || !version) {
  const missing = !token ? 'ROLLBAR_SOURCEMAP_TOKEN' : 'SOURCE_VERSION'
  console.warn(
    `[sourcemaps] ${missing} not set — skipping Rollbar upload; deleting ${maps.length} map(s) so they are not served`,
  )
} else {
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
        `[sourcemaps] Rollbar upload failed for ${minifiedUrl}: ${res.status} ${await res.text()}`,
      )
    }
    console.log(`[sourcemaps] uploaded ${minifiedRel} (version ${version})`)
  }
}

// Always strip the maps so they never reach collectstatic / WhiteNoise.
await Promise.all(maps.map((m) => unlink(m)))
console.log(`[sourcemaps] removed ${maps.length} map file(s) from dist/`)
