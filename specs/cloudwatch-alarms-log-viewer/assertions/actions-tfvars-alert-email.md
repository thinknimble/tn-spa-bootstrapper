---
id: actions-tfvars-alert-email
parent: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
status: done
depends-on: app-config-alert-email
branch: feature/aws-fargate
---

# GitHub Actions: `generate-terraform-vars` Reads `alert_email` from App Config

`.github/actions/generate-terraform-vars/action.yml` extracts `monitoring.alert_email` from app-config and writes it to the generated tfvars file.

## Success Criteria

- In the "Retrieve app configuration" step: extracts `alert_email` via `jq -r '.monitoring.alert_email // ""'` and writes to `$GITHUB_OUTPUT`
- The `else` (fallback) branch also sets `alert_email=` (empty default)
- In the "Generate terraform.tfvars" step: writes `alert_email = "${{ steps.app-config.outputs.alert_email }}"` to the tfvars file
- Generated tfvars includes `alert_email` line when the action runs
