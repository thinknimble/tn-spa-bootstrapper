---
id: tf-alarms-gated-by-email
parent: cloudwatch-alarms-log-viewer
created: 2026-07-30T17:00:00Z
priority: 1
status: done
depends-on: tf-alert-email-variable
branch: feature/aws-fargate
---

# Terraform: `alarms.tf` Contains SNS Topic + 5 CloudWatch Alarms, Gated by `alert_email`

`terraform/alarms.tf` exists and contains all alarm and SNS resources. Every resource uses `count = var.alert_email != "" ? 1 : 0` so that zero resources are created when `alert_email` is empty.

## Resources

1. `aws_sns_topic.alerts` -- named `${var.service}-${var.environment}-alerts`
2. `aws_sns_topic_subscription.email` -- email protocol subscription to the topic
3. `aws_cloudwatch_metric_alarm.alb_5xx` -- ALB 5xx errors >= 10 in 5 min
   - Metric: `AWS/ApplicationELB` / `HTTPCode_ELB_5XX_Count`
   - Dimension: `LoadBalancer = aws_lb.ecs.arn_suffix`
   - `treat_missing_data = "notBreaching"`
4. `aws_cloudwatch_metric_alarm.target_5xx` -- App 5xx errors >= 10 in 5 min
   - Metric: `AWS/ApplicationELB` / `HTTPCode_Target_5XX_Count`
   - Dimensions: `TargetGroup = aws_lb_target_group.app.arn_suffix`, `LoadBalancer = aws_lb.ecs.arn_suffix`
   - `treat_missing_data = "notBreaching"`
5. `aws_cloudwatch_metric_alarm.ecs_cpu` -- CPU >= 85% for 10 min (2 x 300s periods)
   - Metric: `AWS/ECS` / `CPUUtilization`
   - Dimensions: `ClusterName = aws_ecs_cluster.main.name`, `ServiceName = aws_ecs_service.app.name`
6. `aws_cloudwatch_metric_alarm.ecs_memory` -- Memory >= 85% for 10 min (2 x 300s periods)
   - Metric: `AWS/ECS` / `MemoryUtilization`
   - Same dimensions as CPU
7. `aws_cloudwatch_metric_alarm.unhealthy_hosts` -- UnHealthyHostCount >= 1 for 2 min (2 x 60s periods)
   - Metric: `AWS/ApplicationELB` / `UnHealthyHostCount`
   - Dimensions: `TargetGroup + LoadBalancer`

## Success Criteria

- `terraform plan` with `alert_email = "test@example.com"` shows 7 new resources (1 topic + 1 subscription + 5 alarms)
- `terraform plan` with `alert_email = ""` shows 0 alarm/SNS resources
- All alarms send to the SNS topic ARN via `alarm_actions`
- 5xx alarms use `treat_missing_data = "notBreaching"` (no false alarms when there's no traffic)
