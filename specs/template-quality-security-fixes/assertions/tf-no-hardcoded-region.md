---
id: tf-no-hardcoded-region
parent: template-quality-security-fixes
created: 2026-07-21T00:00:00Z
priority: 3
status: not_started
branch: feature/aws-fargate
---

# Terraform: No Hardcoded us-east-1 Region in Resource Configurations

## What Must Be True

All `.tf` files under `terraform/` use `var.region` or a data source for AWS region references. No subnet filters, log configurations, or other resource attributes contain a hardcoded `us-east-1` string.

## Context

`main.tf` lines 59 and 69, `app.tf` line 152, and `worker/main.tf` line 25 hardcode `us-east-1` in subnet availability zone filters and CloudWatch log configurations. Deploying to any other AWS region breaks these resources silently or with confusing errors.

## Success Criteria

- No `.tf` file under `terraform/` contains the literal string `us-east-1` in resource or data source blocks
- Subnet availability zone filters use `var.region` or `data.aws_region.current` with appropriate suffix patterns
- CloudWatch log group region references use `var.region` or `data.aws_region.current`
- `terraform plan` succeeds when `var.region` is set to a non-us-east-1 value (e.g., `us-west-2`)
- Provider-level region configuration (if any) is excluded from this check -- only resource/data blocks
