# EventBridge Scheduled Tasks for Django Commands
# This allows running Django management commands on a schedule

# IAM role for EventBridge to trigger ECS tasks
resource "aws_iam_role" "eventbridge_ecs_role" {
  name = "eventbridge-ecs-role-${var.service}-${var.environment}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "eventbridge-ecs-role-${var.service}-${var.environment}"
  }
}

resource "aws_iam_role_policy" "eventbridge_ecs_policy" {
  name = "eventbridge-ecs-policy-${var.service}-${var.environment}"
  role = aws_iam_role.eventbridge_ecs_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask"
        ]
        Resource = [
          "arn:aws:ecs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:task-definition/task-django-scheduler-${var.service}-${var.environment}:*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          aws_iam_role.ecs_tasks_execution_role.arn,
          aws_iam_role.ecs_task_role.arn
        ]
      }
    ]
  })
}

# Data sources for current AWS account and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

