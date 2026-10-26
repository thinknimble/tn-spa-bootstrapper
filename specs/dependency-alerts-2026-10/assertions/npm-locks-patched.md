---
id: npm-locks-patched
parent: dependency-alerts-2026-10
created: 2026-10-26T00:00:00Z
priority: 1
status: not_started
---

# Web and Mobile Locks Have the Patched Transitive Packages

## What Must Be True

The mobile `package-lock.json` resolves `undici` 7.30.1 or later in the 7.x line and `fast-uri` 3.1.9 or later in the 3.x line. The web `package-lock.json` resolves `@vitest/mocker` 4.1.12 or later.

## Success Criteria

- Mobile: the `undici` override floor is 7.30.1. `npm ls undici fast-uri` shows only patched versions.
- Web: `vitest` and `@vitest/mocker` are 4.1.12 or later. `npm ls @vitest/mocker` shows only patched versions.
- In rendered projects, the CI lint steps (`tsc`, `eslint`) pass for web and mobile, and `vitest run` passes for web.
