---
id: server-static-path-matches-dockerfile
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: done
branch: feature/aws-fargate
---

# Server Entrypoint: Static File Path Matches Dockerfile Layout

## What Must Be True

`compose/server/tf/start` checks for the client build output at the same path where the Dockerfile places it. The `collectstatic` step correctly finds and collects frontend assets.

## Context

`compose/server/tf/start` line 8 checks for `/app/client/dist` but the Dockerfile places frontend files at `/client/dist`. Because the path does not match, the check silently fails and `collectstatic` skips frontend assets, resulting in missing static files in production.

## Success Criteria

- The path checked in `compose/server/tf/start` matches the path where the Dockerfile copies client build output
- `collectstatic` finds and processes frontend static files when they exist
- The entrypoint does not silently skip static file collection due to a path mismatch
