resource "aws_cloudwatch_log_group" "cw_logs" {
    name              = "/ecs/${var.service}/${var.environment}"
    retention_in_days = 7

    tags = {
        Name = "cw-logs-${var.service}-${var.environment}"
    }
}