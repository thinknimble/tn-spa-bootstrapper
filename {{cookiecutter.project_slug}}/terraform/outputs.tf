# Infrastructure Outputs

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.ecs.dns_name
}

output "application_domain" {
  description = "The domain where your application will be accessible"
  value       = local.current_domain
}

output "application_url" {
  description = "Full URL to access your application"
  value       = var.enable_https ? "https://${local.current_domain}" : "http://${local.current_domain}"
}

output "dns_status" {
  description = "DNS configuration status"
  value = var.use_custom_domain ? "⚠️ Using custom domain - DNS managed externally" : (var.route53_zone_id != "" ? "✅ DNS record created: ${local.app_subdomain}" : "⚠️ No Route53 zone provided - using ALB DNS")
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

# Certificate information
output "certificate_arn" {
  description = "ARN of the SSL certificate being used"
  value       = var.enable_https ? local.certificate_arn : "N/A - HTTPS disabled"
}

output "certificate_type" {
  description = "Type of certificate being used"
  value       = var.custom_certificate_arn != "" ? "custom" : "default"
}