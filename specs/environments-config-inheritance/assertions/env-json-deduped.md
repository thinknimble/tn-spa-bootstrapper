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
- Template defaults to a **single AWS account** for all environments — `development` is the only fully self-contained entry with all fields inline (`account_id`, `region`, `secrets_bucket`, `domain`)
- `environments.staging` uses `"extends": "development"` and only overrides `role_arn` (and any domain fields that differ)
- `environments.production` uses `"extends": "development"` and only overrides `role_arn` and domain fields (e.g., `use_custom_domain`, `custom_domain`)
- No separate `account_id` for staging/production by default — users who need multi-account can add `account_id` overrides to those entries later
- The template's placeholder values use `CHANGE-ME` markers (not fake account IDs like `123456789012`) to make it obvious what needs to be filled in
- `role_arn` values in the template use the per-project-per-env naming convention: `github-actions-<service>-<environment>`
