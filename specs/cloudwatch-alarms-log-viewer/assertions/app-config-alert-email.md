---
id: app-config-alert-email
parent: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# App Config: `monitoring.alert_email` Present Per Environment

`.github/app-config.json` includes a `monitoring.alert_email` key in each environment block.

## Success Criteria

- `production` and `staging` blocks have `"monitoring": { "alert_email": "alerts@mycompany.com" }`
- `pr-*` pattern, `main`, and `defaults` blocks have `"monitoring": { "alert_email": "" }` (disabled)
- JSON is valid (`jq . .github/app-config.json` succeeds)
