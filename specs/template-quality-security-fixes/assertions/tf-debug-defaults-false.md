---
id: tf-debug-defaults-false
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Terraform: debug Variable Defaults to False

## What Must Be True

`variables.tf` declares the `debug` variable with a default value of `"False"` (or `false` if typed as bool). Production deployments that do not explicitly set `debug` run with Django debug mode disabled.

## Context

`variables.tf` lines 72-76 default `debug` to `"True"`. Any production deployment that omits this variable gets Django debug mode enabled, which exposes detailed error pages, stack traces, and potentially sensitive configuration to end users.

## Success Criteria

- The `debug` variable in `variables.tf` has a default value that results in Django debug mode being disabled
- A production `terraform apply` that does not explicitly set `debug` results in `DEBUG=False` in the container environment
- Development/PR environments can still override `debug` to `"True"` via `terraform.tfvars` or the deploy workflow
