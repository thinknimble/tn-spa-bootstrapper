---
id: tf-alert-email-variable
parent: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# Terraform: `alert_email` Variable Declared with Empty Default

`terraform/variables.tf` declares a variable `alert_email` of type `string` with `default = ""`.

## Success Criteria

- Variable block exists in `variables.tf` with `type = string`, `default = ""`, and a description indicating that leaving it empty disables alarms
- `terraform validate` passes with no value provided for `alert_email`
