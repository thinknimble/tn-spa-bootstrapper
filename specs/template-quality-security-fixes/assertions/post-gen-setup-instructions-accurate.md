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

- Post-gen instructions reference `tn` (or `just`) commands in correct dependency order: VPC → TF backend → OIDC → secrets bucket → environments.json → repo variables → edit secrets → push secrets
- No mention of `DEV_AWS_ROLE_ARN`, `STAGING_AWS_ROLE_ARN`, `PROD_AWS_ROLE_ARN` as GitHub variables (role ARNs go in `environments.json`)
- GitHub repo variables listed are only those actually used by the workflow: `SERVICE_NAME`, `ECR_REPOSITORY_NAME`, `AWS_ACCOUNT_ID`
- Instructions mention updating `.github/environments.json` with `account_id`, `role_arn`, `secrets_bucket`, and `region` from provisioning output
- Instructions mention using `secrets-sync.sh push <environment>` to upload secrets after editing
- Each step indicates what output feeds into the next step (e.g., "OIDC setup outputs the role_arn for environments.json")
