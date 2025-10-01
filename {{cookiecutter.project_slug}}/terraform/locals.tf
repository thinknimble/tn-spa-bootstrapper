# locals

locals {
  # VPC sharing logic for development environments only
  # Share VPC for: development, pr-* (in dev AWS account 123456789012)
  # Dedicated VPC for: production, staging (in separate accounts)
  is_shared_vpc_env = var.environment == "development" || can(regex("^pr-", var.environment))
  
  # Shared VPC name for development environments
  shared_vpc_name = "shared-dev-vpc"
  
  # Environment-specific subnet CIDR calculation for shared VPC
  # Extract PR number for pr-* environments, use 10 for development
  env_cidr_base = local.is_shared_vpc_env ? (
    var.environment == "development" ? 10 : (
      can(regex("^pr-([0-9]+)", var.environment)) ? 
        tonumber(regex("^pr-([0-9]+)", var.environment)[0]) : 30
    )
  ) : 1
  
  # Calculate subnet CIDRs for shared VPC (10.0.X.0/24 and 10.0.Y.0/24)
  subnet_a_cidr = local.is_shared_vpc_env ? "10.0.${local.env_cidr_base}.0/24" : "10.0.1.0/24"
  subnet_b_cidr = local.is_shared_vpc_env ? "10.0.${local.env_cidr_base + 100}.0/24" : "10.0.2.0/24"
  
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
  # - If use_custom_domain = true: use current_domain (user manages DNS)
  # - If use_custom_domain = false: use auto-generated subdomain (Route53 managed)
  # - Fallback to ALB DNS if nothing is set
  current_domain = var.use_custom_domain ? (
    var.current_domain != "" ? var.current_domain : aws_lb.ecs.dns_name
  ) : local.app_subdomain
  
  # Certificate logic with backward compatibility
  # Priority: certificate_arn -> custom_certificate_arn -> default_certificate_arn
  certificate_arn = var.certificate_arn != "" ? var.certificate_arn : (
    var.custom_certificate_arn != "" ? var.custom_certificate_arn : var.default_certificate_arn
  )
}
