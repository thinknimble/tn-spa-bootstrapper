---
id: tf-bool-typed-variables
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: draft
branch: feature/aws-fargate
---

# Terraform: Boolean Variables Use type = bool, Not type = string

## What Must Be True

`variables.tf` declares `use_aws_storage` and `enable_emails` with `type = bool` and boolean default values, not `type = string` with string `"false"`.

## Context

`variables.tf` lines 113-118 and 132-136 declare `use_aws_storage` and `enable_emails` as `type = string` with default `false` (an unquoted boolean assigned to a string-typed variable). This is a Terraform anti-pattern: HCL silently coerces the boolean to string `"false"`, and conditional expressions using these variables may behave unexpectedly because `"false"` is truthy as a string.

## Success Criteria

- `use_aws_storage` is declared with `type = bool` and `default = false`
- `enable_emails` is declared with `type = bool` and `default = false`
- All references to these variables in `.tf` files work correctly with boolean values (no string comparison like `== "true"`)
- `terraform validate` passes with the updated types
