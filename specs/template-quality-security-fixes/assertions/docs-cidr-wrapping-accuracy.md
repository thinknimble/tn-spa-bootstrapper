---
id: docs-cidr-wrapping-accuracy
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: done
depends-on: tf-cidr-bounds-no-collision
branch: feature/aws-fargate
---

# Docs: README.md CIDR Wrapping Description Matches Implementation

## What Must Be True

`README.md` description of PR environment CIDR allocation accurately reflects the actual implementation in `locals.tf`. If wrapping logic exists, the docs describe it correctly. If no wrapping exists, the docs do not claim it does.

## Context

`README.md` lines 169-171 claim the CIDR calculation "wraps to 255 for large PR numbers," but no wrapping logic exists in `locals.tf`. The docs describe behavior that is not implemented. This assertion depends on `tf-cidr-bounds-no-collision` -- once the wrapping logic is actually implemented, the docs must be updated to match.

## Success Criteria

- `README.md` CIDR allocation description matches the actual logic in `locals.tf`
- If `locals.tf` uses modulo wrapping, the docs describe the modulo and the valid range
- If `locals.tf` uses a different strategy, the docs describe that strategy
- The docs mention which octets are reserved for named environments (dev, staging, production) and that PR environments avoid them
- No documentation claims behavior that the code does not implement
