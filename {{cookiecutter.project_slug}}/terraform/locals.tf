# locals

locals {
  # Map environment to VPC name suffix
  # PR environments (pr-*) and dev share the dev VPC
  vpc_environment = (
    var.environment == "staging" || var.environment == "production"
      ? var.environment : "dev"
  )
  shared_vpc_name = "${var.shared_vpc_name}-${local.vpc_environment}"
  
  # Resource name components (with length limits for AWS services)
  # ALB names: max 32 chars, alphanumeric and hyphens only
  alb_name = substr("${var.service}-${var.environment}", 0, 32)
  
  # Target group names: max 32 chars, alphanumeric and hyphens only  
  tg_name = substr("http-${var.service}-${var.environment}", 0, 32)
  
  # DB identifier: max 63 chars, lowercase alphanumeric and hyphens only
  db_identifier = substr("db-${var.service}-${var.environment}", 0, 63)
  
  # ElastiCache cluster: max 50 chars, lowercase alphanumeric and hyphens only
  redis_cluster_id = substr("redis-${var.service}-${var.environment}", 0, 50)
  
  db_endpoint     = aws_db_instance.postgres.endpoint
  db_host         = regex("^(.*):\\d+$", local.db_endpoint)[0]
  redis_host      = aws_elasticache_cluster.redis.cache_nodes[0].address
  
  # Auto-generate subdomain using base domain
  app_subdomain  = "${var.service}-${var.environment}.${var.base_domain}"
  
  # Domain logic:
  # - If use_custom_domain = true: use current_domain (user manages DNS), fallback to ALB DNS
  # - If use_custom_domain = false AND base_domain set: use auto-generated subdomain (Route53 managed)
  # - If use_custom_domain = false AND base_domain empty: fallback to ALB DNS
  current_domain = var.use_custom_domain ? (
    var.current_domain != "" ? var.current_domain : aws_lb.ecs.dns_name
  ) : (
    var.base_domain != "" ? local.app_subdomain : aws_lb.ecs.dns_name
  )
  
  # Certificate logic with backward compatibility
  # Priority: certificate_arn -> custom_certificate_arn -> default_certificate_arn
  certificate_arn = var.certificate_arn != "" ? var.certificate_arn : (
    var.custom_certificate_arn != "" ? var.custom_certificate_arn : var.default_certificate_arn
  )

  vpc_id         = data.aws_vpc.shared.id

  # Environment and secrets for every container that runs the app image: the web
  # service, workers (modules/worker) and one-off tasks. `scripts/add_env_var.sh`
  # adds new variables here.
  task_environment = [
    { name = "DB_HOST", value = local.db_host },
    { name = "REDIS_HOST", value = local.redis_host },
    { name = "DEBUG", value = var.debug },
    { name = "CURRENT_DOMAIN", value = local.current_domain },
    { name = "CURRENT_PORT", value = var.current_port },
    { name = "ALLOWED_HOSTS", value = var.allowed_hosts },
    { name = "STAFF_EMAIL", value = var.staff_email },
    { name = "USE_AWS_STORAGE", value = tostring(var.use_aws_storage) },
    { name = "ENABLE_EMAILS", value = tostring(var.enable_emails) },
    { name = "PLAYWRIGHT_TEST_BASE_URL", value = var.playwright_test_base_url },
    { name = "VPC_CIDRS", value = data.aws_vpc.shared.cidr_block },
    { name = "ENVIRONMENT", value = var.environment },
  ]

  task_secrets = [
    { name = "SECRET_KEY", valueFrom = aws_secretsmanager_secret_version.secret_key.arn },
    { name = "DJANGO_SUPERUSER_PASSWORD", valueFrom = aws_secretsmanager_secret_version.django_superuser_password.arn },
    { name = "AWS_ACCESS_KEY_ID", valueFrom = aws_secretsmanager_secret_version.aws_access_key_id.arn },
    { name = "AWS_SECRET_ACCESS_KEY", valueFrom = aws_secretsmanager_secret_version.aws_secret_access_key.arn },
    { name = "DB_NAME", valueFrom = aws_secretsmanager_secret_version.db_name.arn },
    { name = "DB_USER", valueFrom = aws_secretsmanager_secret_version.db_user.arn },
    { name = "DB_PASS", valueFrom = aws_secretsmanager_secret_version.db_pass.arn },
    { name = "PLAYWRIGHT_TEST_USER_PASS", valueFrom = aws_secretsmanager_secret_version.playwright_test_user_pass.arn },
    { name = "ROLLBAR_ACCESS_TOKEN", valueFrom = aws_secretsmanager_secret_version.rollbar_access_token.arn },
  ]
}
