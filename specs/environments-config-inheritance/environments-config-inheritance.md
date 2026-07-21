---
id: environments-config-inheritance
created: 2026-07-21T22:00:00Z
priority: 2
---

# Environments Config Inheritance

## What Must Be True

`environments.json` supports an `extends` keyword so that patterns, defaults, and similar environments can inherit from a base environment and only override what differs. No config entry duplicates another entry wholesale.

## Context

The current `environments.json` template has massive duplication:
- `patterns.pr-*` is a 100% copy of `environments.development`
- `patterns.main` is a 100% copy of `environments.development`
- `defaults` is a 100% copy of `environments.development`
- `staging` and `production` share `account_id`, `region`, `secrets_bucket`

Changing a value (e.g., `account_id`) requires updating it in up to 5 places. This is error-prone during initial setup and ongoing maintenance.

The `extends` keyword follows the same pattern as `tsconfig.json`, Docker Compose, and ESLint — explicit about what's being inherited. `get-env-config.sh` resolves the chain via jq deep merge (`*` operator).

### Target Shape

The template defaults to a **single AWS account** for all environments. Most projects start this way — separate accounts are an optimization that can be added later by overriding `account_id` and `role_arn` on specific environments.

```json
{
  "environments": {
    "development": {
      "account_id": "CHANGE-ME",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::CHANGE-ME:role/github-actions-CHANGE-ME-development",
      "secrets_bucket": "CHANGE-ME-terraform-secrets",
      "domain": { "..." : "full domain config" }
    },
    "staging": {
      "extends": "development",
      "role_arn": "arn:aws:iam::CHANGE-ME:role/github-actions-CHANGE-ME-staging"
    },
    "production": {
      "extends": "development",
      "role_arn": "arn:aws:iam::CHANGE-ME:role/github-actions-CHANGE-ME-production",
      "domain": { "use_custom_domain": true, "custom_domain": "CHANGE-ME.com" }
    }
  },
  "patterns": {
    "pr-*": { "extends": "development" },
    "main": { "extends": "development" }
  },
  "defaults": { "extends": "development" }
}
```

With this shape, initial setup requires filling in `development` only — staging and production inherit everything except their role ARN.
