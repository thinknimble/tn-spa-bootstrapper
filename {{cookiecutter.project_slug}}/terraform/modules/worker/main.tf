resource "aws_ecs_task_definition" "worker" {
  family                   = "task-${var.name}-${var.service}-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "${var.name}-${var.service}-${var.environment}"
      image     = var.image_uri
      essential = true
      command   = var.command

      stopTimeout = var.stop_timeout
      environment = var.environment_variables
      secrets     = var.secrets

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.log_group_name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "worker-${var.name}"
        }
      }
    }
  ])

  tags = {
    Name = "task-${var.name}-${var.service}-${var.environment}"
  }
}

resource "aws_ecs_service" "worker" {
  name                   = "service-${var.name}-${var.service}-${var.environment}"
  cluster                = var.cluster_id
  task_definition        = aws_ecs_task_definition.worker.arn
  desired_count          = var.desired_count
  launch_type            = "FARGATE"
  enable_execute_command = true

  deployment_minimum_healthy_percent = var.deployment_minimum_healthy_percent
  deployment_maximum_percent         = var.deployment_maximum_percent

  network_configuration {
    subnets          = var.subnets
    security_groups  = var.security_groups
    assign_public_ip = true
  }

  tags = {
    Name = "service-${var.name}-${var.service}-${var.environment}"
  }

  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_cloudwatch_event_rule" "failure" {
  count       = var.enable_failure_alert ? 1 : 0
  name        = "${var.name}-failure-${var.service}-${var.environment}"
  description = "Fires when the ${var.name} worker stops with a non-zero exit code or never starts."

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      lastStatus        = ["STOPPED"]
      taskDefinitionArn = [aws_ecs_task_definition.worker.arn]
      "$or" = [
        { containers = { exitCode = [{ "anything-but" = 0 }] } },
        { stopCode = ["TaskFailedToStart", "EssentialContainerExited"] },
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "failure_alert" {
  count     = var.enable_failure_alert ? 1 : 0
  rule      = aws_cloudwatch_event_rule.failure[0].name
  target_id = "${var.name}-failure-${var.service}-${var.environment}"
  arn       = var.alerts_topic_arn

  lifecycle {
    precondition {
      condition     = var.alerts_topic_arn != ""
      error_message = "enable_failure_alert is true but alerts_topic_arn is empty."
    }
  }
}
