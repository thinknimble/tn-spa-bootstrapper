---
id: tf-domain-fallback-alb
parent: environments-config-inheritance
created: 2026-07-21T22:30:00Z
priority: 1
status: done
branch: feature/aws-fargate
---

# Terraform falls back to ALB DNS when no domain is configured

## What Must Be True

When no domain configuration is provided (empty `base_domain`, `use_custom_domain` false), Terraform uses the ALB DNS name as `current_domain` instead of generating a broken subdomain like `myapp-development.`.

## Context

The current `locals.tf` logic:

```hcl
current_domain = var.use_custom_domain ? (
    var.current_domain != "" ? var.current_domain : aws_lb.ecs.dns_name
  ) : local.app_subdomain
```

When `use_custom_domain = false` (default), it always uses `app_subdomain` which is `${var.service}-${var.environment}.${var.base_domain}`. If `base_domain` is empty, this produces `myapp-development.` — an invalid domain that breaks ALLOWED_HOSTS and client URLs.

The ALB DNS fallback only triggers when `use_custom_domain = true` AND `current_domain = ""`, which is counterintuitive.

## Success Criteria

- When `base_domain` is empty AND `use_custom_domain` is false, `current_domain` resolves to `aws_lb.ecs.dns_name` (the ALB's auto-generated DNS)
- When `base_domain` is set AND `use_custom_domain` is false, `current_domain` resolves to the auto-generated subdomain (`${service}-${environment}.${base_domain}`) and Route53 records are created if `route53_zone_id` is provided
- When `use_custom_domain` is true AND `custom_domain` / `current_domain` is set, that domain is used as-is (no Route53 records created by Terraform)
- When `use_custom_domain` is true AND `custom_domain` / `current_domain` is empty, falls back to ALB DNS
- No domain configuration at all (all defaults) results in a working deployment accessible via ALB DNS
