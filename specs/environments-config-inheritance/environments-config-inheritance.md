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
      "domain": {
        "base_domain": "",
        "use_custom_domain": false,
        "route53_zone_id": "",
        "certificate_arn": ""
      }
    },
    "staging": {
      "extends": "development",
      "role_arn": "arn:aws:iam::CHANGE-ME:role/github-actions-CHANGE-ME-staging"
    },
    "production": {
      "extends": "development",
      "role_arn": "arn:aws:iam::CHANGE-ME:role/github-actions-CHANGE-ME-production",
      "domain": {
        "use_custom_domain": true,
        "custom_domain": ""
      }
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

### Domain Model

Three modes, progressively configured:

1. **ALB DNS (default)** — all domain fields empty. App accessible at the raw AWS load balancer URL (`xxx.elb.amazonaws.com`). Zero setup, works out of the box.

2. **Wildcard subdomain** — fill in `base_domain`, `route53_zone_id`, and `certificate_arn` on `development` once. All environments inherit it via `extends`. Each environment auto-generates a subdomain: `myapp-development.apps.example.com`, `myapp-pr-123.apps.example.com`. The Route53 zone can be:
   - **TN-provided** — TN hosts a shared zone (e.g., `*.apps.thinknimble.com`) and provides the zone ID + wildcard cert to clients
   - **Client-provided** — client has their own AWS account with their own Route53 zone and wildcard cert
   - **CNAME to TN-hosted** — client creates a CNAME from their domain to a TN-hosted subdomain (like Heroku's `myapp.herokuapp.com` pattern)

3. **Custom domain (typically production)** — production overrides with `use_custom_domain: true` and `custom_domain: "app.customer.com"`. Client manages their own DNS (CNAME to ALB or to a wildcard subdomain). Terraform does not create Route53 records for custom domains.

The wildcard zone and cert are shared across all environments — they belong on `development` and get inherited. Only production typically diverges with its own custom domain.
