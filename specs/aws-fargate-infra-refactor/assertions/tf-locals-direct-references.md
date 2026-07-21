---
id: tf-locals-direct-references
parent: aws-fargate-infra-refactor
created: 2026-07-20T23:00:00Z
priority: 1
status: not_started
depends-on: tf-mandatory-vpc-data-sources
branch: feature/aws-fargate
---

# Terraform: locals.tf References VPC Data Sources Directly

## What Must Be True

`locals.tf` assigns VPC-related local values by referencing data source attributes directly. No `try()`, `length()`, ternary conditionals, or fallback logic exists for VPC/IGW/route-table IDs.

## Success Criteria

- `local.vpc_id` (or equivalent) is assigned as `data.aws_vpc.shared.id` -- no `try()`, no `length()`, no conditional
- `local.igw_id` (or equivalent) is assigned as `data.aws_internet_gateway.shared.id`
- `local.route_table_id` (or equivalent) is assigned as `data.aws_route_table.shared.id`
- Subnet IDs reference data source attributes directly
- No references to `aws_vpc.main` or `aws_vpc.shared[0]` (indexed resource references from the old conditional pattern) remain
- The locals block is shorter and more readable than the previous version with fallback logic
