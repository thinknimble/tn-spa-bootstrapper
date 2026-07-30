---
id: tf-sns-topic-output
parent: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
status: not_started
depends-on: tf-alarms-gated-by-email
branch: feature/aws-fargate
---

# Terraform: `outputs.tf` Exports SNS Topic ARN

`terraform/outputs.tf` includes an `sns_alerts_topic_arn` output that returns the SNS topic ARN when alarms are enabled, or an empty string when disabled.

## Success Criteria

- Output block exists: `output "sns_alerts_topic_arn"` with a description
- Value uses conditional: `var.alert_email != "" ? aws_sns_topic.alerts[0].arn : ""`
- `terraform plan` succeeds with both `alert_email = ""` and `alert_email = "test@example.com"`
