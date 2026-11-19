---
id: dependency-alerts-2026-10
created: 2026-10-26T00:00:00Z
priority: 1
---

# Dependency Alerts, October 2026

## Problem

Dependabot shows open security alerts on the lock files of the template. Some of these alerts have no fix pull request. A project that a team generates from the template starts with the vulnerable versions.

## Scope

This spec covers the alerts that have no other open pull request: `opentelemetry-api` and `fastmcp-slim` in the template `uv.lock`, `undici` and `fast-uri` in the mobile lock, `@vitest/mocker` in the web lock, and `zod` in the web and mobile locks.

Each package moves to its first patched version, or to the smallest safe later version. The lock files are regenerated with the tools of the repository (`uv lock`, `npm install`). No other package moves unless the update requires it.

## Out of Scope

- Packages that have their own open fix pull request.
- `Twisted` and `node-forge`. They have no stable patched version.
- `my_project/uv.lock`. That file is not in the repository. CI renders it from the template.
