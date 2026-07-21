---
id: actions-mask-secret-outputs
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 1
status: not_started
branch: feature/aws-fargate
---

# GitHub Actions: All Secret Values Are Masked Before Writing to GITHUB_OUTPUT

## What Must Be True

`generate-terraform-vars/action.yml` masks every secret value with `::add-mask::` before writing it to `$GITHUB_OUTPUT`. No secret value (passwords, keys, tokens) is ever visible in plain text in GitHub Actions logs.

## Context

Lines 80-87 of `generate-terraform-vars/action.yml` write `django_secret_key`, `db_password`, `django_superuser_password`, and other secrets to `$GITHUB_OUTPUT` without calling `::add-mask::` first. If any step prints these output values (even accidentally), they appear in plain text in the build logs.

## Success Criteria

- Every secret value extracted from `secrets.json` is masked with `echo "::add-mask::$value"` before being written to `$GITHUB_OUTPUT`
- At minimum, the following outputs are masked: `django_secret_key`, `db_password`, `django_superuser_password`, and any other credential/token values
- Secret values do not appear in plain text in GitHub Actions log output for any workflow run
- Masking occurs immediately after the value is read from `secrets.json`, before any other use
