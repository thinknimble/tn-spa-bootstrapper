---
id: env-json-deduped
parent: environments-config-inheritance
created: 2026-07-21T22:00:00Z
priority: 2
status: done
depends-on: env-config-extends-resolution
branch: feature/aws-fargate
---

# Template environments.json uses extends to eliminate duplication

## What Must Be True

The template `environments.json` uses the `extends` keyword so that no config block is a wholesale copy of another. Patterns and defaults inherit from named environments and only specify overrides.

## Success Criteria

**Inheritance structure:**
- `patterns.pr-*` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `patterns.main` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `defaults` uses `"extends": "development"` with no other fields (or only fields that genuinely differ)
- `environments.staging` uses `"extends": "development"` and only overrides `role_arn`
- `environments.production` uses `"extends": "development"` and only overrides `role_arn` and domain fields (`use_custom_domain`, `custom_domain`)

**Single-account default:**
- Template defaults to a **single AWS account** — `development` is the only fully self-contained entry with all fields inline (`account_id`, `region`, `secrets_bucket`, `domain`)
- No separate `account_id` for staging/production by default — users who need multi-account add `account_id` overrides later

**Domain inheritance:**
- Domain config (`base_domain`, `route53_zone_id`, `certificate_arn`) is defined once on `development` and inherited by all environments via `extends`
- Default domain fields are all empty strings / false — the "ALB DNS only" mode works with zero domain setup
- Only `production` overrides domain with `use_custom_domain: true` and `custom_domain: ""` (client fills in their domain)
- Wildcard subdomain mode is enabled by filling in `base_domain`, `route53_zone_id`, and `certificate_arn` on `development` — all environments inherit it automatically

**Placeholder values:**
- The template uses `CHANGE-ME` markers (not fake account IDs like `123456789012`) to make it obvious what needs to be filled in
- `role_arn` values use the per-project-per-env naming convention: `github-actions-<service>-<environment>`
