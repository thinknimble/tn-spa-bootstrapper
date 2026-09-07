---
id: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
---

# CloudWatch Alarms + LogViewer IAM Role

## Problem

Heroku projects get Papertrail (log aggregation + alerting) out of the box. The Terraform/Fargate setup has CloudWatch Logs flowing but no alarms -- the team only finds out about issues by checking Rollbar or manually inspecting CloudWatch. There is no way for developers to view logs without AWS Console access.

## Solution

**Part 1 (this repo):** Add essential CloudWatch alarms with SNS email notifications. All alarm resources are gated by a single `alert_email` variable -- zero cost and zero resources when unconfigured. Five alarms cover the critical failure modes: ALB 5xx, application 5xx, CPU saturation, memory saturation, and unhealthy targets.

**Part 2 (tn-cli repo):** Add an `aws-setup-log-viewer` command that creates a read-only IAM group scoped to `/ecs/${service}/*` log groups. Group-based (not role-based) for simplicity with human users. Includes Log Insights query permissions for ad-hoc searching.

## Constraints

- Part 1 assertions live in this repo on `feature/aws-fargate`
- Part 2 lives in the `tn-cli` repo (separate spec)
- All alarm resources use `count = var.alert_email != "" ? 1 : 0` gating
- SNS email subscriptions require manual confirmation by the recipient
- Alarm dimensions reference existing resources: `aws_lb.ecs`, `aws_lb_target_group.app`, `aws_ecs_cluster.main`, `aws_ecs_service.app`
