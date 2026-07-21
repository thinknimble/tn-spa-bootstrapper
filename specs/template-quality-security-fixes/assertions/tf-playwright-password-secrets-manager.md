---
id: tf-playwright-password-secrets-manager
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 1
status: not_started
branch: feature/aws-fargate
---

# Terraform: PLAYWRIGHT_TEST_USER_PASS Uses Secrets Manager, Not Plain Environment

## What Must Be True

`app.tf` injects `PLAYWRIGHT_TEST_USER_PASS` via the ECS task definition `secrets` block (using a Secrets Manager ARN) rather than the plain `environment` block. All sensitive values marked `sensitive = true` in `variables.tf` are consistently delivered through Secrets Manager.

## Context

`app.tf` lines 107-110 pass `PLAYWRIGHT_TEST_USER_PASS` as a plain `environment` variable despite `variables.tf` marking it `sensitive = true`. Other secrets in the same container definition correctly use the `secrets` block with Secrets Manager ARNs. This means the Playwright password appears in the ECS task definition JSON in plain text and is visible in the AWS Console.

## Success Criteria

- `PLAYWRIGHT_TEST_USER_PASS` is not present in any `environment` block in `app.tf`
- `PLAYWRIGHT_TEST_USER_PASS` is injected via the `secrets` block using a Secrets Manager ARN, consistent with other sensitive values
- A corresponding Secrets Manager resource or data source exists for the Playwright password
- `terraform plan` produces no errors related to the Playwright password configuration
- No variable marked `sensitive = true` in `variables.tf` is passed via a plain `environment` block in any ECS task definition
