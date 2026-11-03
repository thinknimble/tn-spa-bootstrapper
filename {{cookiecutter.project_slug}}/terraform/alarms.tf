# Monitoring / Alerting
# All resources gated by alert_email — set to "" to disable alarms entirely.

locals {
  alerting_enabled = var.alert_email != "" ? 1 : 0
}

# ──────────────────────────────────────────────
# SNS Topic + Email Subscription
# ──────────────────────────────────────────────

resource "aws_sns_topic" "alerts" {
  count = local.alerting_enabled
  name  = "${var.service}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "email" {
  count     = local.alerting_enabled
  topic_arn = aws_sns_topic.alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ──────────────────────────────────────────────
# CloudWatch Alarms
# ──────────────────────────────────────────────

# 1. ALB 5xx errors >= 10 in 5 min
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  count               = local.alerting_enabled
  alarm_name          = "${var.service}-${var.environment}-alb-5xx"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"
  alarm_description   = "ALB 5xx errors >= 10 in 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    LoadBalancer = aws_lb.ecs.arn_suffix
  }
}

# 2. Target (app) 5xx errors >= 10 in 5 min
resource "aws_cloudwatch_metric_alarm" "target_5xx" {
  count               = local.alerting_enabled
  alarm_name          = "${var.service}-${var.environment}-target-5xx"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"
  alarm_description   = "Target 5xx errors >= 10 in 5 minutes"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.app.arn_suffix
    LoadBalancer = aws_lb.ecs.arn_suffix
  }
}

# 3. ECS CPU >= 85% for 10 min (2 x 300s periods)
resource "aws_cloudwatch_metric_alarm" "ecs_cpu" {
  count               = local.alerting_enabled
  alarm_name          = "${var.service}-${var.environment}-ecs-cpu"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "ECS CPU utilization >= 85% for 10 minutes"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }
}

# 4. ECS Memory >= 85% for 10 min (2 x 300s periods)
resource "aws_cloudwatch_metric_alarm" "ecs_memory" {
  count               = local.alerting_enabled
  alarm_name          = "${var.service}-${var.environment}-ecs-memory"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 85
  alarm_description   = "ECS memory utilization >= 85% for 10 minutes"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }
}

# 5. Unhealthy hosts >= 1 for 2 min (2 x 60s periods)
resource "aws_cloudwatch_metric_alarm" "unhealthy_hosts" {
  count               = local.alerting_enabled
  alarm_name          = "${var.service}-${var.environment}-unhealthy-hosts"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Unhealthy host count >= 1 for 2 minutes"
  alarm_actions       = [aws_sns_topic.alerts[0].arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.app.arn_suffix
    LoadBalancer = aws_lb.ecs.arn_suffix
  }
}

# ──────────────────────────────────────────────
# Web service deploy failures (EventBridge → SNS)
# ──────────────────────────────────────────────

# A web task that crashes before it registers with the target group (a pending migration,
# a settings import error) never counts as an unhealthy host, so the alarm above misses
# it. Matched on the service group, so every task definition revision is covered. A task
# the scheduler stops during a normal deploy has the stop code `ServiceSchedulerInitiated`
# and does not match.
#
# It fires once per failed task. A deploy that cannot start fails at least 3 tasks
# before the circuit breaker trips, so it sends 3 or more of these, then one
# `app_deployment_failed`.
resource "aws_cloudwatch_event_rule" "app_task_failed" {
  count       = local.alerting_enabled
  name        = "app-task-failed-${var.service}-${var.environment}"
  description = "Fires when a web service task fails to start or its container exits; routes to the alerts topic."

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      clusterArn = [aws_ecs_cluster.main.arn]
      group      = ["service:${aws_ecs_service.app.name}"]
      lastStatus = ["STOPPED"]
      stopCode   = ["TaskFailedToStart", "EssentialContainerExited"]
    }
  })
}

resource "aws_cloudwatch_event_target" "app_task_failed_alert" {
  count     = local.alerting_enabled
  rule      = aws_cloudwatch_event_rule.app_task_failed[0].name
  target_id = "app-task-failed-${var.service}-${var.environment}"
  arn       = aws_sns_topic.alerts[0].arn
}

# The deployment circuit breaker on `aws_ecs_service.app` marks a deploy that cannot
# start as failed and rolls it back. This fires once per failed deploy, after the
# `app_task_failed` alerts for its tasks.
resource "aws_cloudwatch_event_rule" "app_deployment_failed" {
  count       = local.alerting_enabled
  name        = "app-deployment-failed-${var.service}-${var.environment}"
  description = "Fires when a web service deployment fails and is rolled back; routes to the alerts topic."

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Deployment State Change"]
    resources   = [aws_ecs_service.app.id]
    detail = {
      eventName = ["SERVICE_DEPLOYMENT_FAILED"]
    }
  })
}

resource "aws_cloudwatch_event_target" "app_deployment_failed_alert" {
  count     = local.alerting_enabled
  rule      = aws_cloudwatch_event_rule.app_deployment_failed[0].name
  target_id = "app-deployment-failed-${var.service}-${var.environment}"
  arn       = aws_sns_topic.alerts[0].arn
}

# SNS refuses EventBridge publishes unless the topic policy allows the rule. Only the rules
# listed here can publish. A worker with `enable_failure_alert = true` adds its module's
# `failure_rule_arns`, e.g. `module.data_processor.failure_rule_arns`.
resource "aws_sns_topic_policy" "alerts_from_eventbridge" {
  count = local.alerting_enabled
  arn   = aws_sns_topic.alerts[0].arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # The policy SNS gives a new topic; this resource replaces it, so it is restated
      # to keep the CloudWatch alarms above publishing.
      {
        Sid       = "__default_statement_ID"
        Effect    = "Allow"
        Principal = { AWS = "*" }
        Action = [
          "SNS:GetTopicAttributes",
          "SNS:SetTopicAttributes",
          "SNS:AddPermission",
          "SNS:RemovePermission",
          "SNS:DeleteTopic",
          "SNS:Subscribe",
          "SNS:ListSubscriptionsByTopic",
          "SNS:Publish",
        ]
        Resource = aws_sns_topic.alerts[0].arn
        Condition = {
          StringEquals = {
            "AWS:SourceOwner" = data.aws_caller_identity.current.account_id
          }
        }
      },
      {
        Sid       = "AllowEventBridgeRules"
        Effect    = "Allow"
        Principal = { Service = "events.amazonaws.com" }
        Action    = "sns:Publish"
        Resource  = aws_sns_topic.alerts[0].arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = concat(
              aws_cloudwatch_event_rule.app_task_failed[*].arn,
              aws_cloudwatch_event_rule.app_deployment_failed[*].arn,
            )
          }
        }
      },
    ]
  })
}
