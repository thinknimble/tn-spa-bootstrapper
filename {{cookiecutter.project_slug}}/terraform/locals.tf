# locals

locals {
  # Shared VPC name for environments
  # Can be account-wide (shared-dev-vpc) or per-project (shared-dev-vpc-PROJECT)
  # Include environment in name for staging and production
  shared_vpc_name =  (
    var.environment == "staging" || var.environment == "production" ? 
      "${var.shared_vpc_name}-${var.environment}" : var.shared_vpc_name
  )
  
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
}
