

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
      image     = "${data.aws_ecr_repository.app.repository_url}:${data.aws_ecr_image.app.image_tag}",
      essential = true,
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ],
      environment = [
        {
          name  = "DB_HOST",
          value = local.db_host
        },
        {
          name  = "REDIS_HOST",
          value = local.redis_host
        },
        {
          name  = "DEBUG",
          value = var.debug
        },
        {
          name  = "CURRENT_DOMAIN",
          value = local.current_domain
        },
        {
          name  = "CURRENT_PORT",
          value = var.current_port
        },
        {
          name  = "ALLOWED_HOSTS",
          value = var.allowed_hosts
        },
        {
          name  = "STAFF_EMAIL",
          value = var.staff_email
        },
        {
          name  = "USE_AWS_STORAGE",
          value = var.use_aws_storage
        },
        {
          name  = "ENABLE_EMAILS",
          value = var.enable_emails
        },
        {
          name  = "PLAYWRIGHT_TEST_BASE_URL",
          value = var.playwright_test_base_url
        },
        {
          name  = "PLAYWRIGHT_TEST_USER_PASS",
          value = var.playwright_test_user_pass
        },
        {
          name  = "VPC_CIDRS",
          value = "${local.subnet_a_cidr},${local.subnet_b_cidr}"
        }
      ],
      secrets = [
        {
          name      = "SECRET_KEY",
          valueFrom = aws_secretsmanager_secret_version.secret_key.arn
        },
        {
          name      = "DJANGO_SUPERUSER_PASSWORD",
          valueFrom = aws_secretsmanager_secret_version.django_superuser_password.arn
        },
        {
          name      = "AWS_ACCESS_KEY_ID",
          valueFrom = aws_secretsmanager_secret_version.aws_access_key_id.arn
        },
        {
          name      = "AWS_SECRET_ACCESS_KEY",
          valueFrom = aws_secretsmanager_secret_version.aws_secret_access_key.arn
        },
        {
          name      = "DB_NAME",
          valueFrom = aws_secretsmanager_secret_version.db_name.arn
        },
        {
          name      = "DB_USER",
          valueFrom = aws_secretsmanager_secret_version.db_user.arn
        },
        {
          name      = "DB_PASS",
          valueFrom = aws_secretsmanager_secret_version.db_pass.arn
        }
      ],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.cw_logs.name
          awslogs-region        = "us-east-1"
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
    path     = "/health"
    matcher  = "200-399"  # Accept redirects and success responses
  }

  tags = {
    Name = "http-${var.service}-${var.environment}"
  }
  lifecycle {
    prevent_destroy = false
  }
}





resource "aws_ecs_service" "app" {
  name                   = "service-app-${var.service}-${var.environment}"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.app.arn
  desired_count          = 1
  launch_type            = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = [aws_subnet.public.id, aws_subnet.public_b.id]
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app-${var.service}-${var.environment}"
    container_port   = 8000
  }

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
