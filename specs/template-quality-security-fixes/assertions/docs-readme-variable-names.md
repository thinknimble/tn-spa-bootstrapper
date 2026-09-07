---
id: docs-readme-variable-names
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: done
branch: feature/aws-fargate
---

# Docs: README.md Variable Names Match Actual Terraform Variables

## What Must Be True

`README.md` documents the correct Terraform variable names. No documented variable names refer to variables that do not exist in `variables.tf`.

## Context

`README.md` lines 635-656 document `company_domain` and `use_custom_subdomain` variables that do not exist. The actual variables are `base_domain` and `use_custom_domain`. Users reading the README get incorrect variable names that produce Terraform errors.

## Success Criteria

- `README.md` does not reference `company_domain` -- uses `base_domain` instead
- `README.md` does not reference `use_custom_subdomain` -- uses `use_custom_domain` instead
- Every Terraform variable name mentioned in `README.md` exists in `variables.tf`
- Variable descriptions in `README.md` match the `description` fields in `variables.tf`
