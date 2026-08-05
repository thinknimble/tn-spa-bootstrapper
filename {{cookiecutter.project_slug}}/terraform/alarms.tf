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
