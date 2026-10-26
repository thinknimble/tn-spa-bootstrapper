---
id: zod-4-clients
parent: dependency-alerts-2026-10
created: 2026-10-26T00:00:00Z
priority: 2
status: not_started
depends-on: npm-locks-patched
---

# Web and Mobile Clients Use zod 4

## What Must Be True

The web and mobile clients depend on `zod` 4.6.6 or later. All zod 3 versions are in the vulnerable range of GHSA-mrhx-c7xc-m3w5, thus a major update is the only fix. `@thinknimble/tn-models` 5 is the first version that supports zod 4 (peer `zod@^4.0.0`), thus it moves too.

## Context

The clients use zod only through simple shapes (`z.string().uuid()`, `.email()`, `.datetime()`, `.readonly()`, `z.array`) and the `tn-models` helpers. zod 4 keeps these calls.

## Success Criteria

- `zod` >= 4.6.6 and `@thinknimble/tn-models` >= 5.0.1 in both client `package.json` files and locks. `npm ls zod` shows one zod version.
- In rendered projects, the CI lint steps (`tsc`, `eslint`) pass for web and mobile, and `vitest run` passes for web.
- A runtime check of a `tn-models` custom call converts the request to snake case and the response to camel case, the same as before the update.
