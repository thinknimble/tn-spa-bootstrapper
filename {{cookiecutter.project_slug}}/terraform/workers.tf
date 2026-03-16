# Common variables for all workers
locals {
  common_environment = [
    {
      name  = "DB_HOST"
      value = local.db_host
    },
    {
      name  = "REDIS_HOST"
      value = local.redis_host
    },
    {
      name  = "DEBUG"
      value = var.debug
    },
    {
      name  = "CURRENT_DOMAIN"
      value = local.current_domain
    },
    {
      name  = "CURRENT_PORT"
      value = var.current_port
    },
    {
      name  = "ALLOWED_HOSTS"
      value = var.allowed_hosts
    },
    {
      name  = "STAFF_EMAIL"
      value = var.staff_email
    },
    {
      name  = "USE_AWS_STORAGE"
      value = var.use_aws_storage
    },
    {
      name  = "ENABLE_EMAILS"
      value = var.enable_emails
    },
    {
      name  = "VPC_CIDRS"
      value = "${local.subnet_a_cidr},${local.subnet_b_cidr}"
    }
  ]

  common_secrets = [
    {
      name      = "SECRET_KEY"
      valueFrom = aws_secretsmanager_secret_version.secret_key.arn
    },
    {
      name      = "DJANGO_SUPERUSER_PASSWORD"
      valueFrom = aws_secretsmanager_secret_version.django_superuser_password.arn
    },
    {
      name      = "AWS_ACCESS_KEY_ID"
      valueFrom = aws_secretsmanager_secret_version.aws_access_key_id.arn
    },
    {
      name      = "AWS_SECRET_ACCESS_KEY"
      valueFrom = aws_secretsmanager_secret_version.aws_secret_access_key.arn
    },
    {
      name      = "DB_NAME"
      valueFrom = aws_secretsmanager_secret_version.db_name.arn
    },
    {
      name      = "DB_USER"
      valueFrom = aws_secretsmanager_secret_version.db_user.arn
    },
    {
      name      = "DB_PASS"
      valueFrom = aws_secretsmanager_secret_version.db_pass.arn
    }
  ]
}


