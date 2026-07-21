---
id: tf-rollbar-secret-injected-or-removed
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Terraform: Rollbar Token Is Either Injected Into Container or Resource Is Removed

## What Must Be True

The Rollbar token Secrets Manager resource in `secrets.tf` is either (a) injected into the ECS container definition via the `secrets` block in `app.tf`, or (b) removed entirely along with the corresponding variable declaration. No dead Secrets Manager resources exist that are created but never consumed.

## Context

`secrets.tf` lines 66-75 create a Rollbar token in Secrets Manager and `variables.tf` declares the corresponding variable, but `app.tf` container definition never references or injects this secret. The resource is provisioned on every deploy, incurring cost, but is never used by the application.

## Success Criteria

- One of the following is true:
  - The Rollbar token Secrets Manager resource is referenced in `app.tf`'s container definition `secrets` block with the environment variable `ROLLBAR_TOKEN` (or equivalent), OR
  - The Rollbar token resource is removed from `secrets.tf`, and the corresponding variable is removed from `variables.tf`
- No Secrets Manager resource exists in `secrets.tf` that is not referenced by at least one container definition
- `terraform validate` passes after the change
