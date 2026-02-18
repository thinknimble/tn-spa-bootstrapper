# DNS Configuration for Auto-Generated Subdomains
# Only creates Route53 records when use_custom_domain = false and route53_zone_id is provided

# Data source to get existing Route53 hosted zone
data "aws_route53_zone" "main" {
  count   = var.route53_zone_id != "" && !var.use_custom_domain ? 1 : 0
  zone_id = var.route53_zone_id
}

# DNS record for the auto-generated subdomain
resource "aws_route53_record" "app" {
  count   = var.route53_zone_id != "" && !var.use_custom_domain ? 1 : 0
  zone_id = var.route53_zone_id
  name    = local.app_subdomain  # e.g., myapp-pr-123.kanw.3leafcoder.com
  type    = "CNAME"
  ttl     = 300
  records = [aws_lb.ecs.dns_name]

  # Allow Terraform to overwrite existing records (useful for redeployments)
  allow_overwrite = true
}

# Output the DNS record that was created
output "dns_record" {
  description = "DNS record created (if Route53 zone provided and not using custom domain)"
  value = var.route53_zone_id != "" && !var.use_custom_domain ? aws_route53_record.app[0].fqdn : "No DNS record created - using custom domain or ALB DNS"
}