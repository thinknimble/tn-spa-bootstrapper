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
      
      environment = var.environment_variables
      secrets     = var.secrets
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.log_group_name
          awslogs-region        = "us-east-1"
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