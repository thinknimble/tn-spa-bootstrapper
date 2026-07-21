---
id: post-gen-setup-instructions-accurate
parent: template-quality-security-fixes
created: 2026-07-21T21:00:00Z
priority: 2
status: not_started
branch: feature/aws-fargate
---

# Post-Gen Hook: Terraform Setup Instructions Match Actual Workflow

## What Must Be True

When `deployment_option` is `Terraform (AWS)`, the post-gen hook prints setup instructions that match the actual infrastructure provisioning flow using `tn`/`just` commands and `environments.json`.

## Context

The current post-gen hook output references stale setup steps:
- Says to set `DEV_AWS_ROLE_ARN`, `STAGING_AWS_ROLE_ARN`, `PROD_AWS_ROLE_ARN` as separate GitHub variables, but the deploy workflow reads `role_arn` from `.github/environments.json`
- Doesn't mention `aws-setup-vpc`, `aws-tf-setup-backend`, or `aws-setup-secrets` commands
- Lists steps out of dependency order (e.g., "set role ARNs" before explaining where they come from)
- Doesn't mention pushing secrets with `secrets-sync.sh push`

## Success Criteria

- Post-gen instructions reference `tn` (or `just`) commands in correct dependency order: VPC → TF setup-backend → TF init-backend (per-env) → secrets bucket (per-env) → OIDC (per-env, with `secrets_bucket` param) → environments.json → repo variables → edit secrets → push secrets (per-env)
- `aws-setup-oidc` must be called with the `secrets_bucket` parameter (e.g., `secrets_bucket='<service>-terraform-secrets'`) so the OIDC role includes the S3 secrets access policy. The secrets bucket must be created before OIDC setup so the bucket exists when the policy is attached.
- No mention of `DEV_AWS_ROLE_ARN`, `STAGING_AWS_ROLE_ARN`, `PROD_AWS_ROLE_ARN` as GitHub variables (role ARNs go in `environments.json`)
- GitHub repo variables listed are only those actually used by the workflow: `SERVICE_NAME`, `ECR_REPOSITORY_NAME`, `AWS_ACCOUNT_ID`
- Instructions mention updating `.github/environments.json` with `account_id`, `role_arn`, `secrets_bucket`, and `region` from provisioning output
- Instructions mention using `secrets-sync.sh push <environment>` to upload secrets after editing
- Each step indicates what output feeds into the next step (e.g., "OIDC setup outputs the role_arn for environments.json")
- Instructions include a **placeholder key** explaining each parameter:
  - `<service>` — kebab-case project name used to namespace AWS resources (e.g., `my-project`). Same value as `SERVICE_NAME` GitHub variable and `sanitized_tf_service_name` from cookiecutter.
  - `<github_org>` — GitHub organization name that owns the repository (e.g., `thinknimble`)
  - `<environment>` — target environment name: `development`, `staging`, or `production`
  - `<profile>` — AWS CLI profile name (defaults to `default`)
  - `<region>` — AWS region (defaults to `us-east-1`)
  - `<secrets_bucket>` — S3 bucket for secrets storage, conventionally `<service>-terraform-secrets` (created by `aws-setup-secrets`)
- Per-environment commands (init-backend, OIDC, secrets bucket, edit secrets, push secrets) explicitly state they must be run **once per environment** (development, staging, production) and show all three invocations as examples
