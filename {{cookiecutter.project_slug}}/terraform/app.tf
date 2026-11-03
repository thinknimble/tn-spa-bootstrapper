

# allow ECS to access SecretsManager
data "aws_iam_policy_document" "ecs_secretsmanager_policy" {
  statement {
    effect = "Allow"
    actions = [
      # "secretsmanager:DescribeSecret",
      "secretsmanager:GetSecretValue",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ecs_secretsmanager_policy" {
  name   = "ecs-ssm-policy-${var.service}-${var.environment}"
  role   = aws_iam_role.ecs_tasks_execution_role.name
  policy = data.aws_iam_policy_document.ecs_secretsmanager_policy.json
}

resource "aws_iam_role" "ecs_task_role" {
  name               = "ecs-task-role-${var.service}-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_execution_role.json
}

data "aws_iam_policy_document" "ecs_ssm_policy" {
  statement {
    effect = "Allow"
    actions = [
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "ecs_exec_policy" {
  name   = "ecs-ssm-policy-${var.service}-${var.environment}"
  role   = aws_iam_role.ecs_task_role.name
  policy = data.aws_iam_policy_document.ecs_ssm_policy.json
}

resource "aws_ecs_task_definition" "app" {
  family                   = "task-app-${var.service}-${var.environment}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_tasks_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  container_definitions = jsonencode([
    {
      name      = "app-${var.service}-${var.environment}",
      image     = "${data.aws_ecr_repository.app.repository_url}:${var.skip_ecr_image_lookup ? var.ecr_tag : data.aws_ecr_image.app[0].image_tag}",
      essential = true,
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ],
      environment = local.task_environment,
      secrets     = local.task_secrets,
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.cw_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}


resource "aws_lb_target_group" "app" {
  name        = local.tg_name
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = local.vpc_id

  health_check {
    protocol = "HTTP"
    path     = "/health/"
    matcher  = "200-399"  # Accept redirects and success responses
  }

  tags = {
    Name = "http-${var.service}-${var.environment}"
  }
  lifecycle {
    prevent_destroy = false
  }
}





# Each new task definition migrates in a one-off task before the service rolls out, so a
# deploy has one schema writer and a failed migration fails the apply with the service
# untouched. The web container only checks that no migration is pending
# (`compose/server/tf/start`). `depends_on` lists what the task needs to start and reach
# its database and cache; none of it is a reference of the task definition.
# Needs the AWS CLI wherever terraform apply runs.
resource "terraform_data" "migrate" {
  triggers_replace = [aws_ecs_task_definition.app.arn]

  provisioner "local-exec" {
    command = "${path.module}/scripts/run-migrations.sh"
    environment = {
      CLUSTER         = aws_ecs_cluster.main.name
      TASK_DEF        = aws_ecs_task_definition.app.arn
      CONTAINER       = "app-${var.service}-${var.environment}"
      SUBNETS         = join(",", data.aws_subnets.shared.ids)
      SECURITY_GROUPS = aws_security_group.app.id
      LOG_GROUP       = aws_cloudwatch_log_group.cw_logs.name
      AWS_REGION      = var.aws_region
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.ecs_tasks_execution_role,
    aws_iam_role_policy.ecs_secretsmanager_policy,
    aws_security_group_rule.allow_all_egress,
    aws_security_group_rule.rds,
    aws_security_group_rule.redis_from_app,
    aws_db_instance.postgres,
    aws_elasticache_cluster.redis,
  ]
}

resource "aws_ecs_service" "app" {
  name                   = "service-app-${var.service}-${var.environment}"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.app.arn
  desired_count          = 1
  launch_type            = "FARGATE"
  enable_execute_command = true

  # A deploy whose tasks never become healthy is marked failed and rolled back to the
  # last completed deployment, instead of relaunching the new task indefinitely. The
  # old task keeps serving throughout; `app_deployment_failed` turns the failure into
  # an alert.
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = data.aws_subnets.shared.ids
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app-${var.service}-${var.environment}"
    container_port   = 8000
  }

  depends_on = [terraform_data.migrate]

  lifecycle {
    prevent_destroy = false
  }
}


# resource "aws_vpc_security_group_ingress_rule" "app" {
#   security_group_id = aws_security_group.ecs.id
#   from_port         = 8000
#   to_port           = 8000
#   ip_protocol       = "tcp"
#   cidr_ipv4         = "0.0.0.0/0" # TODO: update this to the the CIDR of the load balancer
# }
