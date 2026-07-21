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

```json
{
  "environments": {
    "development": {
      "account": "dev",
      "account_id": "123456789012",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::123456789012:role/github-actions-myapp-development",
      "secrets_bucket": "myapp-terraform-secrets",
      "domain": { "..." : "full domain config" }
    },
    "staging": {
      "extends": "production",
      "role_arn": "arn:aws:iam::345678901234:role/github-actions-myapp-staging",
      "domain": { "use_custom_domain": false }
    },
    "production": {
      "account": "prod",
      "account_id": "345678901234",
      "region": "us-east-1",
      "role_arn": "arn:aws:iam::345678901234:role/github-actions-myapp-production",
      "secrets_bucket": "myapp-terraform-secrets",
      "domain": { "..." : "full domain config" }
    }
  },
  "patterns": {
    "pr-*": { "extends": "development" },
    "main": { "extends": "development" }
  },
  "defaults": { "extends": "development" }
}
```
