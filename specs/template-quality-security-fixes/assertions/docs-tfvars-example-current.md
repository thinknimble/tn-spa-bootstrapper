---
id: docs-tfvars-example-current
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Docs: terraform.tfvars.example Uses Current Variable Names

## What Must Be True

`terraform.tfvars.example` uses variable names that match the current `variables.tf` declarations. No deprecated or renamed variable names appear in the example file.

## Context

`terraform.tfvars.example` lines 11-12 use `default_certificate_arn` and `custom_certificate_arn`, which are deprecated variable names. The current variable is `certificate_arn`. Users copying the example file get Terraform warnings or errors about unknown variables.

## Success Criteria

- `terraform.tfvars.example` does not contain `default_certificate_arn` or `custom_certificate_arn`
- `terraform.tfvars.example` uses `certificate_arn` (or whatever the current variable name is in `variables.tf`)
- Every variable name in `terraform.tfvars.example` exists in `variables.tf`
- `terraform plan` does not produce "unknown variable" warnings when using the example file as a starting point
