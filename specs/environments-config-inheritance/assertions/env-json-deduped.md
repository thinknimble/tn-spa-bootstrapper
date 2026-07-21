---
id: env-json-deduped
parent: environments-config-inheritance
created: 2026-07-21T22:00:00Z
priority: 2
status: not_started
depends-on: env-config-extends-resolution
branch: feature/aws-fargate
---

# Template environments.json uses extends to eliminate duplication

## What Must Be True

The template `environments.json` uses the `extends` keyword so that no config block is a wholesale copy of another. Patterns and defaults inherit from named environments and only specify overrides.

## Success Criteria

- `patterns.pr-*` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `patterns.main` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `defaults` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `environments.staging` uses `"extends": "production"` and only overrides `role_arn` and any domain fields that differ from production
- Each named environment that is fully self-contained (`development`, `production`) has all required fields inline — no `extends`
- The template's placeholder values (`123456789012`, `345678901234`, etc.) remain as setup-time markers
- `role_arn` values in the template use the per-project-per-env naming convention: `github-actions-<service>-<environment>`
