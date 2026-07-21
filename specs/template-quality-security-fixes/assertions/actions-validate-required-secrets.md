---
id: actions-validate-required-secrets
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 1
status: draft
depends-on: actions-mask-secret-outputs
branch: feature/aws-fargate
---

# GitHub Actions: Required Secrets Are Validated as Present and Non-Null

## What Must Be True

`generate-terraform-vars/action.yml` validates that all required secret keys exist and are non-null in `secrets.json` before proceeding. The action fails with a clear error message if any required secret is missing or null, rather than silently passing the literal string "null" as a password.

## Context

Lines 80-82 use `jq -r .key` without `// empty` for required secrets. If a key is missing from `secrets.json`, `jq -r` outputs the literal string `null` which then becomes the actual password value. Lines 83-85 correctly use `// ""` for optional fields -- this inconsistency confirms the omission is an oversight, not intentional.

## Success Criteria

- All required secret keys (`django_secret_key`, `db_password`, `django_superuser_password`) are validated as present and non-null before use
- If any required secret is missing from `secrets.json`, the action fails with exit code 1 and a clear error message naming the missing key
- If any required secret has a JSON `null` value, the action fails with exit code 1 and a clear error message
- The literal string `"null"` is never passed as a secret value to any downstream step
- Optional fields continue to use `// ""` or `// empty` fallback behavior
