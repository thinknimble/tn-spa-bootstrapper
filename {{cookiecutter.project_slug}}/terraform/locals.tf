# locals

locals {
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
  
  # Certificate logic: use custom certificate if provided, otherwise use default certificate
  certificate_arn = var.custom_certificate_arn != "" ? var.custom_certificate_arn : var.default_certificate_arn
}
